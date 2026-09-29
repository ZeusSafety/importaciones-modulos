import { cargarImagenComoDataUrl, LOGO_ZEUS_BLANCO } from "@/modules/shared/presentation/cargarImagen";
import type { DatosPdfRequerimiento } from "../application/GeneradorPdfRequerimiento";
import { construirPdfRequerimiento } from "../infrastructure/pdf/plantillaRequerimientoPdf";

/** Genera en el navegador el mismo PDF que se registrará, para revisarlo antes de confirmar. */
export async function generarUrlVistaPrevia(datos: DatosPdfRequerimiento): Promise<string> {
  const documento = construirPdfRequerimiento(datos, await cargarImagenComoDataUrl(LOGO_ZEUS_BLANCO));
  return URL.createObjectURL(documento.output("blob"));
}
