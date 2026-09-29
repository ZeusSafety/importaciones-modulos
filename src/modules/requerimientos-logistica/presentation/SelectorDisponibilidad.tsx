"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import { HiCheck, HiXMark } from "react-icons/hi2";
import type { Disponibilidad } from "../domain/valores";

const OPCIONES: { valor: Disponibilidad; icono: typeof HiCheck; pastilla: string; texto: string }[] = [
  { valor: "SI", icono: HiCheck, pastilla: "bg-gradient-to-br from-[#10b981] to-[#059669] shadow-[0_4px_14px_rgba(16,185,129,0.4)]", texto: "text-emerald-700" },
  { valor: "NO", icono: HiXMark, pastilla: "bg-gradient-to-br from-[#f43f5e] to-[#dc2626] shadow-[0_4px_14px_rgba(239,68,68,0.4)]", texto: "text-red-600" },
];

interface PropsSelectorDisponibilidad {
  id: string;
  valor: Disponibilidad | "";
  alCambiar: (valor: Disponibilidad) => void;
}

export function SelectorDisponibilidad({ id, valor, alCambiar }: PropsSelectorDisponibilidad) {
  const grupo = useId();
  const borde = valor === "SI" ? "border-emerald-300 bg-emerald-50" : valor === "NO" ? "border-red-300 bg-red-50" : "border-slate-300 bg-superficie";

  return (
    <div id={id} role="radiogroup" className={`grid h-10 grid-cols-2 gap-1 rounded-lg border p-1 shadow-sm transition-colors duration-300 ${borde}`}>
      {OPCIONES.map(({ valor: opcion, icono: Icono, pastilla, texto }) => {
        const activa = valor === opcion;
        return (
          <button
            key={opcion}
            type="button"
            role="radio"
            aria-checked={activa}
            onClick={() => alCambiar(opcion)}
            className={`relative flex items-center justify-center gap-1 rounded-md font-display text-xs font-bold transition-colors ${
              activa ? "text-white" : valor === "" ? "text-slate-500 hover:bg-slate-100" : `${texto} opacity-60 hover:opacity-100`
            }`}
          >
            {activa && (
              <motion.span
                layoutId={`disponibilidad-${grupo}`}
                className={`absolute inset-0 rounded-md ${pastilla}`}
                transition={{ type: "spring", stiffness: 480, damping: 32 }}
              />
            )}
            <motion.span
              key={activa ? "activa" : "inactiva"}
              initial={activa ? { scale: 0.6 } : false}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 520, damping: 18 }}
              className="relative flex items-center gap-1"
            >
              <Icono className="h-3.5 w-3.5" />
              {opcion}
            </motion.span>
          </button>
        );
      })}
    </div>
  );
}
