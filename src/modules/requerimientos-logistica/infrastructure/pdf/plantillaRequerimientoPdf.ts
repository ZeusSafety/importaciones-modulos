import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { formatearFecha } from "@/modules/shared/domain/fechas";
import type { DatosPdfRequerimiento } from "../../application/GeneradorPdfRequerimiento";

type ColorRgb = readonly [number, number, number];

const COLOR = {
  negro: [0, 0, 0],
  texto: [17, 17, 17],
  tenue: [110, 110, 110],
  borde: [190, 190, 190],
  bordeFuerte: [40, 40, 40],
  fondoEtiqueta: [242, 242, 242],
  blanco: [255, 255, 255],
} as const satisfies Record<string, ColorRgb>;

/** Medidas en milímetros sobre hoja Carta, tomadas del formato impreso de logística. */
const PAGINA = { ancho: 215.9, alto: 279.4, margen: 7, limiteInferior: 272 } as const;
const ANCHO_UTIL = PAGINA.ancho - PAGINA.margen * 2;
const FILAS_MINIMAS = 20;
const ALTO_FILA = 7.6;
const Y_LINEA_FIRMAS = 267.5;
const ALTO_PIE_FIRMA = 6.5;
const ALTO_IMAGEN_FIRMA = 11;

function rellenar(doc: jsPDF, color: ColorRgb) {
  doc.setFillColor(color[0], color[1], color[2]);
}

function trazar(doc: jsPDF, color: ColorRgb, grosor: number) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(grosor);
}

function escribir(doc: jsPDF, color: ColorRgb, estilo: "bold" | "normal", tamano: number) {
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setFont("helvetica", estilo);
  doc.setFontSize(tamano);
}

function asegurarEspacio(doc: jsPDF, y: number, altoRequerido: number): number {
  if (y + altoRequerido <= PAGINA.limiteInferior) return y;
  doc.addPage();
  return 12;
}

function dibujarCabecera(doc: jsPDF, datos: DatosPdfRequerimiento, logo: string) {
  const x = PAGINA.margen;
  const y = 9;
  const alto = 26.5;
  const anchoLogo = 60;
  const anchoFecha = 48.5;
  const anchoCentro = ANCHO_UTIL - anchoLogo - anchoFecha;
  const xCentro = x + anchoLogo;
  const xFecha = xCentro + anchoCentro;

  rellenar(doc, COLOR.negro);
  doc.rect(x, y, anchoLogo, alto, "F");

  const propiedades = doc.getImageProperties(logo);
  const escala = Math.min(46 / propiedades.width, 18 / propiedades.height);
  const anchoImagen = propiedades.width * escala;
  const altoImagen = propiedades.height * escala;
  doc.addImage(logo, "PNG", x + (anchoLogo - anchoImagen) / 2, y + (alto - altoImagen) / 2, anchoImagen, altoImagen, "logo-zeus", "FAST");

  trazar(doc, COLOR.bordeFuerte, 0.6);
  doc.rect(x, y, ANCHO_UTIL, alto);
  doc.line(xCentro, y, xCentro, y + alto);
  doc.line(xFecha, y, xFecha, y + alto);

  const centroX = xCentro + anchoCentro / 2;
  escribir(doc, COLOR.texto, "bold", 12.5);
  doc.text("CONTROL MENSUAL DE STOCK", centroX, y + 9.5, { align: "center" });
  escribir(doc, COLOR.tenue, "bold", 7);
  doc.text("FORMATO INTERNO – LOGÍSTICA", centroX, y + 14.5, { align: "center" });
  escribir(doc, COLOR.texto, "bold", 9);
  doc.text(datos.codigo, centroX, y + 21.5, { align: "center" });

  escribir(doc, COLOR.texto, "bold", 8);
  doc.text(`FECHA:  ${formatearFecha(datos.fecha)}`, xFecha + anchoFecha / 2, y + alto / 2 + 1.2, { align: "center" });
}

