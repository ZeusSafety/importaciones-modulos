"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  HiArrowLongRight,
  HiOutlineArrowPath,
  HiOutlineBell,
  HiOutlineBellSlash,
  HiOutlineCheck,
  HiOutlineExclamationTriangle,
  HiOutlineUser,
} from "react-icons/hi2";
import { TONO_ESTADO_PRE_NEGOCIACION } from "@/modules/pre-negociaciones/presentation/tonosEstado";
import { fechaLocalDe, formatearFecha, ZONA_HORARIA } from "@/modules/shared/domain/fechas";
import { obtenerJson } from "@/modules/shared/infrastructure/http/clienteHttp";
import { useMinutoActual } from "@/modules/shared/presentation/hooks/useMinutoActual";
import { ESTILO_BOTON_CABECERA } from "@/modules/shared/presentation/layout/ControlesCabecera";
import { RUTAS } from "@/modules/shared/presentation/layout/navegacion";
import { Insignia } from "@/modules/shared/presentation/ui/Insignia";
import type { EventoBitacora, ModuloBitacora } from "../../domain/EventoBitacora";
import { COLOR_ESTADO, estiloDe, transicionDe } from "../estiloEventoBitacora";
import { estaLeida, marcarLeida, marcarTodasLeidas, useEstadoLectura } from "./estadoLectura";

const LIMITE = 40;
const INTERVALO_ACTUALIZACION_MS = 20_000;
const MINUTO_MS = 60_000;

const DESTINO_MODULO: Record<ModuloBitacora, { etiqueta: string; ruta: string }> = {
  COTIZACIONES: { etiqueta: "Negociación", ruta: RUTAS.cotizaciones },
  "REQUERIMIENTOS LOGISTICA": { etiqueta: "Requerimientos", ruta: RUTAS.requerimientosLogistica },
};

const FORMATO_HORA = new Intl.DateTimeFormat("es-PE", { timeZone: ZONA_HORARIA, hour: "2-digit", minute: "2-digit", hour12: true });

type Filtro = "todas" | "sinLeer";

function tiempoRelativo(iso: string, ahora: number | null): string {
  if (ahora === null) return FORMATO_HORA.format(new Date(iso));
  const minutos = Math.floor((ahora - new Date(iso).getTime()) / MINUTO_MS);
  if (minutos < 1) return "Justo ahora";
  if (minutos < 60) return `Hace ${minutos} min`;
  if (minutos < 24 * 60) return `Hace ${Math.floor(minutos / 60)} h`;
  return FORMATO_HORA.format(new Date(iso));
}

function etiquetaDia(iso: string, ahora: number | null): string {
  const dia = fechaLocalDe(iso);
  if (ahora !== null) {
    if (dia === fechaLocalDe(new Date(ahora).toISOString())) return "Hoy";
    if (dia === fechaLocalDe(new Date(ahora - 24 * 60 * MINUTO_MS).toISOString())) return "Ayer";
  }
  return formatearFecha(iso);
}

function agruparPorDia(eventos: readonly EventoBitacora[], ahora: number | null) {
  const grupos: { dia: string; eventos: EventoBitacora[] }[] = [];
  for (const evento of eventos) {
    const dia = etiquetaDia(evento.fecha, ahora);
    const ultimo = grupos.at(-1);
    if (ultimo?.dia === dia) ultimo.eventos.push(evento);
    else grupos.push({ dia, eventos: [evento] });
  }
  return grupos;
}

