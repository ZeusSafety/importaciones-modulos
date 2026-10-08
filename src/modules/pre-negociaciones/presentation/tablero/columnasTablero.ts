import type { IconType } from "react-icons";
import { HiOutlineArrowPath, HiOutlineCheckBadge, HiOutlineNoSymbol, HiOutlinePauseCircle } from "react-icons/hi2";
import type { EstadoPreNegociacion } from "../../domain/valores";

export interface ColumnaTablero {
  readonly titulo: string;
  readonly descripcion: string;
  readonly icono: IconType;
  /** Franja superior de la columna y filete lateral de sus tarjetas. */
  readonly acento: string;
  readonly fondoIcono: string;
  readonly zonaActiva: string;
}

/** Colores fijos en acentos: los tokens de Tailwind se reasignan en modo oscuro. */
export const COLUMNAS_TABLERO: Record<EstadoPreNegociacion, ColumnaTablero> = {
  "EN PROCESO": {
    titulo: "En proceso",
    descripcion: "Negociando con proveedores",
    icono: HiOutlineArrowPath,
    acento: "bg-[#f97316]",
    fondoIcono: "bg-amber-50 text-amber-700",
    zonaActiva: "border-[#f97316]/60 bg-amber-50/60",
  },
  "EN PAUSA": {
    titulo: "En pausa",
    descripcion: "Detenidas temporalmente",
    icono: HiOutlinePauseCircle,
    acento: "bg-[#7c3aed]",
    fondoIcono: "bg-violet-50 text-violet-700",
    zonaActiva: "border-[#7c3aed]/60 bg-violet-50/60",
  },
  COMPLETADO: {
    titulo: "Completado",
    descripcion: "Cerradas con éxito",
    icono: HiOutlineCheckBadge,
    acento: "bg-[#059669]",
    fondoIcono: "bg-emerald-50 text-emerald-700",
    zonaActiva: "border-[#059669]/60 bg-emerald-50/60",
  },
  ANULADO: {
    titulo: "Anulado",
    descripcion: "Descartadas",
    icono: HiOutlineNoSymbol,
    acento: "bg-[#dc2626]",
    fondoIcono: "bg-red-50 text-red-700",
    zonaActiva: "border-[#dc2626]/60 bg-red-50/60",
  },
};
