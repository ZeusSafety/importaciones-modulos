"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { HiArrowDown, HiCheck } from "react-icons/hi2";

/** Estilos de los botones de exportación del sistema Zeus. */
const VARIANTES = {
  excel:
    "bg-gradient-to-br from-[#059669] to-[#047857] hover:from-[#047857] hover:to-[#065f46] dark:from-[#047857] dark:to-[#064e3b] dark:ring-1 dark:ring-inset dark:ring-emerald-400/25 dark:hover:from-[#059669] dark:hover:to-[#047857]",
  pdf: "bg-gradient-to-br from-[#ef4444] to-[#dc2626] hover:from-[#dc2626] hover:to-[#b91c1c] dark:from-[#b91c1c] dark:to-[#7f1d1d] dark:ring-1 dark:ring-inset dark:ring-red-400/25 dark:hover:from-[#dc2626] dark:hover:to-[#b91c1c]",
  primario: "bg-gradient-to-br from-zeus-azul to-zeus-azul-medio hover:from-zeus-azul-oscuro hover:to-zeus-azul",
} as const;

const DURACION_LISTO_MS = 1600;

type EstadoDescarga = "inactivo" | "descargando" | "listo";

interface PropsBotonDescarga {
  variante: keyof typeof VARIANTES;
  icono: ReactNode;
  texto: ReactNode;
  textoProceso: string;
  alDescargar: () => Promise<void>;
  alFallar: (error: unknown) => void;
  disabled?: boolean;
}

export function BotonDescarga({ variante, icono, texto, textoProceso, alDescargar, alFallar, disabled = false }: PropsBotonDescarga) {
  const [estado, setEstado] = useState<EstadoDescarga>("inactivo");
  const temporizador = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (temporizador.current !== null) window.clearTimeout(temporizador.current);
    },
    [],
  );

  const descargar = async () => {
    setEstado("descargando");
    try {
      await alDescargar();
      setEstado("listo");
      temporizador.current = window.setTimeout(() => setEstado("inactivo"), DURACION_LISTO_MS);
    } catch (error) {
      setEstado("inactivo");
      alFallar(error);
    }
  };

  return (
    <button
      type="button"
      onClick={descargar}
      disabled={disabled || estado !== "inactivo"}
      aria-busy={estado === "descargando"}
      className={`relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-lg px-4 font-display text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed ${
        estado === "inactivo" ? "disabled:opacity-60" : ""
      } ${VARIANTES[variante]}`}
    >
      <span className="relative flex h-4 w-4 items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {estado === "inactivo" && (
            <motion.span key="icono" className="flex" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}>
              {icono}
            </motion.span>
          )}
          {estado === "descargando" && (
            <motion.span key="descargando" className="relative flex h-4 w-4 justify-center overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.span
                className="absolute"
                animate={{ y: [-12, 2, 2], opacity: [0, 1, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeIn", times: [0, 0.7, 1] }}
              >
                <HiArrowDown className="h-3.5 w-3.5" />
              </motion.span>
              <span className="absolute bottom-0 h-0.5 w-3.5 rounded-full bg-white" />
            </motion.span>
          )}
          {estado === "listo" && (
            <motion.span
              key="listo"
              className="flex"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
            >
              <HiCheck className="h-4 w-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span className="leading-none">{estado === "descargando" ? textoProceso : estado === "listo" ? "¡Listo!" : texto}</span>
      {estado === "descargando" && (
        <motion.span
          className="absolute bottom-0 left-0 h-0.5 w-1/3 rounded-full bg-white/80"
          initial={{ x: "-100%" }}
          animate={{ x: "300%" }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </button>
  );
}
