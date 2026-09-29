"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { calcularSegmentos, PALETA_GRAFICO, porcentaje, totalSeries, TRANSICION_GRAFICO, type SerieGrafico } from "./paleta";

const RADIO = 40;
const GROSOR = 13;
const SEPARACION = 1.2;

interface PropsGraficoDona {
  series: readonly SerieGrafico[];
  etiquetaTotal: string;
}

export function GraficoDona({ series, etiquetaTotal }: PropsGraficoDona) {
  const [activa, setActiva] = useState<number | null>(null);
  const total = totalSeries(series);
  const segmentos = calcularSegmentos(series, SEPARACION);
  const destacada = activa === null ? null : series[activa];

  return (
    <div className="@container">
      <div className="flex flex-col items-center gap-5 @[17rem]:flex-row @[17rem]:gap-4 @md:gap-5">
        <div className="relative h-32 w-32 shrink-0 @md:h-40 @md:w-40">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={RADIO} fill="none" strokeWidth={GROSOR} className="stroke-slate-100" />
            {segmentos.map(({ serie, indice, inicio, largo }) =>
              largo === 0 ? null : (
                <motion.circle
                  key={serie.etiqueta}
                  cx="50"
                  cy="50"
                  r={RADIO}
                  fill="none"
                  pathLength={100}
                  strokeWidth={activa === indice ? GROSOR + 3 : GROSOR}
                  strokeDashoffset={-inicio}
                  className={`${PALETA_GRAFICO[serie.color].trazo} cursor-pointer transition-[stroke-width,opacity] duration-200 ${
                    activa !== null && activa !== indice ? "opacity-35" : ""
                  }`}
                  initial={{ strokeDasharray: "0 100" }}
                  animate={{ strokeDasharray: `${largo} 100` }}
                  transition={{ ...TRANSICION_GRAFICO, delay: 0.15 + indice * 0.08 }}
                  onMouseEnter={() => setActiva(indice)}
                  onMouseLeave={() => setActiva(null)}
                />
              ),
            )}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-display text-3xl font-bold leading-none text-slate-900 tabular-nums">
              {destacada === null ? total : destacada.valor}
            </span>
            <span className="mt-1 max-w-20 text-[9px] font-semibold uppercase leading-tight tracking-[0.12em] text-slate-400">
              {destacada === null ? etiquetaTotal : `${porcentaje(destacada.valor, total)}% · ${destacada.etiqueta}`}
            </span>
          </div>
        </div>

        <ul className="w-full min-w-0 flex-1 space-y-1">
          {series.map((serie, indice) => (
            <li
              key={serie.etiqueta}
              onMouseEnter={() => setActiva(indice)}
              onMouseLeave={() => setActiva(null)}
              className={`flex items-center gap-2 rounded-lg px-2 py-2 transition-colors @md:gap-2.5 @md:px-2.5 ${activa === indice ? "bg-slate-50" : ""}`}
            >
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${PALETA_GRAFICO[serie.color].punto}`} />
              <span className="min-w-0 flex-1 truncate font-display text-[11px] font-medium text-slate-700 @md:text-xs" title={serie.descripcion}>
                {serie.etiqueta}
              </span>
              <span className="font-display text-sm font-bold tabular-nums text-slate-900">{serie.valor}</span>
              <span className="w-9 text-right text-[11px] font-semibold tabular-nums text-slate-400">{porcentaje(serie.valor, total)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
