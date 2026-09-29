"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { createPortal } from "react-dom";
import { HiChevronDown, HiChevronLeft, HiChevronRight, HiOutlineCalendarDays } from "react-icons/hi2";
import { fechaLocalDe } from "@/modules/shared/domain/fechas";
import { useDesplegable } from "../hooks/useDesplegable";
import { useMontado } from "../hooks/useMontado";
import {
  celdasDelMes,
  DIAS_SEMANA,
  desplazarMes,
  fechaCorta,
  fechaDe,
  mesDe,
  MESES_CORTOS,
  sumarDias,
  type MesVisible,
} from "./calendario";

/** Fechas `YYYY-MM-DD`; ambas vacías significa sin rango. */
export interface RangoFechas {
  readonly desde: string;
  readonly hasta: string;
}

export const RANGO_VACIO: RangoFechas = { desde: "", hasta: "" };

type VistaCalendario = "dias" | "meses" | "anios";

function atajosDesde(hoy: string): { etiqueta: string; rango: RangoFechas }[] {
  const mesActual = mesDe(hoy);
  const mesAnterior = desplazarMes(mesActual, -1);
  const finDeMes = (mes: MesVisible) => {
    const siguiente = desplazarMes(mes, 1);
    return sumarDias(fechaDe(siguiente.anio, siguiente.mes, 1), -1);
  };
  return [
    { etiqueta: "Hoy", rango: { desde: hoy, hasta: hoy } },
    { etiqueta: "7 días", rango: { desde: sumarDias(hoy, -6), hasta: hoy } },
    { etiqueta: "Este mes", rango: { desde: fechaDe(mesActual.anio, mesActual.mes, 1), hasta: hoy } },
    { etiqueta: "Mes anterior", rango: { desde: fechaDe(mesAnterior.anio, mesAnterior.mes, 1), hasta: finDeMes(mesAnterior) } },
  ];
}

const ordenar = (a: string, b: string): RangoFechas => (a <= b ? { desde: a, hasta: b } : { desde: b, hasta: a });

interface PropsSelectorRangoFechas {
  id: string;
  rango: RangoFechas;
  alCambiar: (rango: RangoFechas) => void;
  marcador: string;
}