function dibujarDatosGenerales(doc: jsPDF, datos: DatosPdfRequerimiento) {
  const y = 44;
  const altoFila = 6.2;
  const columnas = [
    { x: PAGINA.margen, ancho: 32.5 },
    { x: PAGINA.margen + 32.5, ancho: 67.5 },
    { x: PAGINA.margen + 100, ancho: 37.5 },
    { x: PAGINA.margen + 137.5, ancho: ANCHO_UTIL - 137.5 },
  ];
  const filas: [string, string, string, string][] = [
    ["MES:", datos.mes, "ÁREA:", datos.area],
    ["RESPONSABLE:", datos.responsable, "REVISADO POR:", datos.revisadoPor],
  ];

  filas.forEach((fila, indiceFila) => {
    const yFila = y + altoFila * indiceFila;
    fila.forEach((texto, indiceColumna) => {
      const { x, ancho } = columnas[indiceColumna];
      const esEtiqueta = indiceColumna % 2 === 0;
      if (esEtiqueta) {
        rellenar(doc, COLOR.fondoEtiqueta);
        doc.rect(x, yFila, ancho, altoFila, "F");
      }
      trazar(doc, COLOR.borde, 0.25);
      doc.rect(x, yFila, ancho, altoFila);
      escribir(doc, COLOR.texto, esEtiqueta ? "bold" : "normal", 7.5);
      const [linea] = doc.splitTextToSize(texto, ancho - 4) as string[];
      doc.text(linea, x + 2, yFila + altoFila / 2 + 1.2);
    });
  });
}

function dibujarTablaProductos(doc: jsPDF, datos: DatosPdfRequerimiento): number {
  const filasDatos = datos.detalles.map((detalle) => [
    String(detalle.item),
    detalle.codigo,
    detalle.producto,
    detalle.stockActual.toLocaleString("es-PE"),
    detalle.stockMinimo.toLocaleString("es-PE"),
    detalle.disponible === "SI" ? "SÍ" : "NO",
  ]);
  const filasVacias = Array.from({ length: Math.max(0, FILAS_MINIMAS - filasDatos.length) }, (_, indice) => [
    String(filasDatos.length + indice + 1),
    "",
    "",
    "",
    "",
    "",
  ]);
  let yFinal = 0;

  autoTable(doc, {
    startY: 64.5,
    margin: { left: PAGINA.margen, right: PAGINA.margen, top: 12, bottom: PAGINA.alto - PAGINA.limiteInferior },
    head: [["ÍTEM", "CÓDIGO", "DESCRIPCIÓN DEL PRODUCTO", "STOCK\nACTUAL", "STOCK\nMÍNIMO", "DISPONIBLE EN\nSTOCK (SÍ / NO)"]],
    body: [...filasDatos, ...filasVacias],
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: { top: 1, bottom: 1, left: 2, right: 2 },
      minCellHeight: ALTO_FILA,
      lineColor: [...COLOR.borde],
      lineWidth: 0.25,
      textColor: [...COLOR.texto],
      valign: "middle",
    },
    headStyles: {
      fillColor: [...COLOR.negro],
      textColor: [...COLOR.blanco],
      fontStyle: "bold",
      fontSize: 6.8,
      halign: "center",
      minCellHeight: 11.5,
      lineColor: [...COLOR.negro],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 14, textColor: [...COLOR.tenue] },
      1: { halign: "center", cellWidth: 27 },
      2: { cellWidth: "auto" },
      3: { halign: "center", cellWidth: 25 },
      4: { halign: "center", cellWidth: 24.5 },
      5: { halign: "center", cellWidth: 35 },
    },
    didDrawPage: (pagina) => {
      if (pagina.cursor) yFinal = pagina.cursor.y;
    },
  });

  return yFinal;
}

function dibujarObservaciones(doc: jsPDF, datos: DatosPdfRequerimiento, yInicial: number): number {
  escribir(doc, COLOR.texto, "normal", 7.5);
  const lineas = datos.observaciones.length > 0 ? (doc.splitTextToSize(datos.observaciones, ANCHO_UTIL - 6) as string[]) : [];
  const altoCaja = Math.max(10.5, lineas.length * 3.6 + 4);
  const y = asegurarEspacio(doc, yInicial, altoCaja + 6);

  escribir(doc, COLOR.texto, "bold", 7.5);
  doc.text("OBSERVACIONES / COMENTARIOS:", PAGINA.margen, y + 2);
  trazar(doc, COLOR.borde, 0.25);
  doc.rect(PAGINA.margen, y + 4, ANCHO_UTIL, altoCaja);
  if (lineas.length > 0) {
    escribir(doc, COLOR.texto, "normal", 7.5);
    doc.text(lineas, PAGINA.margen + 3, y + 8.2);
  }
  return y + 4 + altoCaja;
}

