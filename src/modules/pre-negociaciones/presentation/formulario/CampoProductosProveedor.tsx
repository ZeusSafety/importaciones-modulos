"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { HiOutlineCube, HiOutlineXMark } from "react-icons/hi2";
import { LONGITUD_MINIMA_BUSQUEDA } from "@/modules/catalogo-productos/application/BuscarProductos";
import type { Producto } from "@/modules/catalogo-productos/domain/Producto";
import { MiniaturaProducto } from "@/modules/catalogo-productos/presentation/MiniaturaProducto";
import { aMayusculas, normalizarBusqueda } from "@/modules/shared/domain/texto";
import { mensajeDeError, obtenerJson } from "@/modules/shared/infrastructure/http/clienteHttp";
import { Campo } from "@/modules/shared/presentation/ui/Formulario";

const RETARDO_MS = 250;

function tokens(valor: string): string[] {
  return valor
    .split(",")
    .map((parte) => parte.trim())
    .filter((parte) => parte.length > 0);
}

function coincideExacto(token: string, producto: Producto): boolean {
  const buscado = normalizarBusqueda(token);
  return normalizarBusqueda(producto.nombre) === buscado || normalizarBusqueda(producto.codigo) === buscado;
}

function incorporar(actual: string, nombre: string): string {
  const partes = actual.split(",");
  partes[partes.length - 1] = nombre;
  return [...new Set(partes.map((parte) => parte.trim()).filter((parte) => parte.length > 0))].join(", ");
}

function quitar(actual: string, nombre: string): string {
  const buscado = normalizarBusqueda(nombre);
  return tokens(actual)
    .filter((token) => normalizarBusqueda(token) !== buscado)
    .join(", ");
}

interface PropsCampoProductos {
  valor: string;
  alCambiar: (valor: string) => void;
}

export function CampoProductosProveedor({ valor, alCambiar }: PropsCampoProductos) {
  const [abierto, setAbierto] = useState(false);
  const [sugerencias, setSugerencias] = useState<Producto[]>([]);
  const [coincidencias, setCoincidencias] = useState<Producto[]>([]);
  const [consultado, setConsultado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const partes = tokens(valor);
  const ultimo = partes.at(-1) ?? "";
  const reconocidos = coincidencias.filter((producto) => partes.some((token) => coincideExacto(token, producto)));
  const mostrarSugerencias = abierto && ultimo.length >= LONGITUD_MINIMA_BUSQUEDA && !reconocidos.some((producto) => coincideExacto(ultimo, producto));

  useEffect(() => {
    const consultables = tokens(valor).filter((token) => token.length >= LONGITUD_MINIMA_BUSQUEDA);
    if (consultables.length === 0) return;
    let vigente = true;
    const temporizador = window.setTimeout(async () => {
      try {
        const listas = await Promise.all(
          consultables.map((token) => obtenerJson<Producto[]>(`/api/productos?q=${encodeURIComponent(token)}`)),
        );
        if (!vigente) return;
        const unicos = new Map<string, Producto>();
        listas.flat().forEach((producto) => unicos.set(producto.codigo, producto));
        const productos = [...unicos.values()];
        const ultima = consultables.at(-1) ?? "";
        const buscada = normalizarBusqueda(ultima);
        setCoincidencias(productos.filter((producto) => consultables.some((token) => coincideExacto(token, producto))));
        setSugerencias(
          productos
            .filter((producto) => !coincideExacto(ultima, producto))
            .filter(
              (producto) =>
                normalizarBusqueda(producto.nombre).includes(buscada) || normalizarBusqueda(producto.codigo).includes(buscada),
            )
            .slice(0, 6),
        );
        setConsultado(valor);
        setError(null);
      } catch (fallo) {
        if (!vigente) return;
        setConsultado(valor);
        setError(mensajeDeError(fallo));
      }
    }, RETARDO_MS);
    return () => {
      vigente = false;
      window.clearTimeout(temporizador);
    };
  }, [valor]);

  return (
    <Campo etiqueta="Productos" ayuda="Escriba los productos que negocia con este proveedor. Si están en el catálogo, se reconocen.">
      {(id) => (
        <div className="relative">
          <HiOutlineCube className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zeus-tinta/70" />
          <input
            id={id}
            value={valor}
            autoComplete="off"
            placeholder="GUANTES, CASCO…"
            onFocus={() => setAbierto(true)}
            onBlur={() => window.setTimeout(() => setAbierto(false), 150)}
            onChange={(evento) => alCambiar(aMayusculas(evento.target.value))}
            className="h-10 w-full rounded-lg border border-slate-300 bg-superficie pl-9 pr-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-zeus-azul focus:ring-4 focus:ring-zeus-azul/10"
          />
          <AnimatePresence>
            {mostrarSugerencias && (
              <motion.ul
                role="listbox"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="scroll-zeus absolute left-0 right-0 top-full z-20 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-superficie p-1.5 shadow-xl"
              >
                {error !== null && <li className="px-3 py-2.5 text-xs text-red-600">{error}</li>}
                {error === null && consultado !== valor && <li className="px-3 py-2.5 text-xs text-slate-500">Buscando en el catálogo…</li>}
                {error === null && consultado === valor && sugerencias.length === 0 && (
                  <li className="px-3 py-2.5 text-xs text-slate-500">Sin coincidencia en el catálogo. El texto se guarda igual.</li>
                )}
                {sugerencias.map((producto) => (
                  <li key={producto.codigo}>
                    <button
                      type="button"
                      onMouseDown={(evento) => evento.preventDefault()}
                      onClick={() => {
                        alCambiar(aMayusculas(incorporar(valor, producto.nombre)));
                        setAbierto(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition hover:bg-zeus-celeste"
                    >
                      <MiniaturaProducto codigo={producto.codigo} nombre={producto.nombre} />
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold text-slate-800">{producto.nombre}</span>
                        <span className="block text-[11px] text-slate-500">{producto.codigo}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
          {reconocidos.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              <AnimatePresence initial={false}>
                {reconocidos.map((producto) => (
                  <motion.li
                    key={producto.codigo}
                    layout
                    initial={{ opacity: 0, y: 8, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 420, damping: 22 }}
                    className="flex max-w-full items-center gap-1.5 rounded-lg border border-zeus-azul/15 bg-zeus-celeste/50 py-1 pl-1 pr-1.5"
                  >
                    <MiniaturaProducto codigo={producto.codigo} nombre={producto.nombre} />
                    <span className="truncate text-[11px] font-semibold text-zeus-tinta">{producto.nombre}</span>
                    <button
                      type="button"
                      aria-label={`Quitar ${producto.nombre}`}
                      onClick={() => alCambiar(quitar(valor, producto.nombre))}
                      className="rounded-md p-1 text-slate-400 transition hover:bg-white hover:text-red-600"
                    >
                      <HiOutlineXMark className="h-3.5 w-3.5" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      )}
    </Campo>
  );
}
