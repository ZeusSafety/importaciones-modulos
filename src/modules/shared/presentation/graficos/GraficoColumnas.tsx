"use client";

import { motion } from "framer-motion";
import { PALETA_GRAFICO, porcentaje, totalSeries, TRANSICION_GRAFICO, type SerieGrafico } from "./paleta";

const LINEAS_GUIA = [0, 25, 50, 75, 100] as const;

/** Crece hasta el alto disponible de la tarjeta, con un mínimo para que las columnas se lean. */
export function GraficoColumnas({ series }: { series: readonly SerieGrafico[] }) {
  const total = totalSeries(series);
  const maximo = Math.max(...series.map((serie) => serie.valor), 1);

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative min-h-48 flex-1 pl-6 pt-7">
        <div className="absolute bottom-0 left-6 right-0 top-7">
          {LINEAS_GUIA.map((nivel) => {
            const valor = (maximo * nivel) / 100;
            return (
              <span
                key={nivel}
                className={`absolute inset-x-0 border-t ${nivel === 0 ? "border-slate-300" : "border-dashed border-slate-100"}`}
                style={{ bottom: `${nivel}%` }}
              >
                {Number.isInteger(valor) && (
                  <span className="absolute right-full top-0 -translate-y-1/2 pr-2 text-[9px] font-semibold tabular-nums text-slate-400">
                    {valor}
                  </span>
                )}
              </span>
            );
          })}
        </div>
        <div className="absolute bottom-0 left-6 right-0 top-7 flex items-end justify-around gap-3 px-1">
          {series.map((serie, indice) => (
            <div key={serie.etiqueta} className="group relative flex h-full flex-1 items-end justify-center" title={`${serie.descripcion}: ${serie.valor}`}>
              <span className="absolute inset-y-0 w-full max-w-12 rounded-t-lg bg-slate-50" aria-hidden />
              <motion.div
                className={`relative w-full max-w-12 rounded-t-lg bg-gradient-to-t shadow-sm transition-[filter] group-hover:brightness-110 ${PALETA_GRAFICO[serie.color].barra}`}
                initial={{ height: 0 }}
                animate={{ height: `${(serie.valor / maximo) * 100}%` }}
                transition={{ ...TRANSICION_GRAFICO, delay: 0.15 + indice * 0.08 }}
              >
                <span
                  className={`absolute -top-6 left-1/2 -translate-x-1/2 rounded-md px-1.5 py-0.5 font-display text-[11px] font-bold tabular-nums ${
                    serie.valor === 0 ? "text-slate-400" : "bg-zeus-azul text-white shadow-sm"
                  }`}
                >
                  {serie.valor}
                </span>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2.5 flex justify-around gap-3 pl-7 pr-1">
        {series.map((serie) => (
          <div key={serie.etiqueta} className="flex min-w-0 flex-1 flex-col items-center text-center" title={serie.descripcion}>
            <span className={`mb-1 h-1 w-5 rounded-full ${PALETA_GRAFICO[serie.color].punto}`} />
            <span className="line-clamp-2 text-[10px] font-semibold uppercase leading-tight text-slate-600">{serie.etiqueta}</span>
            <span className="mt-0.5 text-[10px] font-medium tabular-nums text-slate-400">{porcentaje(serie.valor, total)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
