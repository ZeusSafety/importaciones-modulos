"use client";

import { useCallback, useEffect, useState } from "react";
import { mensajeDeError } from "@/modules/shared/infrastructure/http/clienteHttp";

export type EstadoConsulta<T> =
  | { readonly tipo: "cargando" }
  | { readonly tipo: "listo"; readonly datos: T }
  | { readonly tipo: "error"; readonly mensaje: string };

async function ejecutar<T>(cargar: () => Promise<T>): Promise<EstadoConsulta<T>> {
  try {
    return { tipo: "listo", datos: await cargar() };
  } catch (error) {
    return { tipo: "error", mensaje: mensajeDeError(error) };
  }
}

/** Ejecuta una consulta al montar y permite recargarla. `cargar` debe ser una referencia estable. */
export function useConsulta<T>(cargar: () => Promise<T>) {
  const [estado, setEstado] = useState<EstadoConsulta<T>>({ tipo: "cargando" });

  useEffect(() => {
    let vigente = true;
    void ejecutar(cargar).then((resultado) => {
      if (vigente) setEstado(resultado);
    });
    return () => {
      vigente = false;
    };
  }, [cargar]);

  const recargar = useCallback(async () => {
    setEstado(await ejecutar(cargar));
  }, [cargar]);

  return { estado, recargar };
}
