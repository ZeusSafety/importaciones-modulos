"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";
import type { CotizacionFormulario } from "./modeloFormulario";
import { TarjetaCotizacion } from "./TarjetaCotizacion";
import type { DespacharFormulario } from "./useFormularioPreNegociacion";

const EASE = [0.22, 1, 0.36, 1] as const;

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

  return (
    <div className="flex items-start gap-2">
      {hayMas && <BotonFlecha direccion="anterior" deshabilitado={visible === 0} alPulsar={() => mover(-1)} />}
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
        <BotonFlecha direccion="siguiente" deshabilitado={visible === ultimo} alPulsar={() => mover(1)} />
      )}
    </div>
  );
}

function BotonFlecha({
  direccion,
  deshabilitado,
  alPulsar,
}: {
  direccion: "anterior" | "siguiente";
  deshabilitado: boolean;
  alPulsar: () => void;
}) {
  const Icono = direccion === "anterior" ? HiOutlineChevronLeft : HiOutlineChevronRight;
  return (
    <button
      type="button"
      onClick={alPulsar}
      disabled={deshabilitado}
      aria-label={direccion === "anterior" ? "Ver la cotización anterior" : "Ver la cotización siguiente"}
      className="mt-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-superficie text-zeus-tinta shadow-sm transition hover:border-zeus-azul/40 hover:bg-zeus-celeste disabled:pointer-events-none disabled:opacity-30"
    >
      <Icono className="h-5 w-5" />
    </button>
  );
}
