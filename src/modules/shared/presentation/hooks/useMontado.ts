"use client";

import { useSyncExternalStore } from "react";

const suscribirSinCambios = () => () => {};

/** Indica si el componente ya se hidrató en el navegador (necesario para portales). */
export function useMontado(): boolean {
  return useSyncExternalStore(
    suscribirSinCambios,
    () => true,
    () => false,
  );
}
