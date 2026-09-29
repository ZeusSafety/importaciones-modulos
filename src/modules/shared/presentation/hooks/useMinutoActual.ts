"use client";

import { useSyncExternalStore } from "react";

const INTERVALO_MS = 15_000;
const MINUTO_MS = 60_000;

function suscribir(notificar: () => void) {
  const temporizador = window.setInterval(notificar, INTERVALO_MS);
  return () => window.clearInterval(temporizador);
}

function minutoActual(): number {
  return Math.floor(Date.now() / MINUTO_MS) * MINUTO_MS;
}

/** Marca de tiempo redondeada al minuto; `null` en servidor para no desfasar la hidratación. */
export function useMinutoActual(): number | null {
  return useSyncExternalStore(suscribir, minutoActual, () => null);
}
