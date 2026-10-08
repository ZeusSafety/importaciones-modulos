"use client";

import { animate, AnimatePresence, motion, type AnimationPlaybackControls } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as EventoPuntero, type ReactNode } from "react";
import { HiMinus, HiOutlineArrowPath, HiOutlineGlobeAmericas, HiOutlineMapPin, HiPlus } from "react-icons/hi2";
import { BanderaPais } from "@/modules/pre-negociaciones/presentation/BanderaPais";
import type { OrigenPanelDto } from "../../application/ObtenerPanelPrincipal";
import { ALTO_MAPA, ANCHO_MAPA, copiaCercana, destinoDeRuta, rutaCurva, type Punto } from "./proyeccion";
import { RUTA_TIERRA } from "./tierra.generado";
import { DESTINO, ubicacionDePais, ubicacionDePuerto, type UbicacionEnMapa } from "./ubicaciones";

/** Colores fijos: se usan como trazo SVG y no cambian con el modo oscuro. */
const COLORES = ["#2563eb", "#f97316", "#7c3aed", "#059669", "#e11d48", "#0891b2", "#d97706"] as const;
const DORADO = "#e5a017";

const ZOOM_MINIMO = 1;
const ZOOM_MAXIMO = 6;
/** El mundo se dibuja tres veces en horizontal para que el desplazamiento dé la vuelta sin cortes. */
const COPIAS = [-ANCHO_MAPA, 0, ANCHO_MAPA] as const;
const UMBRAL_ARRASTRE = 4;

const POSICION_TARJETA: Record<UbicacionEnMapa["lado"], string> = {
  arriba: "-translate-x-1/2 -translate-y-[calc(100%+12px)]",
  abajo: "-translate-x-1/2 translate-y-3",
  izquierda: "-translate-x-[calc(100%+12px)] -translate-y-1/2",
  derecha: "translate-x-3 -translate-y-1/2",
  abajoDerecha: "-translate-x-4 translate-y-3",
};

/** Centro de la vista en unidades del mapa y nivel de zoom. */
interface Camara {
  readonly x: number;
  readonly y: number;
  readonly k: number;
}

/** Centrada un poco al este para que Asia, el Pacífico y el Callao entren completos. */
const CAMARA_INICIAL: Camara = { x: ANCHO_MAPA * 0.56, y: ALTO_MAPA / 2, k: 1 };

function limitar(valor: number, minimo: number, maximo: number) {
  return Math.min(maximo, Math.max(minimo, valor));
}

function normalizar({ x, y, k }: Camara): Camara {
  const zoom = limitar(k, ZOOM_MINIMO, ZOOM_MAXIMO);
  const medioAlto = ALTO_MAPA / (2 * zoom);
  return { k: zoom, x: ((x % ANCHO_MAPA) + ANCHO_MAPA) % ANCHO_MAPA, y: limitar(y, medioAlto, ALTO_MAPA - medioAlto) };
}

interface OrigenEnMapa extends OrigenPanelDto {
  readonly color: string;
  readonly ubicacion: UbicacionEnMapa | null;
  readonly puertosEnMapa: readonly { readonly puerto: string; readonly preNegociaciones: number; readonly punto: Punto }[];
}

function prepararOrigenes(origenes: readonly OrigenPanelDto[]): OrigenEnMapa[] {
  return origenes.map((origen, indice) => ({
    ...origen,
    color: COLORES[indice % COLORES.length],
    ubicacion: ubicacionDePais(origen.pais),
    puertosEnMapa: origen.puertos.flatMap(({ puerto, preNegociaciones }) => {
      const punto = ubicacionDePuerto(origen.pais, puerto);
      return punto ? [{ puerto, preNegociaciones, punto }] : [];
    }),
  }));
}

