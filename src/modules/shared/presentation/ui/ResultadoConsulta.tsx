"use client";

import type { ReactNode } from "react";
import { HiOutlineArrowPath, HiOutlineXCircle } from "react-icons/hi2";
import type { EstadoConsulta } from "../hooks/useConsulta";
import { Boton } from "./Boton";
import { Cargando } from "./Superficies";

interface PropsResultadoConsulta<T> {
  estado: EstadoConsulta<T>;
  textoCargando: string;
  alReintentar: () => void;
  children: (datos: T) => ReactNode;
}

function Contenedor({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-slate-200/80 bg-superficie shadow-sm">{children}</div>;
}

export function ResultadoConsulta<T>({ estado, textoCargando, alReintentar, children }: PropsResultadoConsulta<T>) {
  switch (estado.tipo) {
    case "cargando":
      return (
        <Contenedor>
          <Cargando texto={textoCargando} />
        </Contenedor>
      );
    case "error":
      return (
        <Contenedor>
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <HiOutlineXCircle className="h-10 w-10 text-red-500" />
            <p className="max-w-md text-sm text-slate-600">{estado.mensaje}</p>
            <Boton variante="secundario" tamano="chico" icono={<HiOutlineArrowPath />} onClick={alReintentar}>
              Reintentar
            </Boton>
          </div>
        </Contenedor>
      );
    case "listo":
      return <>{children(estado.datos)}</>;
  }
}
