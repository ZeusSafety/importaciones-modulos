"use client";

import { motion } from "framer-motion";
import { PALETA_GRAFICO, porcentaje, totalSeries, TRANSICION_GRAFICO, type SerieGrafico } from "./paleta";

const LINEAS_GUIA = [0, 25, 50, 75, 100] as const;

export function GraficoColumnas({ series }: { series: readonly SerieGrafico[] }) {
  const total = totalSeries(series);
  const maximo = Math.max(...series.map((serie) => serie.valor), 1);

  return (
    <div>
      <div className="relative h-44 pt-6">
        <div className="absolute inset-x-0 bottom-0 top-6">
          {LINEAS_GUIA.map((nivel) => (
            <span
              key={nivel}
              className={`absolute inset-x-0 border-t ${nivel === 0 ? "border-slate-200" : "border-dashed border-slate-100"}`}
              style={{ bottom: `${nivel}%` }}
            />
          ))}
        </div>
        <div className="relative flex h-full items-end justify-around gap-3 px-1">
          {series.map((serie, indice) => (
            <div key={serie.etiqueta} className="group flex h-full flex-1 items-end justify-center">
              <motion.div
                className={`relative w-full max-w-12 rounded-t-lg bg-gradient-to-t shadow-sm transition-[filter] group-hover:brightness-110 ${PALETA_GRAFICO[serie.color].barra}`}
                initial={{ height: 0 }}
                animate={{ height: `${(serie.valor / maximo) * 100}%` }}
                transition={{ ...TRANSICION_GRAFICO, delay: 0.15 + indice * 0.08 }}
              >
                <span className="absolute inset-x-0 -top-5 text-center font-display text-xs font-bold tabular-nums text-slate-900">
                  {serie.valor}
                </span>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-around gap-3 px-1">
        {series.map((serie) => (
          <div key={serie.etiqueta} className="flex min-w-0 flex-1 flex-col items-center text-center" title={serie.descripcion}>
            <span className="line-clamp-2 text-[10px] font-semibold uppercase leading-tight text-slate-500">{serie.etiqueta}</span>
            <span className="mt-0.5 text-[10px] font-medium tabular-nums text-slate-400">{porcentaje(serie.valor, total)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