/** Encuadre que muestra el país, sus puertos y la ruta completa hasta el Callao. */
function encuadreDe(origen: OrigenEnMapa): Camara | null {
  if (origen.ubicacion === null) return null;
  const puntos = [origen.ubicacion.centro, ...origen.puertosEnMapa.map((p) => p.punto)];
  puntos.push(destinoDeRuta(origen.ubicacion.centro, DESTINO.punto));
  const xs = puntos.map((p) => p.x);
  const ys = puntos.map((p) => p.y);
  const [minX, maxX] = [Math.min(...xs), Math.max(...xs)];
  /** Margen arriba para el arco de la ruta y abajo para la tarjeta del Callao. */
  const [minY, maxY] = [Math.min(...ys) - 70, Math.max(...ys) + 45];
  const k = Math.min((ANCHO_MAPA * 0.7) / Math.max(maxX - minX, 1), (ALTO_MAPA * 0.7) / Math.max(maxY - minY, 1));
  return normalizar({ x: (minX + maxX) / 2, y: (minY + maxY) / 2, k: Math.min(k, 4) });
}

interface PropsBotonControl {
  etiqueta: string;
  deshabilitado?: boolean;
  alPulsar: () => void;
  children: ReactNode;
}

function BotonControl({ etiqueta, deshabilitado = false, alPulsar, children }: PropsBotonControl) {
  return (
    <button
      type="button"
      title={etiqueta}
      aria-label={etiqueta}
      onClick={alPulsar}
      disabled={deshabilitado}
      className="flex h-8 w-8 items-center justify-center border-b border-slate-200/80 text-slate-600 transition last:border-b-0 hover:bg-zeus-celeste hover:text-zeus-tinta disabled:pointer-events-none disabled:opacity-35"
    >
      {children}
    </button>
  );
}

function plural(cantidad: number, singular: string, plural: string) {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}

