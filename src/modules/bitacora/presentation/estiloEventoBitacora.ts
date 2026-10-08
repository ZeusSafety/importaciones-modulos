import type { IconType } from "react-icons";
import { HiOutlineArrowsRightLeft, HiOutlineCheckBadge, HiOutlinePencilSquare, HiOutlinePlus } from "react-icons/hi2";
import { ESTADOS_PRE_NEGOCIACION, type EstadoPreNegociacion } from "@/modules/pre-negociaciones/domain/valores";
import { COLUMNAS_TABLERO } from "@/modules/pre-negociaciones/presentation/tablero/columnasTablero";
import type { AccionBitacora, EventoBitacora } from "../domain/EventoBitacora";

export interface EstiloEvento {
  readonly icono: IconType;
  readonly avatar: string;
  readonly insignia: string;
  readonly texto: string;
}

const ESTILO_ACCION: Record<AccionBitacora, EstiloEvento> = {
  REGISTRO: {
    icono: HiOutlinePlus,
    avatar: "bg-gradient-to-br from-zeus-azul to-zeus-azul-medio text-white shadow-zeus-azul/30",
    insignia: "bg-zeus-celeste text-zeus-tinta",
    texto: "Registro",
  },
  ACTUALIZACION: {
    icono: HiOutlinePencilSquare,
    avatar: "bg-gradient-to-br from-amber-500 to-zeus-dorado text-white shadow-amber-500/30",
    insignia: "bg-amber-50 text-amber-700",
    texto: "Actualización",
  },
  "CAMBIO DE ESTADO": {
    icono: HiOutlineArrowsRightLeft,
    avatar: "bg-gradient-to-br from-zeus-azul-medio to-zeus-azul text-white shadow-zeus-azul/30",
    insignia: "bg-zeus-celeste text-zeus-tinta",
    texto: "Cambio de estado",
  },
  APROBACION: {
    icono: HiOutlineCheckBadge,
    avatar: "bg-gradient-to-br from-[#10b981] to-[#059669] text-white shadow-emerald-500/30",
    insignia: "bg-[#10b981]/12 text-[#047857] dark:text-[#6ee7b7]",
    texto: "Aprobación",
  },
};

/** Colores fijos: los tokens de Tailwind se reasignan en modo oscuro. */
export const COLOR_ESTADO: Record<EstadoPreNegociacion, { avatar: string; insignia: string; punto: string }> = {
  "EN PROCESO": {
    avatar: "bg-gradient-to-br from-[#fb923c] to-[#f97316] text-white shadow-orange-500/30",
    insignia: "bg-[#f97316]/12 text-[#c2410c] dark:text-[#fdba74]",
    punto: "bg-[#f97316]",
  },
  "EN PAUSA": {
    avatar: "bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] text-white shadow-violet-500/30",
    insignia: "bg-[#8b5cf6]/12 text-[#6d28d9] dark:text-[#c4b5fd]",
    punto: "bg-[#8b5cf6]",
  },
  COMPLETADO: {
    avatar: "bg-gradient-to-br from-[#10b981] to-[#059669] text-white shadow-emerald-500/30",
    insignia: "bg-[#10b981]/12 text-[#047857] dark:text-[#6ee7b7]",
    punto: "bg-[#10b981]",
  },
  ANULADO: {
    avatar: "bg-gradient-to-br from-[#f43f5e] to-[#dc2626] text-white shadow-red-500/30",
    insignia: "bg-[#ef4444]/12 text-[#b91c1c] dark:text-[#fca5a5]",
    punto: "bg-[#ef4444]",
  },
};

function esEstado(valor: string): valor is EstadoPreNegociacion {
  return (ESTADOS_PRE_NEGOCIACION as readonly string[]).includes(valor);
}

/** Los cambios hechos antes de guardar la transición solo la dejaron escrita en la descripción. */
const TRANSICION_EN_TEXTO = /pasó de (.+?) a (.+?) desde el tablero/;

export type TransicionEvento = { readonly desde: EstadoPreNegociacion; readonly hacia: EstadoPreNegociacion };

export function transicionDe(evento: EventoBitacora): TransicionEvento | null {
  const [desde, hacia] = evento.transicion
    ? [evento.transicion.desde, evento.transicion.hacia]
    : (TRANSICION_EN_TEXTO.exec(evento.descripcion)?.slice(1) ?? []);
  return desde && hacia && esEstado(desde) && esEstado(hacia) ? { desde, hacia } : null;
}

export function estiloDe(evento: EventoBitacora, transicion: TransicionEvento | null): EstiloEvento {
  if (!transicion) return ESTILO_ACCION[evento.accion];
  const color = COLOR_ESTADO[transicion.hacia];
  return { ...ESTILO_ACCION["CAMBIO DE ESTADO"], icono: COLUMNAS_TABLERO[transicion.hacia].icono, avatar: color.avatar, insignia: color.insignia };
}
