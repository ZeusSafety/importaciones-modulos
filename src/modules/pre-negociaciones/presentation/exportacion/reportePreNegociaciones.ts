import { formatearFecha } from "@/modules/shared/domain/fechas";
import type { ColumnaReporte, ReporteTabular } from "@/modules/shared/presentation/exportacion/reporteTabular";
import type { PreNegociacionDto } from "../../application/dto";
import { etiquetaPreNegociacion, type EstadoPreNegociacion } from "../../domain/valores";

const COLUMNAS: readonly ColumnaReporte[] = [
  { titulo: "N°", ancho: 5, centrada: true },
  { titulo: "PRE-NEGOCIACIÓN", ancho: 22, centrada: false },
  { titulo: "TIPO CARGA", ancho: 20, centrada: false },
  { titulo: "FECHA", ancho: 12, centrada: true },
  { titulo: "PRODUCTOS", ancho: 26, centrada: false },
  { titulo: "PAÍS", ancho: 13, centrada: false },
  { titulo: "PUERTO", ancho: 15, centrada: false },
  { titulo: "PROVEEDORES", ancho: 23, centrada: false },
  { titulo: "REGISTRADO POR", ancho: 20, centrada: false },
  { titulo: "ESTADO", ancho: 18, centrada: true },
];

const COLUMNA_ESTADO = COLUMNAS.length - 1;

const COLORES_ESTADO: Record<EstadoPreNegociacion, { readonly texto: string; readonly fondo: string }> = {
  "EN PROCESO": { texto: "B45309", fondo: "FEF3C7" },
  COMPLETADO: { texto: "047857", fondo: "D1FAE5" },
  ANULADO: { texto: "B91C1C", fondo: "FEE2E2" },
};

export function reportePreNegociaciones(preNegociaciones: readonly PreNegociacionDto[]): ReporteTabular {
  return {
    titulo: "REPORTE DE PRE-NEGOCIACIONES",
    nombreHoja: "Pre-negociaciones",
    prefijoArchivo: "pre-negociaciones",
    columnas: COLUMNAS,
    filas: preNegociaciones.map((p, indice) => ({
      celdas: [
        String(indice + 1),
        etiquetaPreNegociacion(p.numero),
        p.tipoCarga,
        formatearFecha(p.creadoEn),
        p.productos,
        p.pais,
        p.puerto,
        p.cotizaciones.length === 0 ? "—" : p.cotizaciones.map((c) => c.proveedor).join(", "),
        p.registradoPor,
        p.estado,
      ],
      resaltadas: [{ columna: COLUMNA_ESTADO, ...COLORES_ESTADO[p.estado] }],
    })),
  };
}
