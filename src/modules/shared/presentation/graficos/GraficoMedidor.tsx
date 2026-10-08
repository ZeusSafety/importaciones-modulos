"use client";

import { motion } from "framer-motion";
import { calcularSegmentos, PALETA_GRAFICO, porcentaje, totalSeries, TRANSICION_GRAFICO, type SerieGrafico } from "./paleta";

const CENTRO = 62;
const RADIO = 50;
const ARCO = `M ${CENTRO - RADIO} ${CENTRO} A ${RADIO} ${RADIO} 0 0 1 ${CENTRO + RADIO} ${CENTRO}`;
const GROSOR = 12;
const SEPARACION = 1;
const MARCAS = [0, 25, 50, 75, 100] as const;

function puntoEnArco(porcentajeArco: number, radio: number) {
  const angulo = Math.PI * (1 - porcentajeArco / 100);
  return { x: CENTRO + radio * Math.cos(angulo), y: CENTRO - radio * Math.sin(angulo) };
}

interface PropsGraficoMedidor {
  series: readonly SerieGrafico[];
  /** Serie cuyo porcentaje se muestra al centro del medidor. */
  destacada: SerieGrafico;
  etiquetaDestacada: string;
}

export function GraficoMedidor({ series, destacada, etiquetaDestacada }: PropsGraficoMedidor) {
  const total = totalSeries(series);
  const segmentos = calcularSegmentos(series, SEPARACION);
  const tasa = porcentaje(destacada.valor, total);

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative mx-auto my-auto w-full max-w-64" title={etiquetaDestacada}>
        <svg viewBox="0 0 124 70" className="w-full overflow-visible">
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
          {MARCAS.map((marca) => {
            const interior = puntoEnArco(marca, RADIO - GROSOR / 2 - 2);
            const exterior = puntoEnArco(marca, RADIO - GROSOR / 2 - 4.5);
            return (
              <line
                key={marca}
                x1={interior.x}
                y1={interior.y}
                x2={exterior.x}
                y2={exterior.y}
                strokeWidth={0.8}
                strokeLinecap="round"
                className="stroke-slate-300"
              />
            );
          })}
          <text x={CENTRO - RADIO} y={CENTRO + 8} textAnchor="middle" className="fill-slate-400 text-[5px] font-semibold">
            0%
          </text>
          <text x={CENTRO + RADIO} y={CENTRO + 8} textAnchor="middle" className="fill-slate-400 text-[5px] font-semibold">
            100%
          </text>
        </svg>
        <span
          aria-label={`${etiquetaDestacada}: ${tasa}%`}
          className={`absolute inset-x-0 bottom-[14%] text-center font-display text-4xl font-bold leading-none tabular-nums ${
            tasa > 0 ? "text-emerald-600" : "text-slate-900"
          }`}
        >
          {tasa}%
        </span>
      </div>

      <ul className="mt-5 grid grid-cols-3 gap-2">
        {series.map((serie) => (
          <li key={serie.etiqueta} className="relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50 px-2 py-2.5 text-center">
            <span className={`absolute inset-x-0 top-0 h-0.5 ${PALETA_GRAFICO[serie.color].punto}`} aria-hidden />
            <span className="flex items-center justify-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${PALETA_GRAFICO[serie.color].punto}`} />
              <span className="font-display text-lg font-bold leading-none tabular-nums text-slate-900">{serie.valor}</span>
            </span>
            <span className="mt-1 block truncate text-[9px] font-semibold uppercase tracking-wide text-slate-500">{serie.etiqueta}</span>
            <span className="block text-[9px] font-medium tabular-nums text-slate-400">{porcentaje(serie.valor, total)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
