import { formatearFecha, formatearFechaHora } from "@/modules/shared/domain/fechas";

export const SUBTITULO_REPORTE = "ZEUS SAFETY · SISTEMA DE IMPORTACIONES";

export interface ColumnaReporte {
  readonly titulo: string;
  /** Ancho relativo; cada formato lo traduce a su propia unidad. */
  readonly ancho: number;
  readonly centrada: boolean;
}

/** Celda pintada con colores hexadecimales (sin #), p. ej. para estados. */
export interface CeldaResaltada {
  readonly columna: number;
  readonly texto: string;
  readonly fondo: string;
}

export interface FilaReporte {
  readonly celdas: readonly string[];
  readonly resaltadas: readonly CeldaResaltada[];
}

export interface ReporteTabular {
  readonly titulo: string;
  readonly nombreHoja: string;
  readonly prefijoArchivo: string;
  readonly columnas: readonly ColumnaReporte[];
  readonly filas: readonly FilaReporte[];
}

export function descripcionGeneracion(totalRegistros: number, ahora: Date): string {
  return `Generado el ${formatearFechaHora(ahora.toISOString())} · ${totalRegistros} registro(s)`;
}

export function nombreArchivoReporte(prefijo: string, extension: "xlsx" | "pdf", ahora: Date): string {
  return `${prefijo}_${formatearFecha(ahora.toISOString()).replaceAll("/", "-")}.${extension}`;
}
