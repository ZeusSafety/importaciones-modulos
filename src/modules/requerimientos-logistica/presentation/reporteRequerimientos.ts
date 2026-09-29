import { formatearFechaHora } from "@/modules/shared/domain/fechas";
import type { ColumnaReporte, ReporteTabular } from "@/modules/shared/presentation/exportacion/reporteTabular";
import type { RequerimientoLogisticaDto } from "../application/dto";

const COLUMNAS: readonly ColumnaReporte[] = [
  { titulo: "N°", ancho: 5, centrada: true },
  { titulo: "N° REQUERIMIENTO", ancho: 16, centrada: true },
  { titulo: "FECHA DE REGISTRO", ancho: 18, centrada: true },
  { titulo: "MES", ancho: 12, centrada: true },
  { titulo: "ÁREA", ancho: 17, centrada: false },
  { titulo: "RESPONSABLE", ancho: 22, centrada: false },
  { titulo: "REVISADO POR", ancho: 22, centrada: false },
  { titulo: "PRODUCTOS", ancho: 11, centrada: true },
  { titulo: "ESTADO", ancho: 13, centrada: true },
  { titulo: "APROBADO POR", ancho: 22, centrada: false },
  { titulo: "FECHA DE APROBACIÓN", ancho: 18, centrada: true },
];

const COLUMNA_ESTADO = 8;
const COLORES_PENDIENTE = { texto: "B45309", fondo: "FEF3C7" };
const COLORES_APROBADO = { texto: "047857", fondo: "D1FAE5" };

export function reporteRequerimientos(requerimientos: readonly RequerimientoLogisticaDto[]): ReporteTabular {
  return {
    titulo: "REPORTE DE REQUERIMIENTOS LOGÍSTICA",
    nombreHoja: "Requerimientos",
    prefijoArchivo: "requerimientos-logistica",
    columnas: COLUMNAS,
    filas: requerimientos.map((r, indice) => {
      const aprobacion = r.aprobacion;
      return {
        celdas: [
          String(indice + 1),
          r.codigo,
          formatearFechaHora(r.fechaRegistro),
          r.mes,
          r.area,
          r.responsable,
          r.revisadoPor,
          String(r.detalles.length),
          aprobacion === null ? "PENDIENTE" : "APROBADO",
          aprobacion === null ? "—" : aprobacion.aprobadoPor,
          aprobacion === null ? "—" : formatearFechaHora(aprobacion.fechaAprobacion),
        ],
        resaltadas: [{ columna: COLUMNA_ESTADO, ...(aprobacion === null ? COLORES_PENDIENTE : COLORES_APROBADO) }],
      };
    }),
  };
}
