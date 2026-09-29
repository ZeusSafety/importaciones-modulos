"use client";

import { animate, motion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { PALETA_GRAFICO, porcentaje, totalSeries, TRANSICION_GRAFICO, type SerieGrafico } from "@/modules/shared/presentation/graficos/paleta";

const ACENTOS = {
  azul: {
    icono: "from-zeus-azul to-zeus-azul-medio shadow-zeus-azul/30",
    resaltado: "bg-zeus-celeste text-zeus-tinta",
    franja: "from-zeus-azul to-zeus-azul-medio",
    borde: "hover:border-zeus-azul-medio/40",
  },
  verde: {
    icono: "from-emerald-600 to-emerald-400 shadow-emerald-600/30",
    resaltado: "bg-emerald-50 text-emerald-700",
    franja: "from-emerald-600 to-emerald-400",
    borde: "hover:border-emerald-500/40",
  },
  dorado: {
    icono: "from-amber-500 to-zeus-dorado shadow-amber-500/30",
    resaltado: "bg-amber-50 text-amber-700",
    franja: "from-amber-500 to-zeus-dorado",
    borde: "hover:border-amber-500/40",
  },
  violeta: {
    icono: "from-violet-600 to-violet-400 shadow-violet-600/30",
    resaltado: "bg-violet-50 text-violet-700",
    franja: "from-violet-600 to-violet-400",
    borde: "hover:border-violet-500/40",
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
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-slate-100">
        {series.map((serie, indice) =>
          serie.valor === 0 ? null : (
            <motion.span
              key={serie.etiqueta}
              className={`h-full ${PALETA_GRAFICO[serie.color].punto}`}
              initial={{ width: 0 }}
              animate={{ width: `${porcentaje(serie.valor, total)}%` }}
              transition={{ ...TRANSICION_GRAFICO, delay: 0.3 + indice * 0.1 }}
            />
          ),
        )}
      </div>
      <ul className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
        {series.map((serie) => (
          <li key={serie.etiqueta} className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className={`h-2 w-2 rounded-full ${PALETA_GRAFICO[serie.color].punto}`} />
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
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-superficie p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_-16px_rgba(15,23,42,0.3)] ${estilo.borde}`}
    >
      <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${estilo.franja}`} />

      <div className="mb-5 flex items-center gap-4">
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-105 ${estilo.icono}`}
        >
          {icono}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase leading-snug tracking-[0.1em] text-slate-500">{etiqueta}</p>
          <p className="mt-1 font-display text-[32px] font-bold leading-none tabular-nums text-slate-900">
            <ContadorAnimado valor={valor} />
          </p>
        </div>
      </div>

      <div className="mt-auto border-t border-slate-100 pt-3.5">
        {pie.tipo === "distribucion" ? (
          <PieDistribucion series={pie.series} />
        ) : (
          <div className="flex items-center gap-2">
            <span className={`shrink-0 rounded-md px-2 py-0.5 font-display text-[11px] font-bold ${estilo.resaltado}`}>{pie.resaltado}</span>
            <span className="truncate text-xs text-slate-500">{pie.detalle}</span>
          </div>
        )}
      </div>
    </article>
  );
}
