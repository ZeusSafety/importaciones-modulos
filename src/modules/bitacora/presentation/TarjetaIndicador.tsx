"use client";

import { animate, motion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { PALETA_GRAFICO, porcentaje, totalSeries, TRANSICION_GRAFICO, type SerieGrafico } from "@/modules/shared/presentation/graficos/paleta";

const ACENTOS = {
  azul: {
    icono: "bg-zeus-celeste text-zeus-azul",
    resaltado: "bg-zeus-celeste text-zeus-tinta",
    filete: "bg-zeus-azul",
  },
  verde: {
    icono: "bg-emerald-50 text-emerald-700",
    resaltado: "bg-emerald-50 text-emerald-700",
    filete: "bg-emerald-600",
  },
  dorado: {
    icono: "bg-amber-50 text-amber-700",
    resaltado: "bg-amber-50 text-amber-800",
    filete: "bg-zeus-dorado",
  },
  violeta: {
    icono: "bg-violet-50 text-violet-700",
    resaltado: "bg-violet-50 text-violet-700",
    filete: "bg-violet-600",
  },
} as const;

export type PieIndicador =
  | { readonly tipo: "distribucion"; readonly series: readonly SerieGrafico[] }
  | { readonly tipo: "texto"; readonly resaltado: string; readonly detalle: string };

function ContadorAnimado({ valor }: { valor: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const nodo = ref.current;
    if (nodo === null) return;
    const control = animate(0, valor, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (actual) => {
        nodo.textContent = String(Math.round(actual));
      },
    });
    return () => control.stop();
  }, [valor]);

  return (
    <span ref={ref} aria-label={String(valor)}>
      0
    </span>
  );
}

function PieDistribucion({ series }: { series: readonly SerieGrafico[] }) {
  const total = totalSeries(series);
  return (
    <div>
      <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-slate-100">
        {total === 0 ? (
          <span className="h-full w-full bg-slate-200" />
        ) : (
          series.map((serie, indice) =>
            serie.valor === 0 ? null : (
              <motion.span
                key={serie.etiqueta}
                className={`h-full ${PALETA_GRAFICO[serie.color].punto}`}
                initial={{ width: 0 }}
                animate={{ width: `${porcentaje(serie.valor, total)}%` }}
                transition={{ ...TRANSICION_GRAFICO, delay: 0.3 + indice * 0.1 }}
              />
            ),
          )
        )}
      </div>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {series.map((serie) => (
          <li
            key={serie.etiqueta}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-500"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${PALETA_GRAFICO[serie.color].punto}`} />
            <span className="font-display font-bold tabular-nums text-slate-800">{serie.valor}</span>
            <span className="capitalize">{serie.etiqueta.toLowerCase()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface PropsTarjetaIndicador {
  icono: ReactNode;
  etiqueta: string;
  valor: number;
  acento: keyof typeof ACENTOS;
  pie: PieIndicador;
}

export function TarjetaIndicador({ icono, etiqueta, valor, acento, pie }: PropsTarjetaIndicador) {
  const estilo = ACENTOS[acento];
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-superficie p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-24px_rgba(0,45,90,0.45)]">
      <span className={`absolute inset-y-0 left-0 w-1 ${estilo.filete}`} />

      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase leading-snug tracking-[0.14em] text-slate-400">{etiqueta}</p>
          <p className="mt-2 font-display text-4xl font-bold leading-none tabular-nums tracking-tight text-zeus-azul">
            <ContadorAnimado valor={valor} />
          </p>
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/5 [&>svg]:h-5 [&>svg]:w-5 ${estilo.icono}`}>
          {icono}
        </span>
      </div>

      <div className="mt-5 pl-2">
        {pie.tipo === "distribucion" ? (
          <PieDistribucion series={pie.series} />
        ) : (
          <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
            <span className={`shrink-0 rounded-md px-2 py-1 font-display text-[11px] font-bold tracking-wide ${estilo.resaltado}`}>
              {pie.resaltado}
            </span>
            <span className="text-xs leading-snug text-slate-500">{pie.detalle}</span>
          </div>
        )}
      </div>
    </article>
  );
}
