"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { HiOutlineCube } from "react-icons/hi2";
import { LONGITUD_MINIMA_BUSQUEDA } from "@/modules/catalogo-productos/application/BuscarProductos";
import type { Producto } from "@/modules/catalogo-productos/domain/Producto";
import { aMayusculas } from "@/modules/shared/domain/texto";
import { mensajeDeError } from "@/modules/shared/infrastructure/http/clienteHttp";
import { apiRequerimientos } from "./apiRequerimientos";

const RETARDO_BUSQUEDA_MS = 250;

type EstadoBusqueda =
  | { tipo: "inactivo" }
  | { tipo: "resultados"; termino: string; productos: Producto[] }
  | { tipo: "error"; termino: string; mensaje: string };

interface PropsBuscadorProducto {
  id: string;
  codigosAgregados: ReadonlySet<string>;
  alSeleccionar: (producto: Producto | null) => void;
}

export function BuscadorProducto({ id, codigosAgregados, alSeleccionar }: PropsBuscadorProducto) {
  const [termino, setTermino] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState<EstadoBusqueda>({ tipo: "inactivo" });

  const terminoValido = termino.trim().length >= LONGITUD_MINIMA_BUSQUEDA;

  useEffect(() => {
    if (!terminoValido) return;
    let vigente = true;
    const temporizador = window.setTimeout(async () => {
      try {
        const productos = await apiRequerimientos.buscarProductos(termino);
        if (vigente) setBusqueda({ tipo: "resultados", termino, productos });
      } catch (error) {
        if (vigente) setBusqueda({ tipo: "error", termino, mensaje: mensajeDeError(error) });
      }
    }, RETARDO_BUSQUEDA_MS);
    return () => {
      vigente = false;
      window.clearTimeout(temporizador);
    };
  }, [termino, terminoValido]);

  const busquedaActual = busqueda.tipo !== "inactivo" && busqueda.termino === termino ? busqueda : null;
  const mostrarPanel = abierto && terminoValido;

  const seleccionar = (producto: Producto) => {
    setTermino(producto.nombre);
    setAbierto(false);
    alSeleccionar(producto);
  };

  return (
    <div className="relative">
      <HiOutlineCube className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zeus-tinta/70" />
      <input
        id={id}
        value={termino}
        autoComplete="off"
        placeholder="Escriba el nombre o código del producto"
        onFocus={() => setAbierto(true)}
        onBlur={() => window.setTimeout(() => setAbierto(false), 150)}
        onChange={(evento) => {
          setTermino(aMayusculas(evento.target.value));
          setAbierto(true);
          alSeleccionar(null);
        }}
        className="h-10 w-full rounded-lg border border-slate-300 bg-superficie pl-9 pr-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-zeus-azul focus:ring-4 focus:ring-zeus-azul/10"
      />

      <AnimatePresence>
        {mostrarPanel && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.18 } }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
            className="scroll-zeus absolute left-0 right-0 top-full z-20 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-superficie p-1.5 shadow-xl"
          >
            {busquedaActual === null && <li className="px-3 py-2.5 text-xs text-slate-500">Buscando productos…</li>}
            {busquedaActual?.tipo === "error" && (
              <li className="px-3 py-2.5 text-xs text-red-600">{busquedaActual.mensaje}</li>
            )}
            {busquedaActual?.tipo === "resultados" && busquedaActual.productos.length === 0 && (
              <li className="px-3 py-2.5 text-xs text-slate-500">No se encontraron productos.</li>
            )}
            {busquedaActual?.tipo === "resultados" &&
              busquedaActual.productos.map((producto) => {
                const agregado = codigosAgregados.has(producto.codigo);
                return (
                  <li key={producto.codigo}>
                    <button
                      type="button"
                      disabled={agregado}
                      onMouseDown={(evento) => evento.preventDefault()}
                      onClick={() => seleccionar(producto)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-zeus-celeste disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zeus-celeste text-zeus-tinta">
                        <HiOutlineCube />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-slate-800">{producto.nombre}</span>
                        <span className="block text-[11px] text-slate-500">
                          {producto.codigo} · Stock {producto.stockActual} / mín. {producto.stockMinimo}
                        </span>
                      </span>
                      {agregado && <span className="text-[10px] font-semibold text-slate-500">AGREGADO</span>}
                    </button>
                  </li>
                );
              })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
