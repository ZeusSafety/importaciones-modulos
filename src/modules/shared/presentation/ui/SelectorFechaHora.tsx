"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HiChevronDown, HiChevronLeft, HiChevronRight, HiOutlineCalendarDays } from "react-icons/hi2";
import { fechaLocalDe, isoAFechaHoraLocal } from "@/modules/shared/domain/fechas";
import { useDesplegable } from "../hooks/useDesplegable";
import { useMontado } from "../hooks/useMontado";
import { celdasDelMes, DIAS_SEMANA, desplazarMes, fechaCorta, mesDe, MESES_CORTOS, type MesVisible } from "./calendario";

const PATRON = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/;

type VistaCalendario = "dias" | "meses" | "anios";
type Periodo = "AM" | "PM";

interface Momento {
  readonly fecha: string;
  readonly hora24: number;
  readonly minuto: number;
}

function ahoraLocal(): Momento {
  const valor = isoAFechaHoraLocal(new Date().toISOString());
  return leerMomento(valor) ?? { fecha: fechaLocalDe(new Date().toISOString()), hora24: 0, minuto: 0 };
}

function leerMomento(valor: string): Momento | null {
  const coincidencia = PATRON.exec(valor);
  if (!coincidencia) return null;
  const hora24 = Number(coincidencia[2]);
  const minuto = Number(coincidencia[3]);
  if (hora24 > 23 || minuto > 59) return null;
  return { fecha: coincidencia[1], hora24, minuto };
}

function armar({ fecha, hora24, minuto }: Momento): string {
  return `${fecha}T${String(hora24).padStart(2, "0")}:${String(minuto).padStart(2, "0")}`;
}

function a12(hora24: number): { hora: number; periodo: Periodo } {
  return { hora: hora24 % 12 === 0 ? 12 : hora24 % 12, periodo: hora24 >= 12 ? "PM" : "AM" };
}

function a24(hora12: number, periodo: Periodo): number {
  if (periodo === "AM") return hora12 === 12 ? 0 : hora12;
  return hora12 === 12 ? 12 : hora12 + 12;
}

function textoMomento(momento: Momento): string {
  const { hora, periodo } = a12(momento.hora24);
  return `${fechaCorta(momento.fecha)}, ${String(hora).padStart(2, "0")}:${String(momento.minuto).padStart(2, "0")} ${periodo === "AM" ? "a. m." : "p. m."}`;
}

interface PropsSelectorFechaHora {
  id: string;
  /** `YYYY-MM-DDTHH:mm` en hora de Lima. Vacío si aún no hay fecha. */
  valor: string;
  alCambiar: (valor: string) => void;
}

