"use client";

import { animate, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { HiArrowUpRight } from "react-icons/hi2";
import { PALETA_GRAFICO, porcentaje, totalSeries, TRANSICION_GRAFICO, type SerieGrafico } from "@/modules/shared/presentation/graficos/paleta";

/** Colores fijos: los tokens de Tailwind se reasignan en modo oscuro. */
const ACENTOS = {
  azul: {
    franja: "from-[#002d5a] to-[#2563eb]",
    icono: "from-[#1d4ed8] to-[#002d5a] shadow-[#002d5a]/30",
  },
  verde: {
    franja: "from-[#047857] to-[#10b981]",
    icono: "from-[#10b981] to-[#047857] shadow-emerald-500/30",
  },
  dorado: {
    franja: "from-[#b45309] to-[#e5a017]",
    icono: "from-[#f59e0b] to-[#b45309] shadow-amber-500/30",
  },
  violeta: {
    franja: "from-[#6d28d9] to-[#8b5cf6]",
    icono: "from-[#8b5cf6] to-[#6d28d9] shadow-violet-500/30",
  },
} as const;

export type PieIndicador =
  | { readonly tipo: "distribucion"; readonly series: readonly SerieGrafico[] }
  | { readonly tipo: "dato"; readonly etiqueta: string; readonly valor: string; readonly detalle: string };

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
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {series.map((serie) => (
          <li key={serie.etiqueta} className="flex items-center gap-1.5 text-[11px]">
            <span className={`h-2 w-2 shrink-0 rounded-sm ${PALETA_GRAFICO[serie.color].punto}`} />
            <span className="truncate font-medium capitalize text-slate-500">{serie.etiqueta.toLowerCase()}</span>
            <span className="ml-auto font-display font-bold tabular-nums text-slate-800">{serie.valor}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PieDato({ etiqueta, valor, detalle }: { etiqueta: string; valor: string; detalle: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
      <span className="font-display text-lg font-bold leading-none tabular-nums text-zeus-tinta">{valor}</span>
      <span className="h-7 w-px bg-slate-200" aria-hidden />
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{etiqueta}</span>
        <span className="block truncate text-xs text-slate-600">{detalle}</span>
      </span>
    </div>
  );
}

interface PropsTarjetaIndicador {
  icono: ReactNode;
  etiqueta: string;
  descripcion: string;
  valor: number;
  unidad: string;
  acento: keyof typeof ACENTOS;
  ruta: string;
  pie: PieIndicador;
}

export function TarjetaIndicador({ icono, etiqueta, descripcion, valor, unidad, acento, ruta, pie }: PropsTarjetaIndicador) {
  const estilo = ACENTOS[acento];
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-superficie shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-24px_rgba(0,45,90,0.45)]">
      <span className={`h-1 w-full bg-gradient-to-r ${estilo.franja}`} aria-hidden />

      <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-md [&>svg]:h-[18px] [&>svg]:w-[18px] ${estilo.icono}`}
        >
          {icono}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-sm font-semibold text-slate-900">{etiqueta}</h2>
          <p className="truncate text-[11px] text-slate-500">{descripcion}</p>
        </div>
        <Link
          href={ruta}
          aria-label={`Ir a ${etiqueta}`}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-colors hover:border-zeus-azul hover:bg-zeus-azul hover:text-white"
        >
          <HiArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      <div className="flex flex-1 flex-col gap-4 px-4 pb-4 pt-3.5">
        <p className="flex items-baseline gap-2">
          <span className="font-display text-[34px] font-bold leading-none tabular-nums tracking-tight text-zeus-tinta">
            <ContadorAnimado valor={valor} />
          </span>
          <span className="text-xs font-medium text-slate-500">{unidad}</span>
        </p>
        <div className="mt-auto">
          {pie.tipo === "distribucion" ? <PieDistribucion series={pie.series} /> : <PieDato {...pie} />}
        </div>
      </div>
    </article>
  );
}
