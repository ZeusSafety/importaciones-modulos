"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SEPARACION = 6;
const MARGEN_VENTANA = 12;

export interface PosicionDesplegable {
  readonly left: number;
  readonly width: number;
  readonly top?: number;
  readonly bottom?: number;
  readonly alturaMaxima: number;
  readonly haciaArriba: boolean;
}

interface OpcionesDesplegable {
  /** Alto máximo del panel; también decide si cabe hacia abajo. */
  readonly alturaMaxima: number;
  /** Alto mínimo que debe caber debajo del disparador para no abrirse hacia arriba. */
  readonly alturaMinimaHaciaAbajo: number;
  /** Ancho mínimo del panel cuando el disparador es más angosto. */
  readonly anchoMinimo?: number;
}

/** El panel se posiciona respecto a la ventana para no quedar recortado por modales o tarjetas con overflow. */
function calcularPosicion(disparador: HTMLElement, opciones: OpcionesDesplegable): PosicionDesplegable {
  const caja = disparador.getBoundingClientRect();
  const width = Math.max(caja.width, opciones.anchoMinimo ?? 0);
  const left = Math.max(MARGEN_VENTANA, Math.min(caja.left, window.innerWidth - width - MARGEN_VENTANA));
  const espacioAbajo = window.innerHeight - caja.bottom - SEPARACION - MARGEN_VENTANA;
  const espacioArriba = caja.top - SEPARACION - MARGEN_VENTANA;
  const haciaArriba = espacioAbajo < opciones.alturaMinimaHaciaAbajo && espacioArriba > espacioAbajo;
  const alturaMaxima = Math.min(opciones.alturaMaxima, haciaArriba ? espacioArriba : espacioAbajo);
  return haciaArriba
    ? { left, width, bottom: window.innerHeight - caja.top + SEPARACION, alturaMaxima, haciaArriba }
    : { left, width, top: caja.bottom + SEPARACION, alturaMaxima, haciaArriba };
}

/**
 * Estado compartido de los paneles flotantes (selectores, calendarios): posición, cierre al
 * pulsar fuera, reubicación al desplazar y Escape en captura para no cerrar el modal contenedor.
 */
export function useDesplegable<TDisparador extends HTMLElement>(opciones: OpcionesDesplegable) {
  const disparador = useRef<TDisparador>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [posicion, setPosicion] = useState<PosicionDesplegable | null>(null);
  const { alturaMaxima, alturaMinimaHaciaAbajo, anchoMinimo } = opciones;
  const abierto = posicion !== null;

  const ubicar = useCallback(() => {
    if (disparador.current) setPosicion(calcularPosicion(disparador.current, { alturaMaxima, alturaMinimaHaciaAbajo, anchoMinimo }));
  }, [alturaMaxima, alturaMinimaHaciaAbajo, anchoMinimo]);

  const cerrar = useCallback((devolverFoco: boolean) => {
    setPosicion(null);
    if (devolverFoco) disparador.current?.focus();
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const alPresionarFuera = (evento: PointerEvent) => {
      const objetivo = evento.target as Node;
      if (!disparador.current?.contains(objetivo) && !panel.current?.contains(objetivo)) setPosicion(null);
    };
    const alPresionarEscape = (evento: KeyboardEvent) => {
      if (evento.key !== "Escape") return;
      evento.preventDefault();
      evento.stopPropagation();
      cerrar(true);
    };
    window.addEventListener("resize", ubicar);
    window.addEventListener("scroll", ubicar, true);
    document.addEventListener("pointerdown", alPresionarFuera);
    document.addEventListener("keydown", alPresionarEscape, true);
    return () => {
      window.removeEventListener("resize", ubicar);
      window.removeEventListener("scroll", ubicar, true);
      document.removeEventListener("pointerdown", alPresionarFuera);
      document.removeEventListener("keydown", alPresionarEscape, true);
    };
  }, [abierto, ubicar, cerrar]);

  return { disparador, panel, posicion, abierto, abrir: ubicar, cerrar };
}
