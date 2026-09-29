"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { aMayusculas } from "@/modules/shared/domain/texto";

const CLASE_CONTROL =
  "w-full rounded-lg border border-slate-300 bg-superficie px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-zeus-azul focus:ring-4 focus:ring-zeus-azul/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

interface PropsCampo {
  etiqueta: string;
  ayuda?: string;
  className?: string;
  children: (id: string) => ReactNode;
}

export function Campo({ etiqueta, ayuda, className, children }: PropsCampo) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-display text-[11px] font-semibold uppercase tracking-wide text-slate-600">
        {etiqueta}
      </label>
      {children(id)}
      {ayuda && <p className="mt-1 text-[11px] text-slate-500">{ayuda}</p>}
    </div>
  );
}

interface PropsEntradaTexto
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "className"> {
  valor: string;
  alCambiar: (valor: string) => void;
  mayusculas: boolean;
}

export function EntradaTexto({ valor, alCambiar, mayusculas, ...resto }: PropsEntradaTexto) {
  return (
    <input
      {...resto}
      value={valor}
      onChange={(evento) => alCambiar(mayusculas ? aMayusculas(evento.target.value) : evento.target.value)}
      className={`${CLASE_CONTROL} h-10`}
    />
  );
}

interface PropsAreaTexto {
  id: string;
  valor: string;
  alCambiar: (valor: string) => void;
  placeholder: string;
  filas: number;
  redimensionable: boolean;
}

export function AreaTextoMayusculas({ id, valor, alCambiar, placeholder, filas, redimensionable }: PropsAreaTexto) {
  return (
    <textarea
      id={id}
      value={valor}
      rows={filas}
      placeholder={placeholder}
      onChange={(evento) => alCambiar(aMayusculas(evento.target.value))}
      className={`${CLASE_CONTROL} ${redimensionable ? "resize-y" : "resize-none"} py-2.5`}
    />
  );
}

interface PropsValorSoloLectura {
  id: string;
  valor: string;
  icono?: ReactNode;
  /** Resalta el valor en rojo, p. ej. un stock por debajo del mínimo. */
  alerta?: boolean;
}

export function ValorSoloLectura({ id, valor, icono, alerta = false }: PropsValorSoloLectura) {
  return (
    <output
      id={id}
      className={`flex h-10 w-full items-center gap-2 rounded-lg border px-3 font-display text-sm font-semibold transition-colors ${
        alerta ? "border-red-200 bg-red-50 text-red-600" : "border-zeus-azul/15 bg-zeus-celeste/60 text-zeus-tinta"
      }`}
    >
      {icono && <span className={`flex shrink-0 text-base ${alerta ? "text-red-500" : "text-zeus-tinta/70"}`}>{icono}</span>}
      <span className="truncate">{valor}</span>
    </output>
  );
}
