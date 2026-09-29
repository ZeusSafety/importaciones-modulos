"use client";

import { motion } from "framer-motion";
import type { EstadoPreNegociacion } from "@/modules/pre-negociaciones/domain/valores";
import { porcentaje, TRANSICION_GRAFICO } from "@/modules/shared/presentation/graficos/paleta";

export function ResumenDespachos({ conteos }: { conteos: Record<EstadoPreNegociacion, number> }) {
  const cerrados = conteos.COMPLETADO + conteos.ANULADO;
  const avance = porcentaje(cerrados, conteos["EN PROCESO"] + cerrados);

  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-display font-semibold text-slate-700">Avance de cierre</span>
        <span className="font-display font-bold tabular-nums text-slate-900">{avance}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-zeus-azul-medio to-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${avance}%` }}
          transition={{ ...TRANSICION_GRAFICO, delay: 0.4 }}
        />
      </div>
    </div>
  );
}
