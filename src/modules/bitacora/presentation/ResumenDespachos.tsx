"use client";

import { motion } from "framer-motion";
import type { EstadoPreNegociacion } from "@/modules/pre-negociaciones/domain/valores";
import { porcentaje, TRANSICION_GRAFICO } from "@/modules/shared/presentation/graficos/paleta";

export function ResumenDespachos({ conteos }: { conteos: Record<EstadoPreNegociacion, number> }) {
  const cerrados = conteos.COMPLETADO + conteos.ANULADO;
  const total = conteos["EN PROCESO"] + conteos["EN PAUSA"] + cerrados;
  const avance = porcentaje(cerrados, total);

  return (
    <div className="mt-auto border-t border-slate-100 pt-4">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-display font-semibold text-slate-700">Avance de cierre</span>
        <span className="text-[11px] text-slate-500">
          <span className="font-display font-bold tabular-nums text-slate-900">{cerrados}</span> de {total} cerrados ·{" "}
          <span className="font-display font-bold tabular-nums text-slate-900">{avance}%</span>
        </span>
      </div>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-slate-100">
        {[
          { clave: "COMPLETADO" as const, clase: "bg-emerald-500" },
          { clave: "ANULADO" as const, clase: "bg-rose-500" },
        ].map(({ clave, clase }, indice) =>
          conteos[clave] === 0 ? null : (
            <motion.div
              key={clave}
              className={`h-full ${clase}`}
              initial={{ width: 0 }}
              animate={{ width: `${porcentaje(conteos[clave], total)}%` }}
              transition={{ ...TRANSICION_GRAFICO, delay: 0.4 + indice * 0.1 }}
            />
          ),
        )}
      </div>
      <div className="mt-2 flex gap-4 text-[10px] font-medium text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-emerald-500" /> Completados
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-rose-500" /> Anulados
        </span>
      </div>
    </div>
  );
}
