import { manejarRuta } from "@/modules/shared/infrastructure/http/manejarRuta";
import { respuestaArchivo, solicitaDescarga } from "@/modules/shared/infrastructure/http/respuestaArchivo";
import { contenedor } from "@/server/contenedor";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return manejarRuta(async () => {
    const { id } = await params;
    const pdf = await contenedor.requerimientos.generarPdf.ejecutar(id);
    return respuestaArchivo(pdf.contenido, "application/pdf", pdf.nombreArchivo, solicitaDescarga(request));
  });
}
