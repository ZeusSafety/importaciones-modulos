/** Clases completas por color para que Tailwind las detecte al compilar. */
export const PALETA_GRAFICO = {
  azul: { trazo: "stroke-zeus-azul-medio", punto: "bg-zeus-azul-medio", barra: "from-zeus-azul to-zeus-azul-medio" },
  celeste: { trazo: "stroke-sky-500", punto: "bg-sky-500", barra: "from-sky-600 to-sky-400" },
  verde: { trazo: "stroke-emerald-500", punto: "bg-emerald-500", barra: "from-emerald-600 to-emerald-400" },
  rojo: { trazo: "stroke-rose-500", punto: "bg-rose-500", barra: "from-rose-600 to-rose-400" },
  naranja: { trazo: "stroke-orange-500", punto: "bg-orange-500", barra: "from-orange-600 to-orange-400" },
  dorado: { trazo: "stroke-amber-500", punto: "bg-amber-500", barra: "from-amber-600 to-zeus-dorado" },
  violeta: { trazo: "stroke-violet-500", punto: "bg-violet-500", barra: "from-violet-600 to-violet-400" },
  gris: { trazo: "stroke-slate-400", punto: "bg-slate-400", barra: "from-slate-500 to-slate-400" },
} as const;

export type ColorGrafico = keyof typeof PALETA_GRAFICO;

export interface SerieGrafico {
  readonly etiqueta: string;
  /** Texto completo para el tooltip cuando `etiqueta` es una abreviatura. */
  readonly descripcion: string;
  readonly valor: number;
  readonly color: ColorGrafico;
}

export function totalSeries(series: readonly SerieGrafico[]): number {
  return series.reduce((suma, serie) => suma + serie.valor, 0);
}

export function porcentaje(valor: number, total: number): number {
  return total === 0 ? 0 : Math.round((valor / total) * 100);
}

export interface SegmentoGrafico {
  readonly serie: SerieGrafico;
  readonly indice: number;
  /** Posición y largo en unidades de 0 a 100 sobre el trazo (`pathLength={100}`). */
  readonly inicio: number;
  readonly largo: number;
}

/** Reparte el trazo entre las series, dejando una separación visual si hay más de un segmento. */
export function calcularSegmentos(series: readonly SerieGrafico[], separacion: number): SegmentoGrafico[] {
  const total = totalSeries(series);
  const hueco = series.filter((serie) => serie.valor > 0).length > 1 ? separacion : 0;
  const segmentos: SegmentoGrafico[] = [];
  let inicio = 0;
  series.forEach((serie, indice) => {
    const largo = total === 0 ? 0 : (serie.valor / total) * 100;
    segmentos.push({ serie, indice, inicio, largo: Math.max(largo - hueco, 0) });
    inicio += largo;
  });
  return segmentos;
}

export const TRANSICION_GRAFICO = { duration: 0.9, ease: [0.22, 1, 0.36, 1] } as const;
