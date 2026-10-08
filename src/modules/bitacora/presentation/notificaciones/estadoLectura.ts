"use client";

import { useSyncExternalStore } from "react";

const CLAVE = "zeus.importaciones.notificaciones";
/** Evita que la lista de leídas crezca sin fin: las más antiguas ya quedan cubiertas por `leidasHasta`. */
const MAXIMO_LEIDAS = 300;

export interface EstadoLectura {
  /** Todo evento con fecha igual o anterior se considera leído ("Marcar todo como leído"). */
  readonly leidasHasta: string | null;
  readonly leidas: readonly string[];
}

const VACIO: EstadoLectura = { leidasHasta: null, leidas: [] };
const oyentes = new Set<() => void>();
let textoEnCache: string | null = null;
let valorEnCache: EstadoLectura = VACIO;

function leer(): EstadoLectura {
  const texto = localStorage.getItem(CLAVE);
  if (texto === textoEnCache) return valorEnCache;
  textoEnCache = texto;
  try {
    const datos = texto ? (JSON.parse(texto) as Partial<EstadoLectura>) : {};
    valorEnCache = {
      leidasHasta: typeof datos.leidasHasta === "string" ? datos.leidasHasta : null,
      leidas: Array.isArray(datos.leidas) ? datos.leidas.filter((id): id is string => typeof id === "string") : [],
    };
  } catch {
    valorEnCache = VACIO;
  }
  return valorEnCache;
}

function guardar(estado: EstadoLectura) {
  localStorage.setItem(CLAVE, JSON.stringify({ ...estado, leidas: estado.leidas.slice(-MAXIMO_LEIDAS) }));
  oyentes.forEach((notificar) => notificar());
}

function suscribir(notificar: () => void) {
  oyentes.add(notificar);
  window.addEventListener("storage", notificar);
  return () => {
    oyentes.delete(notificar);
    window.removeEventListener("storage", notificar);
  };
}

export function useEstadoLectura(): EstadoLectura {
  return useSyncExternalStore(suscribir, leer, () => VACIO);
}

export function estaLeida(estado: EstadoLectura, evento: { id: string; fecha: string }): boolean {
  return (estado.leidasHasta !== null && evento.fecha <= estado.leidasHasta) || estado.leidas.includes(evento.id);
}

export function marcarLeida(id: string) {
  const actual = leer();
  if (!actual.leidas.includes(id)) guardar({ ...actual, leidas: [...actual.leidas, id] });
}

export function marcarTodasLeidas(fechaMasReciente: string) {
  guardar({ leidasHasta: fechaMasReciente, leidas: [] });
}
