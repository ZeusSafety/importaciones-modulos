"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";
import type { CotizacionFormulario } from "./modeloFormulario";
import { TarjetaCotizacion } from "./TarjetaCotizacion";
import type { DespacharFormulario } from "./useFormularioPreNegociacion";
import type { VistaCotizacion } from "../../domain/vistasCotizacion";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Una cotización queda pendiente cuando el área la dejó en blanco para completarla después. */
function estaEnBlanco(cotizacion: CotizacionFormulario): boolean {
  return cotizacion.proveedor.trim() === "" || cotizacion.productos.trim() === "";
}

interface PropsCarruselNegociaciones {
  cotizaciones: readonly CotizacionFormulario[];
  registradoPor: string;
  vista: VistaCotizacion;
  despachar: DespacharFormulario;
}

export function CarruselNegociaciones({ cotizaciones, registradoPor, vista, despachar }: PropsCarruselNegociaciones) {
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

  return (
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
                  vista={vista}
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
    <motion.button
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
      animate={avisa ? { opacity: [1, 0.35, 1] } : { opacity: deshabilitado ? 0.3 : 1 }}
      transition={avisa ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
      className={`relative mt-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-superficie shadow-sm transition-colors disabled:pointer-events-none ${
        avisa
          ? "border-[#002d5a] text-[#002d5a] hover:bg-[#002d5a]/10 dark:border-[#7eb0e0] dark:text-[#7eb0e0]"
          : "border-slate-300 text-zeus-tinta hover:border-zeus-azul/40 hover:bg-zeus-celeste"
      }`}
    >
      {avisa && (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border-2 border-[#002d5a] dark:border-[#7eb0e0]"
          initial={{ scale: 1, opacity: 0.7 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <Icono className="h-5 w-5" />
      {avisa && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#002d5a] px-1 text-[10px] font-bold text-white">
          {pendientes}
        </span>
      )}
    </motion.button>
  );
}
