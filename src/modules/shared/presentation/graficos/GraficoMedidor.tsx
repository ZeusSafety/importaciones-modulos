"use client";

import { motion } from "framer-motion";
import { calcularSegmentos, PALETA_GRAFICO, porcentaje, totalSeries, TRANSICION_GRAFICO, type SerieGrafico } from "./paleta";

const ARCO = "M 12 62 A 50 50 0 0 1 112 62";
const GROSOR = 12;
const SEPARACION = 1;

interface PropsGraficoMedidor {
  series: readonly SerieGrafico[];
  /** Serie cuyo porcentaje se muestra al centro del medidor. */
  destacada: SerieGrafico;
  etiquetaDestacada: string;
}

export function GraficoMedidor({ series, destacada, etiquetaDestacada }: PropsGraficoMedidor) {
  const total = totalSeries(series);
  const segmentos = calcularSegmentos(series, SEPARACION);

  return (
    <div>
      <div className="relative mx-auto w-full max-w-60">
        <svg viewBox="0 0 124 68" className="w-full">
          <path d={ARCO} fill="none" strokeWidth={GROSOR} className="stroke-slate-100" />
          {segmentos.map(({ serie, indice, inicio, largo }) =>
            largo === 0 ? null : (
              <motion.path
                key={serie.etiqueta}
                d={ARCO}
                fill="none"
                pathLength={100}
                strokeWidth={GROSOR}
                strokeDashoffset={-inicio}
                className={PALETA_GRAFICO[serie.color].trazo}
                initial={{ strokeDasharray: "0 100" }}
                animate={{ strokeDasharray: `${largo} 100` }}
                transition={{ ...TRANSICION_GRAFICO, delay: 0.15 + indice * 0.1 }}
              />
            ),
          )}
        </svg>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className="font-display text-3xl font-bold leading-none tabular-nums text-slate-900">
            {porcentaje(destacada.valor, total)}%
          </span>
          <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">{etiquetaDestacada}</span>
        </div>
      </div>

      <ul className="mt-5 grid grid-cols-3 gap-2">
        {series.map((serie) => (
          <li key={serie.etiqueta} className="rounded-xl border border-slate-100 bg-slate-50 px-2 py-2.5 text-center">
            <span className="flex items-center justify-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${PALETA_GRAFICO[serie.color].punto}`} />
              <span className="font-display text-lg font-bold leading-none tabular-nums text-slate-900">{serie.valor}</span>
            </span>
            <span className="mt-1 block truncate text-[9px] font-semibold uppercase tracking-wide text-slate-500">{serie.etiqueta}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
