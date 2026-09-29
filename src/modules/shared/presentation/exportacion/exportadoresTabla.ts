import { exportarTablaExcel } from "./exportarTablaExcel";
import { exportarTablaPdf } from "./exportarTablaPdf";
import type { ReporteTabular } from "./reporteTabular";

export type FormatoExportacion = "excel" | "pdf";

export const EXPORTADORES_TABLA: Record<FormatoExportacion, (reporte: ReporteTabular) => Promise<void>> = {
  excel: exportarTablaExcel,
  pdf: exportarTablaPdf,
};
