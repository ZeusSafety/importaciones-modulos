"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { HiCheck, HiChevronDown, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { normalizarBusqueda } from "@/modules/shared/domain/texto";
import { useDesplegable } from "../hooks/useDesplegable";
import { useMontado } from "../hooks/useMontado";
import type { TonoInsignia } from "./Insignia";

const OPCIONES_PARA_BUSCAR = 8;

/** Colores fijos: los tokens de Tailwind (emerald, red…) se reasignan en modo oscuro. */
const COLORES_TONO: Record<TonoInsignia, { disparador: string; texto: string; punto: string; activa: string; seleccionada: string }> = {
  exito: {
    disparador: "border-[#10b981]/70 bg-[#10b981]/10 ring-[#10b981]/15",
    texto: "text-[#047857] dark:text-[#6ee7b7]",
    punto: "bg-[#10b981]",
    activa: "bg-[#10b981]/12 text-[#047857] dark:text-[#6ee7b7]",
    seleccionada: "bg-gradient-to-r from-[#10b981] to-[#059669] text-white",
  },
  advertencia: {
    disparador: "border-[#f59e0b]/70 bg-[#f59e0b]/10 ring-[#f59e0b]/15",
    texto: "text-[#c2410c] dark:text-[#fcd34d]",
    punto: "bg-[#f59e0b]",
    activa: "bg-[#f59e0b]/12 text-[#c2410c] dark:text-[#fcd34d]",
    seleccionada: "bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-white",
  },
  peligro: {
    disparador: "border-[#ef4444]/70 bg-[#ef4444]/10 ring-[#ef4444]/15",
    texto: "text-[#b91c1c] dark:text-[#fca5a5]",
    punto: "bg-[#ef4444]",
    activa: "bg-[#ef4444]/12 text-[#b91c1c] dark:text-[#fca5a5]",
    seleccionada: "bg-gradient-to-r from-[#f43f5e] to-[#dc2626] text-white",
  },
  info: {
    disparador: "border-[#3b82f6]/70 bg-[#3b82f6]/10 ring-[#3b82f6]/15",
    texto: "text-[#1d4ed8] dark:text-[#93c5fd]",
    punto: "bg-[#3b82f6]",
    activa: "bg-[#3b82f6]/12 text-[#1d4ed8] dark:text-[#93c5fd]",
    seleccionada: "bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] text-white",
  },
  neutro: {
    disparador: "border-[#94a3b8]/70 bg-[#94a3b8]/10 ring-[#94a3b8]/15",
    texto: "text-[#475569] dark:text-[#cbd5e1]",
    punto: "bg-[#94a3b8]",
    activa: "bg-[#94a3b8]/15 text-[#475569] dark:text-[#cbd5e1]",
    seleccionada: "bg-gradient-to-r from-[#94a3b8] to-[#64748b] text-white",
  },
};

interface PropsSelector<T extends string> {
  id: string;
  valor: T | "";
  opciones: readonly T[];
  alCambiar: (valor: T) => void;
  marcador: string;
  disabled?: boolean;
  /** Colorea el disparador y cada opción según su tono (p. ej. estados). */
  tonos?: Record<T, TonoInsignia>;
}