export function SelectorFechaHora({ id, valor, alCambiar }: PropsSelectorFechaHora) {
  const montado = useMontado();
  const desplegable = useDesplegable<HTMLButtonElement>({ alturaMaxima: 440, alturaMinimaHaciaAbajo: 400, anchoMinimo: 468 });
  const { disparador, panel, posicion, abierto, cerrar } = desplegable;
  const momento = leerMomento(valor);
  const [mes, setMes] = useState<MesVisible>({ anio: 2000, mes: 1 });
  const [vista, setVista] = useState<VistaCalendario>("dias");
  const [hoy, setHoy] = useState<string | null>(null);

  const abrir = () => {
    const actual = momento ?? ahoraLocal();
    setHoy(fechaLocalDe(new Date().toISOString()));
    setMes(mesDe(actual.fecha));
    setVista("dias");
    if (momento === null) alCambiar(armar(actual));
    desplegable.abrir();
  };

  const actualizar = (cambio: Partial<Momento>) => {
    alCambiar(armar({ ...(momento ?? ahoraLocal()), ...cambio }));
  };

  return (
    <>
      <button
        ref={disparador}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={abierto}
        onClick={() => (abierto ? cerrar(true) : abrir())}
        className={`inline-flex h-9 max-w-full items-center gap-2 rounded-lg border bg-superficie px-2.5 text-left text-xs font-semibold shadow-sm outline-none transition ${
          abierto ? "border-zeus-azul ring-4 ring-zeus-azul/10" : "border-slate-300 text-slate-800 hover:border-zeus-azul/50"
        }`}
      >
        <HiOutlineCalendarDays className="h-4 w-4 shrink-0 text-zeus-tinta" />
        <span className="truncate">{momento ? textoMomento(momento) : "Seleccione fecha y hora"}</span>
        <HiChevronDown className={`h-3.5 w-3.5 shrink-0 text-zeus-tinta transition-transform duration-200 ${abierto ? "rotate-180" : ""}`} />
      </button>

      {montado &&
        createPortal(
          <AnimatePresence>
            {posicion && hoy && momento && (
              <motion.div
                ref={panel}
                role="dialog"
                aria-label="Seleccionar fecha y hora"
                initial={{ opacity: 0, y: posicion.haciaArriba ? 6 : -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } }}
                exit={{ opacity: 0, y: posicion.haciaArriba ? 4 : -4, scale: 0.98, transition: { duration: 0.12 } }}
                style={{
                  left: posicion.left,
                  width: Math.min(468, posicion.width),
                  top: posicion.top,
                  bottom: posicion.bottom,
                  maxHeight: posicion.alturaMaxima,
                  transformOrigin: posicion.haciaArriba ? "bottom left" : "top left",
                }}
                className="fixed z-[90] flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-superficie font-display shadow-[0_16px_40px_rgba(0,45,90,0.18)]"
              >
                <div className="flex shrink-0 items-center justify-between px-3 pb-2 pt-3">
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
                      aria-label="Mes anterior"
                      onClick={() => setMes((actual) => desplazarMes(actual, vista === "anios" ? -12 : -1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
                    >
                      <HiChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Mes siguiente"
                      onClick={() => setMes((actual) => desplazarMes(actual, vista === "anios" ? 12 : 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
                    >
                      <HiChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex min-h-0 flex-1 gap-3 overflow-hidden px-3 pb-3">
                  <div className="min-w-0 flex-1 overflow-y-auto">
                    {vista === "dias" && (
                      <motion.div
                        key={`${mes.anio}-${mes.mes}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: 0.15 } }}
                        className="grid grid-cols-7 gap-y-1"
                      >
                        {DIAS_SEMANA.map((dia) => (
                          <span key={dia} className="py-1 text-center text-[11px] font-bold uppercase text-slate-400">
                            {dia}
                          </span>
                        ))}
                        {celdasDelMes(mes).map((fecha, indice) => {
                          if (fecha === null) return <span key={`hueco-${indice}`} />;
                          const elegida = fecha === momento.fecha;
                          return (
                            <div key={fecha} className="flex h-9 items-center justify-center">
                              <button
                                type="button"
                                onClick={() => actualizar({ fecha })}
                                aria-label={fechaCorta(fecha)}
                                aria-pressed={elegida}
                                className={`relative h-8 w-8 rounded-full text-xs font-semibold transition-colors ${
                                  elegida ? "bg-zeus-azul text-white shadow-sm" : "text-slate-800 hover:bg-slate-100"
                                }`}
                              >
                                {Number(fecha.slice(8))}
                                {fecha === hoy && (
                                  <span className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${elegida ? "bg-zeus-dorado" : "bg-zeus-azul"}`} />
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                    {vista === "meses" && (
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
                    )}
                    {vista === "anios" && (
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
                    )}
                  </div>

                  {vista === "dias" && <ColumnasHora momento={momento} alCambiar={actualizar} />}
                </div>

                <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-100 px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const actual = ahoraLocal();
                      setMes(mesDe(actual.fecha));
                      setVista("dias");
                      alCambiar(armar(actual));
                    }}
                    className="text-xs font-extrabold uppercase tracking-wide text-zeus-tinta transition hover:underline"
                  >
                    Ahora
                  </button>
                  <button
                    type="button"
                    onClick={() => cerrar(true)}
                    className="rounded-lg bg-zeus-azul px-3 py-1.5 text-xs font-bold text-white transition hover:bg-zeus-azul-oscuro"
                  >
                    Listo
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

function ColumnasHora({ momento, alCambiar }: { momento: Momento; alCambiar: (cambio: Partial<Momento>) => void }) {
  const { hora, periodo } = a12(momento.hora24);
  return (
    <div className="flex h-full min-h-0 w-40 shrink-0 gap-1 border-l border-slate-100 pl-3">
      <Columna
        etiqueta="Hora"
        valor={String(hora)}
        opciones={Array.from({ length: 12 }, (_, i) => {
          const numero = i + 1;
          return { id: String(numero), texto: String(numero).padStart(2, "0") };
        })}
        alElegir={(id) => alCambiar({ hora24: a24(Number(id), periodo) })}
      />
      <Columna
        etiqueta="Min"
        valor={String(momento.minuto)}
        opciones={Array.from({ length: 60 }, (_, minuto) => ({ id: String(minuto), texto: String(minuto).padStart(2, "0") }))}
        alElegir={(id) => alCambiar({ minuto: Number(id) })}
      />
      <Columna
        etiqueta=" "
        valor={periodo}
        opciones={[
          { id: "AM", texto: "a. m." },
          { id: "PM", texto: "p. m." },
        ]}
        alElegir={(id) => alCambiar({ hora24: a24(hora, id === "PM" ? "PM" : "AM") })}
      />
    </div>
  );
}

function Columna({
  etiqueta,
  valor,
  opciones,
  alElegir,
}: {
  etiqueta: string;
  valor: string;
  opciones: readonly { id: string; texto: string }[];
  alElegir: (id: string) => void;
}) {
  const elegido = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const boton = elegido.current;
    const contenedor = boton?.parentElement;
    if (!boton || !contenedor) return;
    contenedor.scrollTop = boton.offsetTop - contenedor.clientHeight / 2 + boton.clientHeight / 2;
  }, [valor]);

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <p className="mb-1 h-3 text-center text-[9px] font-bold uppercase tracking-wide text-slate-400">{etiqueta}</p>
      <div className="scroll-zeus flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
        {opciones.map((opcion) => {
          const activo = opcion.id === valor;
          return (
            <button
              key={opcion.id}
              ref={activo ? elegido : undefined}
              type="button"
              onClick={() => alElegir(opcion.id)}
              className={`rounded-lg py-1.5 text-[11px] font-bold transition ${
                activo ? "bg-zeus-azul text-white" : "text-slate-700 hover:bg-zeus-celeste"
              }`}
            >
              {opcion.texto}
            </button>
          );
        })}
      </div>
    </div>
  );
}