export function CentroNotificaciones() {
  const ruta = usePathname();
  const ahora = useMinutoActual();
  const lectura = useEstadoLectura();
  const [eventos, setEventos] = useState<EventoBitacora[] | null>(null);
  const [fallo, setFallo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [timbre, setTimbre] = useState(0);
  const contenedor = useRef<HTMLDivElement>(null);
  const conocidos = useRef<Set<string> | null>(null);

  const actualizar = useCallback(async () => {
    setCargando(true);
    try {
      const recientes = await obtenerJson<EventoBitacora[]>(`/api/bitacora?limite=${LIMITE}`);
      const previos = conocidos.current;
      if (previos !== null && recientes.some((evento) => !previos.has(evento.id))) setTimbre((valor) => valor + 1);
      conocidos.current = new Set(recientes.map((evento) => evento.id));
      setEventos(recientes);
      setFallo(false);
    } catch {
      setFallo(true);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const primera = window.setTimeout(() => void actualizar(), 0);
    const intervalo = window.setInterval(() => void actualizar(), INTERVALO_ACTUALIZACION_MS);
    const alEnfocar = () => void actualizar();
    window.addEventListener("focus", alEnfocar);
    return () => {
      window.clearTimeout(primera);
      window.clearInterval(intervalo);
      window.removeEventListener("focus", alEnfocar);
    };
  }, [actualizar, ruta]);

  useEffect(() => {
    if (!abierto) return;
    const alPresionarFuera = (evento: PointerEvent) => {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
    };
    const alPresionarEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAbierto(false);
    };
    document.addEventListener("pointerdown", alPresionarFuera);
    document.addEventListener("keydown", alPresionarEscape);
    return () => {
      document.removeEventListener("pointerdown", alPresionarFuera);
      document.removeEventListener("keydown", alPresionarEscape);
    };
  }, [abierto]);

  const lista = eventos ?? [];
  const sinLeer = lista.filter((evento) => !estaLeida(lectura, evento));
  const visibles = filtro === "sinLeer" ? sinLeer : lista;
  const grupos = agruparPorDia(visibles, ahora);

  const alternar = () => {
    if (!abierto) void actualizar();
    setAbierto((valor) => !valor);
  };

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        onClick={alternar}
        aria-label={sinLeer.length > 0 ? `Notificaciones, ${sinLeer.length} sin leer` : "Notificaciones"}
        aria-expanded={abierto}
        aria-haspopup="dialog"
        title="Notificaciones"
        className={`${ESTILO_BOTON_CABECERA} relative ${abierto ? "border-zeus-azul/30 bg-zeus-celeste text-zeus-tinta" : ""}`}
      >
        <motion.span
          key={timbre}
          className="flex origin-top"
          animate={timbre > 0 ? { rotate: [0, -16, 14, -10, 8, -4, 0] } : undefined}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        >
          <HiOutlineBell className="h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110" />
        </motion.span>
        <AnimatePresence>
          {sinLeer.length > 0 && (
            <motion.span
              key="contador"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-[#f43f5e] to-[#dc2626] px-1 font-display text-[10px] font-bold leading-none text-white shadow-md ring-2 ring-superficie"
            >
              {sinLeer.length > 9 ? "9+" : sinLeer.length}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            role="dialog"
            aria-label="Notificaciones"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.14 } }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="z-50 flex origin-top-right flex-col overflow-hidden rounded-2xl border border-slate-200 bg-superficie shadow-[0_24px_60px_-15px_rgba(0,31,61,0.45)] max-sm:fixed max-sm:inset-x-3 max-sm:top-[4.5rem] sm:absolute sm:right-0 sm:top-[calc(100%+10px)] sm:w-[400px]"
          >
            <header className="border-b border-slate-200">
              <div className="h-1 bg-gradient-to-r from-zeus-azul via-zeus-azul-medio to-zeus-dorado" aria-hidden />
              <div className="flex items-center gap-3 px-4 pb-3 pt-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zeus-azul-medio to-zeus-azul text-white shadow-md shadow-zeus-azul/25">
                  <HiOutlineBell className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[15px] font-semibold text-slate-900">Notificaciones</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    {sinLeer.length === 0 ? "Está al día" : `${sinLeer.length} sin leer`} · {lista.length} en total
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void actualizar()}
                  aria-label="Actualizar notificaciones"
                  title="Actualizar"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-zeus-tinta"
                >
                  <HiOutlineArrowPath className={`h-4 w-4 ${cargando ? "animate-spin" : ""}`} />
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 px-4 pb-3">
                <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[11px] font-semibold">
                  {(
                    [
                      ["todas", "Todas", lista.length],
                      ["sinLeer", "Sin leer", sinLeer.length],
                    ] as const
                  ).map(([valor, texto, cantidad]) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() => setFiltro(valor)}
                      aria-pressed={filtro === valor}
                      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 transition ${
                        filtro === valor ? "bg-superficie text-zeus-tinta shadow-sm" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {texto}
                      <span
                        className={`rounded-full px-1.5 font-display text-[10px] tabular-nums ${
                          filtro === valor ? "bg-zeus-azul text-white" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {cantidad}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={sinLeer.length === 0}
                  onClick={() => lista[0] && marcarTodasLeidas(lista[0].fecha)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-zeus-tinta transition hover:bg-zeus-celeste disabled:pointer-events-none disabled:opacity-40"
                >
                  <HiOutlineCheck className="h-3.5 w-3.5" /> Marcar todo como leído
                </button>
              </div>
            </header>

            <div className="scroll-zeus max-h-[min(440px,calc(100vh-14rem))] overflow-y-auto">
              {fallo && eventos === null ? (
                <EstadoPanel
                  icono={<HiOutlineExclamationTriangle className="h-6 w-6" />}
                  titulo="No se pudieron cargar"
                  texto="Revise su conexión e intente de nuevo."
                  accion={{ texto: "Reintentar", alPulsar: () => void actualizar() }}
                />
              ) : eventos === null ? (
                <div className="space-y-3 p-4">
                  {[0, 1, 2].map((indice) => (
                    <div key={indice} className="flex gap-3">
                      <span className="h-9 w-9 animate-pulse rounded-xl bg-slate-200" />
                      <span className="flex-1 space-y-2 pt-1">
                        <span className="block h-3 w-2/3 animate-pulse rounded bg-slate-200" />
                        <span className="block h-2.5 w-1/2 animate-pulse rounded bg-slate-100" />
                      </span>
                    </div>
                  ))}
                </div>
              ) : visibles.length === 0 ? (
                <EstadoPanel
                  icono={<HiOutlineBellSlash className="h-6 w-6" />}
                  titulo={filtro === "sinLeer" ? "Todo al día" : "Sin notificaciones"}
                  texto={
                    filtro === "sinLeer"
                      ? "No tiene notificaciones pendientes de leer."
                      : "Aquí aparecerán los registros, cambios de estado y aprobaciones."
                  }
                />
              ) : (
                grupos.map((grupo) => (
                  <section key={grupo.dia}>
                    <p className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50/95 px-4 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 backdrop-blur">
                      {grupo.dia}
                    </p>
                    <ul>
                      {grupo.eventos.map((evento) => (
                        <ItemNotificacion
                          key={evento.id}
                          evento={evento}
                          leida={estaLeida(lectura, evento)}
                          ahora={ahora}
                          alAbrir={() => {
                            marcarLeida(evento.id);
                            setAbierto(false);
                          }}
                        />
                      ))}
                    </ul>
                  </section>
                ))
              )}
            </div>

            <Link
              href={RUTAS.principal}
              onClick={() => setAbierto(false)}
              className="group flex items-center justify-center gap-1.5 border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-zeus-tinta transition hover:bg-zeus-celeste"
            >
              Ver toda la actividad en Bitácora
              <HiArrowLongRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface PropsItem {
  evento: EventoBitacora;
  leida: boolean;
  ahora: number | null;
  alAbrir: () => void;
}

function ItemNotificacion({ evento, leida, ahora, alAbrir }: PropsItem) {
  const transicion = transicionDe(evento);
  const estilo = estiloDe(evento, transicion);
  const Icono = estilo.icono;
  const destino = DESTINO_MODULO[evento.modulo];

  return (
    <li className="border-b border-slate-100 last:border-b-0">
      <Link
        href={destino.ruta}
        onClick={alAbrir}
        className={`relative flex gap-3 px-4 py-3 transition hover:bg-zeus-celeste/50 ${leida ? "" : "bg-zeus-celeste/30"}`}
      >
        {!leida && <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-zeus-dorado" aria-hidden />}
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-md ${estilo.avatar}`}>
          <Icono className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className={`truncate font-display text-[13px] ${leida ? "font-medium text-slate-700" : "font-semibold text-slate-900"}`}>
              {evento.referencia}
            </span>
            <span className={`shrink-0 rounded-md px-1.5 py-0.5 font-display text-[9px] font-bold uppercase tracking-wide ${estilo.insignia}`}>
              {estilo.texto}
            </span>
          </span>
          {transicion ? (
            <span className="mt-1 flex flex-wrap items-center gap-1.5" aria-label={`De ${transicion.desde} a ${transicion.hacia}`}>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-superficie px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-wide text-slate-500">
                <span className={`h-1.5 w-1.5 rounded-full ${COLOR_ESTADO[transicion.desde].punto}`} aria-hidden />
                {transicion.desde}
              </span>
              <HiArrowLongRight className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              <Insignia tono={TONO_ESTADO_PRE_NEGOCIACION[transicion.hacia]} texto={transicion.hacia} />
            </span>
          ) : (
            <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-slate-600">{evento.descripcion}</span>
          )}
          <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] font-medium text-slate-500">
            <span className={leida ? "" : "font-semibold text-zeus-tinta"}>{tiempoRelativo(evento.fecha, ahora)}</span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1">
              <HiOutlineUser className="h-3 w-3" />
              {evento.usuario}
            </span>
            <span className="text-slate-300">•</span>
            <span>{destino.etiqueta}</span>
          </span>
        </span>
        {!leida && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#2563eb] shadow-[0_0_0_3px_rgba(37,99,235,0.15)]" aria-label="Sin leer" />}
      </Link>
    </li>
  );
}

interface PropsEstadoPanel {
  icono: ReactNode;
  titulo: string;
  texto: string;
  accion?: { texto: string; alPulsar: () => void };
}

function EstadoPanel({ icono, titulo, texto, accion }: PropsEstadoPanel) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zeus-celeste text-zeus-tinta shadow-inner">{icono}</span>
      <p className="mt-3 font-display text-sm font-semibold text-slate-900">{titulo}</p>
      <p className="mt-1 max-w-[16rem] text-xs text-slate-500">{texto}</p>
      {accion && (
        <button
          type="button"
          onClick={accion.alPulsar}
          className="mt-3 rounded-lg bg-zeus-azul px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-zeus-azul-medio"
        >
          {accion.texto}
        </button>
      )}
    </div>
  );
}
