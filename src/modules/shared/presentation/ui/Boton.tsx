"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

const VARIANTES = {
  primario:
    "bg-gradient-to-br from-zeus-azul to-zeus-azul-medio text-white shadow-md shadow-zeus-azul/20 hover:from-zeus-azul-oscuro hover:to-zeus-azul hover:shadow-lg",
  secundario: "border border-slate-300 bg-superficie text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50",
  exito: "bg-gradient-to-br from-emerald-600 to-zeus-verde text-white shadow-md shadow-emerald-800/20 hover:from-emerald-800 hover:to-emerald-600",
  advertencia: "bg-gradient-to-br from-amber-500 to-zeus-dorado text-white shadow-md shadow-amber-600/20 hover:from-amber-600 hover:to-amber-500",
  peligro: "border border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100",
  exitoSuave: "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100",
  fantasma: "text-zeus-tinta hover:bg-zeus-celeste",
} as const;

const TAMANOS = {
  chico: "h-8 gap-1.5 px-3 text-xs",
  normal: "h-10 gap-2 px-4 text-sm",
} as const;

interface PropsBoton extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variante: keyof typeof VARIANTES;
  tamano?: keyof typeof TAMANOS;
  icono?: ReactNode;
  cargando?: boolean;
  anchoCompleto?: boolean;
}

export function Boton({
  variante,
  tamano = "normal",
  icono,
  cargando = false,
  anchoCompleto = false,
  disabled,
  children,
  type = "button",
  ...resto
}: PropsBoton) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      className={`inline-flex items-center justify-center rounded-lg font-display font-semibold transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${VARIANTES[variante]} ${TAMANOS[tamano]} ${anchoCompleto ? "w-full" : ""}`}
      {...resto}
    >
      {cargando ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icono
      )}
      {children}
    </button>
  );
}
