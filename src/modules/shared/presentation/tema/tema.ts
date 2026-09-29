"use client";

import { useSyncExternalStore } from "react";
import { CLAVE_TEMA, EVENTO_CAMBIO_TEMA, VALOR_TEMA_CLARO, VALOR_TEMA_OSCURO } from "./constantesTema";

export type Tema = "claro" | "oscuro";

function suscribir(notificar: () => void) {
  window.addEventListener(EVENTO_CAMBIO_TEMA, notificar);
  return () => window.removeEventListener(EVENTO_CAMBIO_TEMA, notificar);
}

function temaActual(): Tema {
  return document.documentElement.classList.contains("dark") ? "oscuro" : "claro";
}

export function aplicarTema(tema: Tema) {
  const oscuro = tema === "oscuro";
  document.documentElement.classList.toggle("dark", oscuro);
  localStorage.setItem(CLAVE_TEMA, oscuro ? VALOR_TEMA_OSCURO : VALOR_TEMA_CLARO);
  window.dispatchEvent(new Event(EVENTO_CAMBIO_TEMA));
}

/** Devuelve `null` durante el renderizado en servidor, cuando aún no se conoce la preferencia. */
export function useTema(): Tema | null {
  return useSyncExternalStore(suscribir, temaActual, () => null);
}
