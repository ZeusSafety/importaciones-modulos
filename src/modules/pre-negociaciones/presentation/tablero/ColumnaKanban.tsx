"use client";

import { AnimatePresence } from "framer-motion";
import { useState, type ReactNode } from "react";
import { HiOutlineArrowDownTray } from "react-icons/hi2";
import type { EstadoPreNegociacion } from "../../domain/valores";
import { COLUMNAS_TABLERO } from "./columnasTablero";

interface PropsColumna {
  estado: EstadoPreNegociacion;
  cantidad: number;
  /** Hay una tarjeta en el aire. */
  arrastrando: boolean;
  alSoltar: (id: string) => void;
  children: ReactNode;
}

export function ColumnaKanban({ estado, cantidad, arrastrando, alSoltar, children }: PropsColumna) {
  const [encima, setEncima] = useState(false);
  const { titulo, descripcion, icono: Icono, acento, fondoIcono, zonaActiva } = COLUMNAS_TABLERO[estado];

  return (
    <section
      aria-label={titulo}
      onDragOver={(evento) => {
        if (!arrastrando) return;
        evento.preventDefault();
        evento.dataTransfer.dropEffect = "move";
        if (!encima) setEncima(true);
      }}
      onDragLeave={(evento) => {
        if (!evento.currentTarget.contains(evento.relatedTarget as Node | null)) setEncima(false);
      }}
      onDrop={(evento) => {
        evento.preventDefault();
        setEncima(false);
        const id = evento.dataTransfer.getData("text/plain");
        if (id) alSoltar(id);
      }}
      className="flex min-w-[85%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/70 shadow-sm sm:min-w-[300px] xl:min-w-0 xl:flex-1 xl:basis-0"
    >
      <span className={`h-1 w-full ${acento}`} aria-hidden />
      <header className="flex items-center gap-3 border-b border-slate-200/80 bg-superficie px-4 py-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${fondoIcono}`}>
          <Icono className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-sm font-semibold text-slate-900">{titulo}</h2>
          <p className="truncate text-[11px] text-slate-500">{descripcion}</p>
        </div>
        <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-slate-100 px-2 font-display text-xs font-bold text-slate-700">
          {cantidad}
        </span>
      </header>

      <div
        className={`scroll-zeus m-2 flex min-h-[420px] flex-1 flex-col gap-2.5 overflow-y-auto rounded-xl border-2 border-dashed p-1.5 transition-colors lg:max-h-[calc(100vh-320px)] ${
          encima ? zonaActiva : arrastrando ? "border-slate-300/80" : "border-transparent"
        }`}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {children}
        </AnimatePresence>
        {cantidad === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center text-slate-400">
            <HiOutlineArrowDownTray className="h-6 w-6" />
            <p className="text-xs">{arrastrando ? "Suelte aquí la tarjeta" : "Sin pre-negociaciones"}</p>
          </div>
        )}
      </div>
    </section>
  );
}
