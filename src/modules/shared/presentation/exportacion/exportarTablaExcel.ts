import type { Borders } from "exceljs";
import { cargarImagenComoDataUrl, LOGO_ZEUS } from "@/modules/shared/presentation/cargarImagen";
import { descargarBlob } from "@/modules/shared/presentation/descargarArchivo";
import { descripcionGeneracion, nombreArchivoReporte, SUBTITULO_REPORTE, type ReporteTabular } from "./reporteTabular";

const AZUL = "FF002D5A";
const DORADO = "FFE5A017";
const FONDO_ALTERNO = "FFF7FAFF";
const BORDE = "FFE2E8F0";
const FILA_CABECERA = 5;

const BORDES_CELDA: Partial<Borders> = {
  top: { style: "thin", color: { argb: BORDE } },
  bottom: { style: "thin", color: { argb: BORDE } },
  left: { style: "thin", color: { argb: BORDE } },
  right: { style: "thin", color: { argb: BORDE } },
};

export async function exportarTablaExcel(reporte: ReporteTabular) {
  const [{ default: ExcelJS }, logo] = await Promise.all([import("exceljs"), cargarImagenComoDataUrl(LOGO_ZEUS)]);
  const ahora = new Date();
  const { columnas, filas } = reporte;
  const ultimaColumna = columnas.length;

  const libro = new ExcelJS.Workbook();
  libro.creator = "Zeus Safety";
  libro.created = ahora;
  const hoja = libro.addWorksheet(reporte.nombreHoja, {
    views: [{ state: "frozen", ySplit: FILA_CABECERA, showGridLines: false }],
    pageSetup: { orientation: "landscape", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });
  hoja.columns = columnas.map((columna) => ({ width: columna.ancho }));

  hoja.getRow(1).height = 26;
  hoja.getRow(2).height = 18;
  hoja.getRow(3).height = 16;
  hoja.addImage(libro.addImage({ base64: logo, extension: "png" }), {
    tl: { col: 0.15, row: 0.2 },
    ext: { width: 118, height: 52 },
  });

  hoja.mergeCells(1, 3, 1, ultimaColumna);
  Object.assign(hoja.getCell(1, 3), {
    value: reporte.titulo,
    font: { name: "Calibri", size: 16, bold: true, color: { argb: AZUL } },
    alignment: { vertical: "middle" },
  });
  hoja.mergeCells(2, 3, 2, ultimaColumna);
  Object.assign(hoja.getCell(2, 3), {
    value: SUBTITULO_REPORTE,
    font: { name: "Calibri", size: 10, bold: true, color: { argb: "FF64748B" } },
  });
  hoja.mergeCells(3, 3, 3, ultimaColumna);
  Object.assign(hoja.getCell(3, 3), {
    value: descripcionGeneracion(filas.length, ahora),
    font: { name: "Calibri", size: 9, italic: true, color: { argb: "FF94A3B8" } },
  });
  for (let columna = 1; columna <= ultimaColumna; columna += 1) {
    hoja.getCell(4, columna).border = { top: { style: "medium", color: { argb: DORADO } } };
  }

  const cabecera = hoja.getRow(FILA_CABECERA);
  cabecera.values = columnas.map((columna) => columna.titulo);
  cabecera.height = 24;
  cabecera.eachCell((celda) => {
    celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: AZUL } };
    celda.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    celda.alignment = { vertical: "middle", horizontal: "center" };
    celda.border = { bottom: { style: "medium", color: { argb: DORADO } } };
  });

  filas.forEach((fila, indice) => {
    const filaHoja = hoja.getRow(FILA_CABECERA + 1 + indice);
    filaHoja.values = [...fila.celdas];
    filaHoja.height = 20;
    filaHoja.eachCell((celda, numeroColumna) => {
      const columna = columnas[numeroColumna - 1];
      celda.font = { name: "Calibri", size: 10, color: { argb: "FF1E293B" } };
      celda.alignment = { vertical: "middle", horizontal: columna.centrada ? "center" : "left", wrapText: true };
      celda.border = BORDES_CELDA;
      if (indice % 2 === 1) celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: FONDO_ALTERNO } };
    });
    fila.resaltadas.forEach(({ columna, texto, fondo }) => {
      const celda = filaHoja.getCell(columna + 1);
      celda.font = { name: "Calibri", size: 9, bold: true, color: { argb: `FF${texto}` } };
      celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${fondo}` } };
    });
  });

  hoja.autoFilter = {
    from: { row: FILA_CABECERA, column: 1 },
    to: { row: FILA_CABECERA + filas.length, column: ultimaColumna },
  };

  const contenido = await libro.xlsx.writeBuffer();
  descargarBlob(
    new Blob([contenido], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    nombreArchivoReporte(reporte.prefijoArchivo, "xlsx", ahora),
  );
}
