"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";
import type { CotizacionFormulario } from "./modeloFormulario";
import { TarjetaCotizacion } from "./TarjetaCotizacion";
import type { DespacharFormulario } from "./useFormularioPreNegociacion";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Una cotización queda pendiente cuando el área la dejó en blanco para completarla después. */
function estaEnBlanco(cotizacion: CotizacionFormulario): boolean {
  return cotizacion.proveedor.trim() === "" || cotizacion.productos.trim() === "";
}

interface PropsCarruselNegociaciones {
  cotizaciones: readonly CotizacionFormulario[];
  registradoPor: string;
  despachar: DespacharFormulario;
}

export function CarruselNegociaciones({ cotizaciones, registradoPor, despachar }: PropsCarruselNegociaciones) {
  const [indice, setIndice] = useState(0);
  const cantidadAnterior = useRef(cotizaciones.length);
  const ultimo = Math.max(0, cotizaciones.length - 1);
  const visible = Math.min(indice, ultimo);
  const hayMas = cotizaciones.length > 1;

  useEffect(() => {
    if (cotizaciones.length > cantidadAnterior.current) {
      setIndice(cotizaciones.length - 1);
    }
    cantidadAnterior.current = cotizaciones.length;
  }, [cotizaciones.length]);

  const mover = (delta: number) => setIndice((actual) => Math.min(ultimo, Math.max(0, actual + delta)));
  const enBlancoALaIzquierda = cotizaciones.slice(0, visible).filter(estaEnBlanco).length;
  const enBlancoALaDerecha = cotizaciones.slice(visible + 1).filter(estaEnBlanco).length;
  const hayPendientes = enBlancoALaIzquierda + enBlancoALaDerecha > 0;

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {hayPendientes && (
          <motion.div
            key="aviso-pendientes"
            role="status"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-3.5 py-2.5"
          >
            <p className="text-xs font-medium text-[#b45309] dark:text-[#fcd34d]">
              {enBlancoALaIzquierda + enBlancoALaDerecha === 1
                ? "Hay 1 cotización en blanco por completar."
                : `Hay ${enBlancoALaIzquierda + enBlancoALaDerecha} cotizaciones en blanco por completar.`}
            </p>
            <span className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wide text-[#b45309] dark:text-[#fcd34d]">
              {enBlancoALaIzquierda > 0 && (
                <span className="inline-flex items-center gap-1">
                  <FlechaIndicadora direccion="anterior" />
                  {enBlancoALaIzquierda} a la izquierda
                </span>
              )}
              {enBlancoALaDerecha > 0 && (
                <span className="inline-flex items-center gap-1">
                  {enBlancoALaDerecha} a la derecha
                  <FlechaIndicadora direccion="siguiente" />
                </span>
              )}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

    <div className="flex items-start gap-2">
      {hayMas && (
        <BotonFlecha
          direccion="anterior"
          deshabilitado={visible === 0}
          pendientes={enBlancoALaIzquierda}
          alPulsar={() => mover(-1)}
        />
      )}
      <div className="min-w-0 flex-1 overflow-hidden">
        <motion.div
          className="flex items-start"
          animate={{ x: `${(-visible * 100) / cotizaciones.length}%` }}
          transition={{ duration: 0.38, ease: EASE }}
          style={{ width: `${cotizaciones.length * 100}%` }}
        >
          <AnimatePresence initial={false}>
            {cotizaciones.map((cotizacion, numero) => (
              <div key={cotizacion.id} className="px-1" style={{ width: `${100 / cotizaciones.length}%` }}>
                <TarjetaCotizacion
                  cotizacion={cotizacion}
                  numero={numero + 1}
                  registradoPor={registradoPor}
                  despachar={despachar}
                />
              </div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
      {hayMas && (
        <BotonFlecha
          direccion="siguiente"
          deshabilitado={visible === ultimo}
          pendientes={enBlancoALaDerecha}
          alPulsar={() => mover(1)}
        />
      )}
    </div>
    </div>
  );
}

function FlechaIndicadora({ direccion }: { direccion: "anterior" | "siguiente" }) {
  const Icono = direccion === "anterior" ? HiOutlineChevronLeft : HiOutlineChevronRight;
  return (
    <motion.span
      aria-hidden
      animate={{ x: direccion === "anterior" ? [0, -5, 0] : [0, 5, 0] }}
      transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
      className="flex"
    >
      <Icono className="h-4 w-4" />
    </motion.span>
  );
}

function BotonFlecha({
  direccion,
  deshabilitado,
  pendientes,
  alPulsar,
}: {
  direccion: "anterior" | "siguiente";
  deshabilitado: boolean;
  pendientes: number;
  alPulsar: () => void;
}) {
  const Icono = direccion === "anterior" ? HiOutlineChevronLeft : HiOutlineChevronRight;
  const avisa = pendientes > 0 && !deshabilitado;
  return (
    <button
      type="button"
      onClick={alPulsar}
      disabled={deshabilitado}
      aria-label={
        avisa
          ? `${direccion === "anterior" ? "Ver la cotización anterior" : "Ver la cotización siguiente"}, ${pendientes} en blanco`
          : direccion === "anterior"
            ? "Ver la cotización anterior"
            : "Ver la cotización siguiente"
      }
      className={`relative mt-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-superficie shadow-sm transition disabled:pointer-events-none disabled:opacity-30 ${
        avisa
          ? "border-[#f59e0b] text-[#b45309] hover:bg-[#f59e0b]/10 dark:text-[#fcd34d]"
          : "border-slate-300 text-zeus-tinta hover:border-zeus-azul/40 hover:bg-zeus-celeste"
      }`}
    >
      {avisa && (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border border-[#f59e0b]"
          initial={{ scale: 1, opacity: 0.7 }}
          animate={{ scale: 1.45, opacity: 0 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <motion.span animate={avisa ? { x: direccion === "anterior" ? [0, -3, 0] : [0, 3, 0] } : { x: 0 }} transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}>
        <Icono className="h-5 w-5" />
      </motion.span>
      {avisa && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f59e0b] px-1 text-[10px] font-bold text-white">
          {pendientes}
        </span>
      )}
    </button>
  );
}