export function Selector<T extends string>({ id, valor, opciones, alCambiar, marcador, disabled, tonos }: PropsSelector<T>) {
  const montado = useMontado();
  const desplegable = useDesplegable<HTMLButtonElement>({ alturaMaxima: 288, alturaMinimaHaciaAbajo: 200 });
  const { disparador, panel, posicion, abierto, cerrar } = desplegable;
  const [filtro, setFiltro] = useState("");
  const [indiceActivo, setIndiceActivo] = useState(0);

  const colorActual = tonos && valor !== "" ? COLORES_TONO[tonos[valor]] : undefined;
  const buscable = opciones.length > OPCIONES_PARA_BUSCAR;
  const visibles = filtro.trim() === "" ? opciones : opciones.filter((o) => normalizarBusqueda(o).includes(normalizarBusqueda(filtro)));
  const idLista = `${id}-lista`;
  const idOpcion = (indice: number) => `${id}-opcion-${indice}`;

  const abrir = () => {
    if (disabled) return;
    setFiltro("");
    setIndiceActivo(Math.max(0, opciones.indexOf(valor as T)));
    desplegable.abrir();
  };

  const seleccionar = (opcion: T) => {
    alCambiar(opcion);
    cerrar(true);
  };

  const mover = (destino: number) => {
    if (visibles.length === 0) return;
    setIndiceActivo((destino + visibles.length) % visibles.length);
  };

  useEffect(() => {
    if (abierto) document.getElementById(idOpcion(indiceActivo))?.scrollIntoView({ block: "nearest" });
  });

  const manejarTecla = (evento: KeyboardEvent<HTMLElement>) => {
    if (!abierto) {
      if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
        evento.preventDefault();
        abrir();
      }
      return;
    }
    switch (evento.key) {
      case "ArrowDown":
        evento.preventDefault();
        mover(indiceActivo + 1);
        return;
      case "ArrowUp":
        evento.preventDefault();
        mover(indiceActivo - 1);
        return;
      case "Home":
        evento.preventDefault();
        mover(0);
        return;
      case "End":
        evento.preventDefault();
        mover(visibles.length - 1);
        return;
      case "Enter":
        evento.preventDefault();
        if (visibles[indiceActivo] !== undefined) seleccionar(visibles[indiceActivo]);
        return;
      case " ":
        if (buscable) return;
        evento.preventDefault();
        if (visibles[indiceActivo] !== undefined) seleccionar(visibles[indiceActivo]);
        return;
      case "Tab":
        cerrar(false);
        return;
    }
  };

  return (
    <>
      <button
        ref={disparador}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={abierto ? idLista : undefined}
        aria-activedescendant={abierto && !buscable && visibles.length > 0 ? idOpcion(indiceActivo) : undefined}
        onClick={() => (abierto ? cerrar(true) : abrir())}
        onKeyDown={manejarTecla}
        className={`flex h-10 w-full items-center justify-between gap-2 rounded-lg border bg-superficie px-3 text-left text-sm shadow-sm outline-none transition-colors duration-300 disabled:cursor-not-allowed disabled:bg-slate-100 ${
          colorActual
            ? `${colorActual.disparador} ${abierto ? "ring-4" : "focus-visible:ring-4"}`
            : abierto
              ? "border-zeus-azul ring-4 ring-zeus-azul/10"
              : "border-slate-300 hover:border-zeus-azul/50 focus-visible:border-zeus-azul focus-visible:ring-4 focus-visible:ring-zeus-azul/10"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {colorActual && (
            <motion.span
              key={valor}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
              className={`insignia-punto h-2 w-2 shrink-0 rounded-full ${colorActual.punto}`}
              aria-hidden
            />
          )}
          <span className={`truncate ${valor === "" ? "text-slate-400" : colorActual ? `font-bold ${colorActual.texto}` : "font-medium text-slate-900"}`}>
            {valor === "" ? marcador : valor}
          </span>
        </span>
        <HiChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${disabled ? "text-slate-400" : "text-zeus-tinta"} ${abierto ? "rotate-180" : ""}`}
        />
      </button>

      {montado &&
        createPortal(
          <AnimatePresence>
            {posicion && (
              <motion.div
                ref={panel}
                initial={{ opacity: 0, y: posicion.haciaArriba ? 6 : -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } }}
                exit={{ opacity: 0, y: posicion.haciaArriba ? 4 : -4, scale: 0.98, transition: { duration: 0.12 } }}
                style={{
                  left: posicion.left,
                  width: posicion.width,
                  top: posicion.top,
                  bottom: posicion.bottom,
                  transformOrigin: posicion.haciaArriba ? "bottom" : "top",
                }}
                className="fixed z-[90] flex min-w-44 flex-col overflow-hidden rounded-xl border border-slate-200 bg-superficie shadow-[0_12px_32px_rgba(0,45,90,0.16)]"
              >
                {buscable && (
                  <div className="relative border-b border-slate-100 p-2">
                    <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-4.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      autoFocus
                      value={filtro}
                      onChange={(evento) => {
                        setFiltro(evento.target.value);
                        setIndiceActivo(0);
                      }}
                      onKeyDown={manejarTecla}
                      placeholder="Buscar…"
                      aria-label="Filtrar opciones"
                      aria-controls={idLista}
                      aria-activedescendant={visibles.length > 0 ? idOpcion(indiceActivo) : undefined}
                      className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 pl-8 pr-2 text-xs uppercase outline-none focus:border-zeus-azul/50 focus:bg-superficie"
                    />
                  </div>
                )}
                <ul
                  id={idLista}
                  role="listbox"
                  style={{ maxHeight: posicion.alturaMaxima - (buscable ? 49 : 0) }}
                  className="scroll-zeus overflow-y-auto p-1.5"
                >
                  {visibles.length === 0 && <li className="px-3 py-2.5 text-center text-xs text-slate-400">Sin coincidencias</li>}
                  {visibles.map((opcion, indice) => {
                    const seleccionada = opcion === valor;
                    const activa = indice === indiceActivo;
                    const color = tonos ? COLORES_TONO[tonos[opcion]] : undefined;
                    const estilo = color
                      ? seleccionada
                        ? `${color.seleccionada} font-semibold`
                        : activa
                          ? color.activa
                          : "text-slate-700"
                      : seleccionada
                        ? "bg-zeus-azul font-semibold text-white"
                        : activa
                          ? "bg-zeus-celeste text-zeus-tinta"
                          : "text-slate-700";
                    return (
                      <li
                        key={opcion}
                        id={idOpcion(indice)}
                        role="option"
                        aria-selected={seleccionada}
                        onPointerEnter={() => setIndiceActivo(indice)}
                        onClick={() => seleccionar(opcion)}
                        className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-[13px] transition-colors ${estilo}`}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          {color && <span className={`h-2 w-2 shrink-0 rounded-full ${seleccionada ? "bg-white" : color.punto}`} aria-hidden />}
                          <span className="truncate">{opcion}</span>
                        </span>
                        {seleccionada && <HiCheck className={`h-4 w-4 shrink-0 ${color ? "text-white" : "text-zeus-dorado"}`} />}
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