export function MapaOrigenes({ origenes }: { origenes: readonly OrigenPanelDto[] }) {
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [encima, setEncima] = useState<string | null>(null);
  const [camara, setCamara] = useState<Camara>(CAMARA_INICIAL);
  const [ancho, setAncho] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);
  const [avisoZoom, setAvisoZoom] = useState(false);

  const vista = useRef<HTMLDivElement>(null);
  const arrastre = useRef<{ x: number; y: number; camara: Camara; id: number; movido: boolean } | null>(null);
  const huboArrastre = useRef(false);
  const vuelo = useRef<AnimationPlaybackControls | null>(null);
  const temporizadorAviso = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activo = encima ?? seleccionado;
  const datos = prepararOrigenes(origenes);
  const maximo = Math.max(1, ...datos.map((o) => o.preNegociaciones));
  const totalPuertos = datos.reduce((suma, o) => suma + o.puertos.length, 0);
  const totalNegociaciones = datos.reduce((suma, o) => suma + o.negociaciones, 0);
  const atenuado = (pais: string) => activo !== null && activo !== pais;

  const escala = (ancho / ANCHO_MAPA) * camara.k;
  const alto = (ancho * ALTO_MAPA) / ANCHO_MAPA;
  const anchoVisible = ANCHO_MAPA / camara.k;
  const altoVisible = ALTO_MAPA / camara.k;
  const viewBox = `${camara.x - anchoVisible / 2} ${camara.y - altoVisible / 2} ${anchoVisible} ${altoVisible}`;
  /** Tamaños de marcadores en unidades del mapa: se dividen por el zoom para mantenerse constantes en pantalla. */
  const u = 1 / camara.k;

  const enPantalla = (punto: Punto): CSSProperties | null => {
    if (ancho === 0) return null;
    const copia = copiaCercana(punto, camara.x);
    const left = (copia.x - camara.x) * escala + ancho / 2;
    const top = (copia.y - camara.y) * escala + alto / 2;
    if (left < -160 || left > ancho + 160 || top < -80 || top > alto + 80) return null;
    return { left, top };
  };

  useEffect(() => {
    const elemento = vista.current;
    if (!elemento) return;
    const observador = new ResizeObserver(([entrada]) => setAncho(entrada.contentRect.width));
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    const elemento = vista.current;
    if (!elemento || ancho === 0) return;
    const alGirarRueda = (evento: WheelEvent) => {
      if (!evento.ctrlKey && !evento.metaKey) {
        setAvisoZoom(true);
        if (temporizadorAviso.current) clearTimeout(temporizadorAviso.current);
        temporizadorAviso.current = setTimeout(() => setAvisoZoom(false), 1400);
        return;
      }
      evento.preventDefault();
      vuelo.current?.stop();
      const rect = elemento.getBoundingClientRect();
      const dx = evento.clientX - rect.left - rect.width / 2;
      const dy = evento.clientY - rect.top - rect.height / 2;
      setCamara((actual) => {
        const base = rect.width / ANCHO_MAPA;
        const k = limitar(actual.k * Math.exp(-evento.deltaY * 0.002), ZOOM_MINIMO, ZOOM_MAXIMO);
        const bajoCursor = { x: actual.x + dx / (base * actual.k), y: actual.y + dy / (base * actual.k) };
        return normalizar({ k, x: bajoCursor.x - dx / (base * k), y: bajoCursor.y - dy / (base * k) });
      });
    };
    elemento.addEventListener("wheel", alGirarRueda, { passive: false });
    return () => elemento.removeEventListener("wheel", alGirarRueda);
  }, [ancho]);

  useEffect(() => () => {
    vuelo.current?.stop();
    if (temporizadorAviso.current) clearTimeout(temporizadorAviso.current);
  }, []);

  const volarA = (destino: Camara) => {
    vuelo.current?.stop();
    const desde = camara;
    const hasta = { ...destino, x: copiaCercana(destino, desde.x).x };
    vuelo.current = animate(0, 1, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (t) =>
        setCamara(
          normalizar({
            x: desde.x + (hasta.x - desde.x) * t,
            y: desde.y + (hasta.y - desde.y) * t,
            k: desde.k * Math.pow(hasta.k / desde.k, t),
          }),
        ),
    });
  };

  const zoomEnCentro = (factor: number) => volarA(normalizar({ ...camara, k: camara.k * factor }));

  const alternar = (origen: OrigenEnMapa) => {
    if (seleccionado === origen.pais) {
      setSeleccionado(null);
      volarA(CAMARA_INICIAL);
      return;
    }
    setSeleccionado(origen.pais);
    const encuadre = encuadreDe(origen);
    if (encuadre) volarA(encuadre);
  };

  const verTodos = () => {
    setSeleccionado(null);
    volarA(CAMARA_INICIAL);
  };

  const alPresionar = (evento: EventoPuntero<HTMLDivElement>) => {
    if (evento.button !== 0) return;
    huboArrastre.current = false;
    arrastre.current = { x: evento.clientX, y: evento.clientY, camara, id: evento.pointerId, movido: false };
  };

  const alMover = (evento: EventoPuntero<HTMLDivElement>) => {
    const inicio = arrastre.current;
    if (!inicio || ancho === 0) return;
    const dx = evento.clientX - inicio.x;
    const dy = evento.clientY - inicio.y;
    if (!inicio.movido) {
      if (Math.hypot(dx, dy) < UMBRAL_ARRASTRE) return;
      inicio.movido = true;
      huboArrastre.current = true;
      vuelo.current?.stop();
      evento.currentTarget.setPointerCapture(inicio.id);
      setArrastrando(true);
    }
    const base = (ancho / ANCHO_MAPA) * inicio.camara.k;
    setCamara(normalizar({ ...inicio.camara, x: inicio.camara.x - dx / base, y: inicio.camara.y - dy / base }));
  };

  const alSoltar = () => {
    arrastre.current = null;
    setArrastrando(false);
  };

  const elementosDeCopia = (desplazamiento: number) => (
    <g key={desplazamiento} transform={`translate(${desplazamiento} 0)`}>
      <path d={RUTA_TIERRA} strokeWidth={3.6 / Math.sqrt(camara.k)} strokeLinecap="round" className="stroke-slate-300/80" />

      {datos.map((origen, indiceOrigen) =>
        origen.puertosEnMapa.map(({ puerto, punto }, indicePuerto) => {
          const ruta = rutaCurva(punto, destinoDeRuta(punto, DESTINO.punto));
          return (
            <g key={`${origen.pais}-${puerto}`} style={{ opacity: atenuado(origen.pais) ? 0.12 : 1, transition: "opacity 200ms" }}>
              <motion.path
                d={ruta}
                fill="none"
                stroke={origen.color}
                strokeWidth={activo === origen.pais ? 2.6 : 1.8}
                strokeLinecap="round"
                strokeOpacity={0.4}
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, delay: 0.3 + (indiceOrigen + indicePuerto) * 0.12, ease: [0.22, 1, 0.36, 1] }}
              />
              <path
                d={ruta}
                fill="none"
                stroke={origen.color}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeDasharray="3 14"
                vectorEffect="non-scaling-stroke"
                className="mapa-flujo"
              />
            </g>
          );
        }),
      )}

      {datos.map((origen) =>
        origen.puertosEnMapa.map(({ puerto, punto }, indice) => (
          <g key={`punto-${origen.pais}-${puerto}`} style={{ opacity: atenuado(origen.pais) ? 0.25 : 1, transition: "opacity 200ms" }}>
            <motion.circle
              cx={punto.x}
              cy={punto.y}
              fill={origen.color}
              initial={{ r: 3 * u, opacity: 0.5 }}
              animate={{ r: 12 * u, opacity: 0 }}
              transition={{ duration: 2.2, repeat: Infinity, delay: indice * 0.4, ease: "easeOut" }}
            />
            <circle cx={punto.x} cy={punto.y} r={4 * u} fill={origen.color} stroke="white" strokeWidth={1.5 * u} />
          </g>
        )),
      )}

      <circle cx={DESTINO.punto.x} cy={DESTINO.punto.y} r={36 * u} fill="url(#mapa-halo-destino)" />
      <motion.circle
        cx={DESTINO.punto.x}
        cy={DESTINO.punto.y}
        fill="none"
        stroke={DORADO}
        strokeWidth={1.5 * u}
        initial={{ r: 5 * u, opacity: 0.8 }}
        animate={{ r: 22 * u, opacity: 0 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
      />
      <circle cx={DESTINO.punto.x} cy={DESTINO.punto.y} r={6 * u} fill={DORADO} stroke="white" strokeWidth={2 * u} />
    </g>
  );

  const posicionDestino = enPantalla(DESTINO.punto);

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-zeus-celeste/70 via-superficie to-zeus-celeste/40">
        <div
          ref={vista}
          onPointerDown={alPresionar}
          onPointerMove={alMover}
          onPointerUp={alSoltar}
          onPointerCancel={alSoltar}
          onClickCapture={(evento) => {
            if (!huboArrastre.current) return;
            evento.stopPropagation();
            huboArrastre.current = false;
          }}
          className={`relative touch-none select-none overflow-hidden ${arrastrando ? "cursor-grabbing" : "cursor-grab"}`}
          style={{ aspectRatio: `${ANCHO_MAPA} / ${ALTO_MAPA}` }}
        >
          <svg viewBox={viewBox} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            <defs>
              <radialGradient id="mapa-halo-destino">
                <stop offset="0%" stopColor={DORADO} stopOpacity="0.4" />
                <stop offset="100%" stopColor={DORADO} stopOpacity="0" />
              </radialGradient>
            </defs>
            {COPIAS.map(elementosDeCopia)}
          </svg>

          {posicionDestino && (
            <div className="pointer-events-none absolute z-10" style={posicionDestino}>
              <div className="absolute left-0 top-0 hidden -translate-x-[calc(100%+14px)] translate-y-2 items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200/80 bg-superficie/95 py-1.5 pl-1.5 pr-3 shadow-[0_10px_24px_-12px_rgba(0,31,61,0.5)] backdrop-blur sm:flex">
                <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
                  <Image src="/images/logo-zeus-safety.png" alt="Zeus Safety" fill sizes="32px" className="object-contain p-1" />
                </span>
                <span className="leading-tight">
                  <span className="flex items-center gap-1 font-display text-xs font-bold text-slate-900">
                    <HiOutlineMapPin className="h-3.5 w-3.5 text-zeus-dorado" />
                    {DESTINO.nombre}, {DESTINO.pais}
                  </span>
                  <span className="block text-[9px] font-semibold uppercase tracking-wider text-zeus-dorado">Destino · Zeus Safety</span>
                </span>
              </div>
            </div>
          )}

          {datos.map((origen) => {
            if (origen.ubicacion === null) return null;
            const posicion = enPantalla(origen.ubicacion.centro);
            if (!posicion) return null;
            return (
              <div key={origen.pais} className={`absolute ${activo === origen.pais ? "z-20" : "z-10"}`} style={posicion}>
                <button
                  type="button"
                  onClick={() => alternar(origen)}
                  onMouseEnter={() => setEncima(origen.pais)}
                  onMouseLeave={() => setEncima(null)}
                  aria-pressed={seleccionado === origen.pais}
                  className={`absolute left-0 top-0 hidden whitespace-nowrap rounded-xl border-2 bg-superficie/95 py-1.5 pl-1.5 pr-3 text-left shadow-[0_10px_24px_-12px_rgba(0,31,61,0.5)] backdrop-blur transition-[opacity,transform] duration-200 hover:scale-105 md:flex md:items-center md:gap-2 ${
                    POSICION_TARJETA[origen.ubicacion.lado]
                  } ${atenuado(origen.pais) ? "opacity-50" : ""}`}
                  style={{ borderColor: activo === origen.pais ? origen.color : "rgb(226 232 240 / 0.8)" }}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${origen.color}1f` }}>
                    <BanderaPais pais={origen.pais} tamano="chico" />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-[9px] font-semibold uppercase tracking-wide text-slate-500">{origen.pais}</span>
                    <span className="block font-display text-sm font-bold tabular-nums text-slate-900">
                      {origen.preNegociaciones}
                      <span className="ml-1 text-[9px] font-medium text-slate-400">pre-neg.</span>
                    </span>
                  </span>
                </button>
              </div>
            );
          })}

          {datos
            .filter((origen) => origen.pais === activo)
            .flatMap((origen) =>
              origen.puertosEnMapa.map(({ puerto, preNegociaciones, punto }) => {
                const posicion = enPantalla(punto);
                if (!posicion) return null;
                return (
                  <div key={`etiqueta-${origen.pais}-${puerto}`} className="pointer-events-none absolute z-30" style={posicion}>
                    <span
                      className="absolute left-2.5 top-2.5 whitespace-nowrap rounded-md px-1.5 py-0.5 font-display text-[10px] font-bold text-white shadow-md"
                      style={{ background: origen.color }}
                    >
                      {puerto} · {preNegociaciones}
                    </span>
                  </div>
                );
              }),
            )}

          <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex flex-wrap items-start justify-between gap-2 p-3">
            <div className="flex flex-wrap gap-1.5">
              {[
                plural(datos.length, "país", "países"),
                plural(totalPuertos, "puerto", "puertos"),
                plural(totalNegociaciones, "negociación", "negociaciones"),
              ].map((texto) => (
                <span
                  key={texto}
                  className="rounded-full border border-slate-200/80 bg-superficie/90 px-2.5 py-1 font-display text-[10px] font-semibold text-slate-600 shadow-sm backdrop-blur"
                >
                  {texto}
                </span>
              ))}
            </div>
            <AnimatePresence>
              {seleccionado && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={verTodos}
                  className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-zeus-azul px-3 py-1 text-[11px] font-semibold text-white shadow-md"
                >
                  <HiOutlineArrowPath className="h-3.5 w-3.5" /> Ver todos
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute right-3 top-14 z-40 flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-superficie/95 shadow-md backdrop-blur">
            <BotonControl etiqueta="Acercar" deshabilitado={camara.k >= ZOOM_MAXIMO} alPulsar={() => zoomEnCentro(1.6)}>
              <HiPlus className="h-4 w-4" />
            </BotonControl>
            <BotonControl etiqueta="Alejar" deshabilitado={camara.k <= ZOOM_MINIMO} alPulsar={() => zoomEnCentro(1 / 1.6)}>
              <HiMinus className="h-4 w-4" />
            </BotonControl>
            <BotonControl etiqueta="Vista completa" alPulsar={() => verTodos()}>
              <HiOutlineGlobeAmericas className="h-4 w-4" />
            </BotonControl>
          </div>

          <AnimatePresence>
            {avisoZoom && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-zeus-azul/25"
              >
                <span className="rounded-xl bg-zeus-azul px-4 py-2 text-xs font-semibold text-white shadow-lg">
                  Mantenga Ctrl y gire la rueda para acercar el mapa
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {datos.length === 0 && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <p className="rounded-xl bg-superficie/95 px-4 py-2.5 text-xs font-medium text-slate-500 shadow-md">
                Las rutas aparecerán cuando registre pre-negociaciones.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-200/70 bg-superficie/70 px-4 py-2 text-[10px] font-medium text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-white bg-zeus-azul-medio shadow" /> Puerto de embarque
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-white bg-zeus-dorado shadow" /> Callao (destino)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-5 rounded-full bg-[repeating-linear-gradient(90deg,#64748b_0_3px,transparent_3px_7px)]" /> Ruta
          </span>
          <span className="ml-auto hidden sm:inline">Arrastre para recorrer el mundo · Ctrl + rueda o los botones para acercar</span>
        </div>
      </div>

      <aside className="flex flex-col">
        <p className="mb-2 flex items-center gap-1.5 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
          <HiOutlineGlobeAmericas className="h-4 w-4" /> Ranking de orígenes
        </p>
        {datos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-500">Sin orígenes registrados todavía.</p>
        ) : (
          <ul className="scroll-zeus max-h-[420px] space-y-2 overflow-y-auto">
            {datos.map((origen, indice) => {
              const elegido = seleccionado === origen.pais;
              return (
                <li key={origen.pais}>
                  <button
                    type="button"
                    onClick={() => alternar(origen)}
                    onMouseEnter={() => setEncima(origen.pais)}
                    onMouseLeave={() => setEncima(null)}
                    aria-pressed={elegido}
                    className={`w-full rounded-xl border-2 px-3 py-2.5 text-left transition ${
                      elegido ? "bg-superficie shadow-md" : "bg-slate-50 hover:bg-superficie"
                    }`}
                    style={{ borderColor: elegido ? origen.color : "rgb(226 232 240 / 0.8)" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-4 text-center font-display text-[11px] font-bold text-slate-400">{indice + 1}</span>
                      <BanderaPais pais={origen.pais} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-xs font-semibold text-slate-800">{origen.pais}</span>
                        <span className="block text-[10px] text-slate-500">
                          {plural(origen.puertos.length, "puerto", "puertos")} · {plural(origen.negociaciones, "negociación", "negociaciones")}
                          {origen.ubicacion === null && " · sin ubicación"}
                        </span>
                      </span>
                      <span className="font-display text-base font-bold tabular-nums text-slate-900">{origen.preNegociaciones}</span>
                    </div>
                    <div className="ml-6 mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: origen.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(origen.preNegociaciones / maximo) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + indice * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <AnimatePresence initial={false}>
                      {elegido && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-6 flex flex-wrap gap-1.5 pt-2.5">
                            {origen.puertos.map(({ puerto, preNegociaciones, negociaciones }) => (
                              <span
                                key={puerto}
                                title={plural(negociaciones, "negociación", "negociaciones")}
                                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                              >
                                <HiOutlineMapPin className="h-3 w-3" style={{ color: origen.color }} />
                                {puerto}
                                <span className="font-display font-bold text-slate-900">{preNegociaciones}</span>
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>
    </div>
  );
}
