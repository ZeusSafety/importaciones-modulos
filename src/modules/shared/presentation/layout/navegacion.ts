import type { IconType } from "react-icons";
import {
  HiOutlineBuildingStorefront,
  HiOutlineClipboardDocumentCheck,
  HiOutlineDocumentCurrencyDollar,
  HiOutlinePresentationChartLine,
  HiOutlineScale,
  HiOutlineTruck,
  HiOutlineViewColumns,
} from "react-icons/hi2";
import { VISTAS_COTIZACION } from "@/modules/pre-negociaciones/domain/vistasCotizacion";

export interface EnlaceNavegacion {
  readonly ruta: string;
  readonly etiqueta: string;
  readonly icono: IconType;
  readonly hijos?: readonly EnlaceNavegacion[];
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

const ICONOS_VISTA = {
  proveedores: HiOutlineBuildingStorefront,
  "agencias-carga": HiOutlineTruck,
  "agencia-aduanas": HiOutlineScale,
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
        etiqueta: "Requerimientos Importaciones",
        icono: HiOutlineClipboardDocumentCheck,
      },
      {
        ruta: RUTAS.cotizaciones,
        etiqueta: "Cotizaciones",
        icono: HiOutlineDocumentCurrencyDollar,
        hijos: VISTAS_COTIZACION.map((vista) => ({
          ruta: vista.ruta,
          etiqueta: vista.menu,
          icono: ICONOS_VISTA[vista.id],
        })),
      },
      { ruta: RUTAS.tablero, etiqueta: "Tablero Kanban", icono: HiOutlineViewColumns },
    ],
  },
];

export function esRutaActiva(rutaActual: string, ruta: string): boolean {
  if (ruta === RUTAS.principal) return rutaActual === ruta;
  if (ruta === RUTAS.cotizaciones) return rutaActual === ruta || rutaActual.startsWith(`${ruta}/`);
  return rutaActual === ruta || rutaActual.startsWith(`${ruta}/`);
}