function posicionLineaFirmas(doc: jsPDF, yInicial: number): number {
  const yLinea = Math.max(yInicial + ALTO_IMAGEN_FIRMA + 8, Y_LINEA_FIRMAS);
  if (yLinea + ALTO_PIE_FIRMA <= PAGINA.alto - 4) return yLinea;
  doc.addPage();
  return Y_LINEA_FIRMAS;
}

/** Encaja la firma (manteniendo su proporción) en el recuadro sobre la línea. */
function dibujarImagenFirma(doc: jsPDF, firma: string, centroX: number, yLinea: number, anchoMaximo: number) {
  const { width, height } = doc.getImageProperties(firma);
  const escala = Math.min(anchoMaximo / width, ALTO_IMAGEN_FIRMA / height);
  const ancho = width * escala;
  const alto = height * escala;
  doc.addImage(firma, "PNG", centroX - ancho / 2, yLinea - 1 - alto, ancho, alto);
}

/** "CARGO: NOMBRE" centrado bajo la línea; el nombre se recorta si no entra en la columna. */
function dibujarCargoYNombre(doc: jsPDF, cargo: string, nombre: string, centroX: number, y: number, anchoColumna: number) {
  const etiqueta = `${cargo}: `;
  escribir(doc, COLOR.texto, "bold", 6.8);
  const anchoEtiqueta = doc.getTextWidth(etiqueta);
  escribir(doc, COLOR.texto, "normal", 6.8);
  const [nombreVisible] = nombre === "" ? [""] : (doc.splitTextToSize(nombre, anchoColumna - anchoEtiqueta) as string[]);
  const xInicio = centroX - (anchoEtiqueta + doc.getTextWidth(nombreVisible)) / 2;
  if (nombreVisible !== "") doc.text(nombreVisible, xInicio + anchoEtiqueta, y);
  escribir(doc, COLOR.texto, "bold", 6.8);
  doc.text(etiqueta, xInicio, y);
}

function dibujarFirmas(doc: jsPDF, datos: DatosPdfRequerimiento, yInicial: number) {
  const yLinea = posicionLineaFirmas(doc, yInicial);
  const anchoLinea = 42.5;
  const anchoColumna = ANCHO_UTIL / 3 - 4;
  const firmas: [string, string, string | null][] = [
    ["ELABORADO POR", datos.responsable, datos.firmaResponsable],
    ["REVISADO POR", datos.revisadoPor, datos.firmaRevisor],
    datos.aprobacion === null ? ["APROBADO POR", "", null] : ["APROBADO POR", datos.aprobacion.aprobadoPor, datos.aprobacion.firma],
  ];

  firmas.forEach(([cargo, nombre, firma], indice) => {
    const centroX = PAGINA.margen + ANCHO_UTIL * ((indice * 2 + 1) / 6);
    if (firma !== null) dibujarImagenFirma(doc, firma, centroX, yLinea, anchoLinea);
    trazar(doc, COLOR.bordeFuerte, 0.3);
    doc.line(centroX - anchoLinea / 2, yLinea, centroX + anchoLinea / 2, yLinea);
    dibujarCargoYNombre(doc, cargo, nombre, centroX, yLinea + 3.5, anchoColumna);
  });
}

/** Réplica del formato impreso "Control mensual de stock". El logo debe ser un data URL PNG con texto claro. */
export function construirPdfRequerimiento(datos: DatosPdfRequerimiento, logo: string): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "letter", orientation: "portrait" });
  doc.setProperties({
    title: `${datos.codigo} - Control mensual de stock`,
    subject: "Requerimiento de logística",
    author: "Zeus Safety",
  });

  dibujarCabecera(doc, datos, logo);
  dibujarDatosGenerales(doc, datos);
  const yTabla = dibujarTablaProductos(doc, datos);
  const yObservaciones = dibujarObservaciones(doc, datos, yTabla + 6);
  dibujarFirmas(doc, datos, yObservaciones);
  return doc;
}