export function SelectorRangoFechas({ id, rango, alCambiar, marcador }: PropsSelectorRangoFechas) {
  const montado = useMontado();
  const desplegable = useDesplegable<HTMLButtonElement>({ alturaMaxima: 460, alturaMinimaHaciaAbajo: 420, anchoMinimo: 312 });
  const { disparador, panel, posicion, abierto, cerrar } = desplegable;
  /** Se fija al abrir: el calendario solo existe en el cliente. */
  const [hoy, setHoy] = useState<string | null>(null);
  const [mes, setMes] = useState<MesVisible>({ anio: 2000, mes: 1 });
  const [vista, setVista] = useState<VistaCalendario>("dias");
  const [inicioPendiente, setInicioPendiente] = useState<string | null>(null);
  const [bajoCursor, setBajoCursor] = useState<string | null>(null);

  const tieneRango = rango.desde !== "" && rango.hasta !== "";
  const visible = inicioPendiente ? ordenar(inicioPendiente, bajoCursor ?? inicioPendiente) : tieneRango ? rango : null;

  const abrir = () => {
    const fechaHoy = fechaLocalDe(new Date().toISOString());
    setHoy(fechaHoy);
    setMes(mesDe(tieneRango ? rango.desde : fechaHoy));
    setVista("dias");
    setInicioPendiente(null);
    setBajoCursor(null);
    desplegable.abrir();
  };

  const confirmar = (nuevo: RangoFechas) => {
    alCambiar(nuevo);
    cerrar(true);
  };

  const elegirDia = (fecha: string) => {
    if (inicioPendiente === null) {
      setInicioPendiente(fecha);
      return;
    }
    confirmar(ordenar(inicioPendiente, fecha));
  };

  const textoDisparador = !tieneRango
    ? marcador
    : rango.desde === rango.hasta
      ? fechaCorta(rango.desde)
      : `${fechaCorta(rango.desde)}  —  ${fechaCorta(rango.hasta)}`;

  return (
    <>
      <button
        ref={disparador}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={abierto}
        onClick={() => (abierto ? cerrar(true) : abrir())}
        className={`flex h-10 w-full items-center justify-between gap-2 rounded-lg border bg-superficie px-3 text-left text-sm shadow-sm outline-none transition ${
          abierto ? "border-zeus-azul ring-4 ring-zeus-azul/10" : "border-slate-300 hover:border-zeus-azul/50 focus-visible:border-zeus-azul focus-visible:ring-4 focus-visible:ring-zeus-azul/10"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <HiOutlineCalendarDays className="h-4 w-4 shrink-0 text-zeus-tinta" />
          <span className={`truncate whitespace-pre ${tieneRango ? "font-medium text-slate-900" : "text-slate-400"}`}>{textoDisparador}</span>
        </span>
        <HiChevronDown className={`h-4 w-4 shrink-0 text-zeus-tinta transition-transform duration-200 ${abierto ? "rotate-180" : ""}`} />
      </button>

      {montado &&
        createPortal(
          <AnimatePresence>
            {posicion && hoy && (
              <motion.div
                ref={panel}
                role="dialog"
                aria-label="Seleccionar rango de fechas"
                initial={{ opacity: 0, y: posicion.haciaArriba ? 6 : -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } }}
                exit={{ opacity: 0, y: posicion.haciaArriba ? 4 : -4, scale: 0.98, transition: { duration: 0.12 } }}
                style={{
                  left: posicion.left,
                  width: 312,
                  top: posicion.top,
                  bottom: posicion.bottom,
                  transformOrigin: posicion.haciaArriba ? "bottom left" : "top left",
                }}
                className="fixed z-[90] overflow-hidden rounded-2xl border border-slate-200 bg-superficie font-display shadow-[0_16px_40px_rgba(0,45,90,0.18)]"
              >
                <div className="flex flex-wrap gap-1.5 border-b border-slate-100 px-3 py-2.5">
                  {atajosDesde(hoy).map((atajo) => {
                    const activo = tieneRango && atajo.rango.desde === rango.desde && atajo.rango.hasta === rango.hasta;
                    return (
                      <button
                        key={atajo.etiqueta}
                        type="button"
                        onClick={() => confirmar(atajo.rango)}
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition ${
                          activo
                            ? "border-zeus-azul bg-zeus-azul text-white"
                            : "border-slate-200 text-slate-600 hover:border-zeus-azul/40 hover:bg-zeus-celeste hover:text-zeus-tinta"
                        }`}
                      >
                        {atajo.etiqueta}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between px-3 pb-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setVista((actual) => (actual === "dias" ? "meses" : "dias"))}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/70 bg-slate-50 px-2.5 py-1.5 text-[12px] font-extrabold uppercase tracking-wide text-slate-800 transition hover:bg-slate-100"
                  >
                    {MESES_CORTOS[mes.mes - 1]} {mes.anio}
                    <HiChevronDown className={`h-3.5 w-3.5 transition-transform ${vista !== "dias" ? "rotate-180" : ""}`} />
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setMes((actual) => desplazarMes(actual, vista === "anios" ? -12 : -1))}
                      aria-label="Mes anterior"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
                    >
                      <HiChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setMes((actual) => desplazarMes(actual, vista === "anios" ? 12 : 1))}
                      aria-label="Mes siguiente"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
                    >
                      <HiChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="px-3 pb-3">
                  {vista === "dias" && (
                    <motion.div
                      key={`${mes.anio}-${mes.mes}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { duration: 0.15 } }}
                      className="grid grid-cols-7 gap-y-1"
                      onPointerLeave={() => setBajoCursor(null)}
                    >
                      {DIAS_SEMANA.map((dia) => (
                        <span key={dia} className="py-1 text-center text-[11px] font-bold uppercase text-slate-400">
                          {dia}
                        </span>
                      ))}
                      {celdasDelMes(mes).map((fecha, indice) => {
                        if (fecha === null) return <span key={`hueco-${indice}`} />;
                        const esInicio = visible?.desde === fecha;
                        const esFin = visible?.hasta === fecha;
                        const dentro = visible !== null && fecha > visible.desde && fecha < visible.hasta;
                        const extremo = esInicio || esFin;
                        const banda = visible !== null && visible.desde !== visible.hasta && (dentro || extremo);
                        return (
                          <div
                            key={fecha}
                            className={`flex h-9 items-center justify-center ${banda ? "bg-zeus-celeste" : ""} ${esInicio && banda ? "rounded-l-full" : ""} ${esFin && banda ? "rounded-r-full" : ""}`}
                          >
                            <button
                              type="button"
                              onClick={() => elegirDia(fecha)}
                              onPointerEnter={() => setBajoCursor(fecha)}
                              aria-label={fechaCorta(fecha)}
                              aria-pressed={extremo}
                              className={`relative h-8 w-8 rounded-full text-xs font-semibold transition-colors ${
                                extremo
                                  ? "bg-zeus-azul text-white shadow-sm"
                                  : dentro
                                    ? "text-zeus-tinta hover:bg-zeus-azul/15"
                                    : "text-slate-800 hover:bg-slate-100"
                              }`}
                            >
                              {Number(fecha.slice(8))}
                              {fecha === hoy && (
                                <span className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${extremo ? "bg-zeus-dorado" : "bg-zeus-azul"}`} />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}

                  {vista === "meses" && (
                    <div>
                      <div className="grid grid-cols-3 gap-2">
                        {MESES_CORTOS.map((nombre, indice) => (
                          <button
                            key={nombre}
                            type="button"
                            onClick={() => {
                              setMes({ anio: mes.anio, mes: indice + 1 });
                              setVista("dias");
                            }}
                            className={`h-9 rounded-2xl text-xs font-extrabold uppercase tracking-wide transition-colors ${
                              indice + 1 === mes.mes ? "bg-zeus-azul text-white" : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {nombre}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setVista("anios")}
                        className="mt-3 w-full text-xs font-extrabold uppercase tracking-wide text-zeus-tinta hover:underline"
                      >
                        Cambiar año
                      </button>
                    </div>
                  )}

                  {vista === "anios" && (
                    <div>
                      <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 12 }, (_, i) => mes.anio - 5 + i).map((anio) => (
                          <button
                            key={anio}
                            type="button"
                            onClick={() => {
                              setMes({ anio, mes: mes.mes });
                              setVista("meses");
                            }}
                            className={`h-9 rounded-2xl text-xs font-extrabold tracking-wide transition-colors ${
                              anio === mes.anio ? "bg-zeus-azul text-white" : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {anio}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setVista("meses")}
                        className="mt-3 w-full text-xs font-extrabold uppercase tracking-wide text-zeus-tinta hover:underline"
                      >
                        Volver
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => confirmar(RANGO_VACIO)}
                    className="text-xs font-extrabold uppercase tracking-wide text-slate-500 transition hover:text-red-600"
                  >
                    Borrar
                  </button>
                  <span className="text-[11px] font-medium text-slate-500">
                    {inicioPendiente ? (
                      <>
                        Desde <b className="text-zeus-tinta">{fechaCorta(inicioPendiente)}</b> · elija el fin
                      </>
                    ) : (
                      "Elija la fecha de inicio"
                    )}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
