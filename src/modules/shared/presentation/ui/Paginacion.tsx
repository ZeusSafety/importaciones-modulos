"use client";

import type { ReactNode } from "react";
import { HiChevronDoubleLeft, HiChevronDoubleRight, HiChevronLeft, HiChevronRight } from "react-icons/hi2";

interface PropsPaginacion {
  paginaActual: number;
  totalPaginas: number;
  alCambiar: (pagina: number) => void;
}

function BotonPagina({
  etiqueta,
  deshabilitado,
  alPulsar,
  children,
}: {
  etiqueta: string;
  deshabilitado: boolean;
  alPulsar: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      disabled={deshabilitado}
      onClick={alPulsar}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-superficie text-slate-600 shadow-sm transition hover:border-zeus-azul hover:text-zeus-tinta disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:text-slate-600"
    >
      {children}
    </button>
  );
}

export function Paginacion({ paginaActual, totalPaginas, alCambiar }: PropsPaginacion) {
  const esPrimera = paginaActual <= 1;
  const esUltima = paginaActual >= totalPaginas;
  return (
    <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-4 py-2.5">
      <div className="flex gap-1.5">
        <BotonPagina etiqueta="Primera página" deshabilitado={esPrimera} alPulsar={() => alCambiar(1)}>
          <HiChevronDoubleLeft className="h-4 w-4" />
        </BotonPagina>
        <BotonPagina etiqueta="Página anterior" deshabilitado={esPrimera} alPulsar={() => alCambiar(paginaActual - 1)}>
          <HiChevronLeft className="h-4 w-4" />
        </BotonPagina>
      </div>
      <span className="font-display text-xs font-semibold text-slate-700">
        Página {paginaActual} de {totalPaginas}
      </span>
      <div className="flex gap-1.5">
        <BotonPagina etiqueta="Página siguiente" deshabilitado={esUltima} alPulsar={() => alCambiar(paginaActual + 1)}>
          <HiChevronRight className="h-4 w-4" />
        </BotonPagina>
        <BotonPagina etiqueta="Última página" deshabilitado={esUltima} alPulsar={() => alCambiar(totalPaginas)}>
          <HiChevronDoubleRight className="h-4 w-4" />
        </BotonPagina>
      </div>
    </div>
  );
}

export function paginar<T>(elementos: readonly T[], pagina: number, porPagina: number) {
  const totalPaginas = Math.max(1, Math.ceil(elementos.length / porPagina));
  const paginaSegura = Math.min(Math.max(1, pagina), totalPaginas);
  const inicio = (paginaSegura - 1) * porPagina;
  return {
    elementos: elementos.slice(inicio, inicio + porPagina),
    paginaActual: paginaSegura,
    totalPaginas,
  };
}
