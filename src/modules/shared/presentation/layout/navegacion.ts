import type { IconType } from "react-icons";
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineDocumentCurrencyDollar,
  HiOutlinePresentationChartLine,
  HiOutlineViewColumns,
} from "react-icons/hi2";

export interface EnlaceNavegacion {
  readonly ruta: string;
  readonly etiqueta: string;
  readonly icono: IconType;
}

export interface SeccionNavegacion {
  readonly titulo: string;
  readonly enlaces: readonly EnlaceNavegacion[];
}

export const RUTAS = {
  principal: "/",
  requerimientosLogistica: "/pre-negociacion/requerimientos-logistica",
  cotizaciones: "/pre-negociacion/cotizaciones",
  tablero: "/pre-negociacion/tablero",
} as const;

export const SECCIONES_NAVEGACION: readonly SeccionNavegacion[] = [
  {
    titulo: "Principal",
    enlaces: [{ ruta: RUTAS.principal, etiqueta: "Bitácora y Reportes", icono: HiOutlinePresentationChartLine }],
  },
  {
    titulo: "Pre-negociación",
    enlaces: [
      {
        ruta: RUTAS.requerimientosLogistica,
        etiqueta: "Requerimientos Logística",
        icono: HiOutlineClipboardDocumentCheck,
      },
      { ruta: RUTAS.cotizaciones, etiqueta: "Cotizaciones", icono: HiOutlineDocumentCurrencyDollar },
      { ruta: RUTAS.tablero, etiqueta: "Tablero Kanban", icono: HiOutlineViewColumns },
    ],
  },
];

export function esRutaActiva(rutaActual: string, ruta: string): boolean {
  return ruta === RUTAS.principal ? rutaActual === ruta : rutaActual.startsWith(ruta);
}
