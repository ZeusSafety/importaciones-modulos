import { cargarImagenComoDataUrl, LOGO_ZEUS } from "@/modules/shared/presentation/cargarImagen";
import { descargarBlob } from "@/modules/shared/presentation/descargarArchivo";
import { descripcionGeneracion, nombreArchivoReporte, SUBTITULO_REPORTE, type ReporteTabular } from "./reporteTabular";

type ColorRgb = [number, number, number];

const AZUL: ColorRgb = [0, 45, 90];
const DORADO: ColorRgb = [229, 160, 23];
const TENUE: ColorRgb = [100, 116, 139];
const MARGEN = 12;
const ALTO_CABECERA = 30;

function hexARgb(hex: string): ColorRgb {
  return [Number.parseInt(hex.slice(0, 2), 16), Number.parseInt(hex.slice(2, 4), 16), Number.parseInt(hex.slice(4, 6), 16)];
}

export async function exportarTablaPdf(reporte: ReporteTabular) {
  const [{ jsPDF }, { autoTable }, logo] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
    cargarImagenComoDataUrl(LOGO_ZEUS),
  ]);
  const ahora = new Date();
  const { columnas, filas } = reporte;
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const ancho = doc.internal.pageSize.getWidth();
  const alto = doc.internal.pageSize.getHeight();
  const anchoUtil = ancho - MARGEN * 2;
  const totalRelativo = columnas.reduce((suma, columna) => suma + columna.ancho, 0);

  const dibujarCabecera = () => {
    const propiedades = doc.getImageProperties(logo);
    const altoLogo = 14;
    doc.addImage(logo, "PNG", MARGEN, 9, (propiedades.width / propiedades.height) * altoLogo, altoLogo, "logo-zeus", "FAST");
    doc.setTextColor(...AZUL);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(reporte.titulo, ancho - MARGEN, 14, { align: "right" });
    doc.setTextColor(...TENUE);
    doc.setFontSize(8.5);
    doc.text(SUBTITULO_REPORTE, ancho - MARGEN, 19.5, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(descripcionGeneracion(filas.length, ahora), ancho - MARGEN, 24, { align: "right" });
    doc.setDrawColor(...DORADO);
    doc.setLineWidth(0.9);
    doc.line(MARGEN, 27, ancho - MARGEN, 27);
  };

  autoTable(doc, {
    startY: ALTO_CABECERA + 2,
    margin: { left: MARGEN, right: MARGEN, top: ALTO_CABECERA + 2, bottom: 16 },
    head: [columnas.map((columna) => columna.titulo)],
    body: filas.map((fila) => [...fila.celdas]),
    theme: "grid",
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2, lineColor: [226, 232, 240], lineWidth: 0.2, valign: "middle", textColor: [30, 41, 59] },
    headStyles: { fillColor: AZUL, textColor: [255, 255, 255], fontStyle: "bold", halign: "center", fontSize: 7.8, lineColor: AZUL },
    alternateRowStyles: { fillColor: [247, 250, 255] },
    columnStyles: Object.fromEntries(
      columnas.map((columna, indice) => [
        indice,
        { cellWidth: (columna.ancho / totalRelativo) * anchoUtil, halign: columna.centrada ? "center" : "left" },
      ]),
    ),
    didParseCell: (celda) => {
      if (celda.section !== "body") return;
      const resaltada = filas[celda.row.index].resaltadas.find((r) => r.columna === celda.column.index);
      if (!resaltada) return;
      celda.cell.styles.textColor = hexARgb(resaltada.texto);
      celda.cell.styles.fillColor = hexARgb(resaltada.fondo);
      celda.cell.styles.fontStyle = "bold";
    },
    didDrawCell: ({ section, cell }) => {
      if (section !== "head") return;
      doc.setDrawColor(...DORADO);
      doc.setLineWidth(0.8);
      doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
    },
    didDrawPage: dibujarCabecera,
  });

  const totalPaginas = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
    doc.setPage(pagina);
    doc.setTextColor(...TENUE);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(SUBTITULO_REPORTE, MARGEN, alto - 8);
    doc.text(`PÁGINA ${pagina} DE ${totalPaginas}`, ancho - MARGEN, alto - 8, { align: "right" });
  }

  descargarBlob(doc.output("blob"), nombreArchivoReporte(reporte.prefijoArchivo, "pdf", ahora));
}
