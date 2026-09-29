import { manejarRuta } from "@/modules/shared/infrastructure/http/manejarRuta";
import { respuestaArchivo, solicitaDescarga } from "@/modules/shared/infrastructure/http/respuestaArchivo";
import { contenedor } from "@/server/contenedor";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return manejarRuta(async () => {
    const { id } = await params;
    const { archivo, contenido } = await contenedor.archivos.obtener.ejecutar(id);
    return respuestaArchivo(contenido, archivo.tipoMime, archivo.nombre, solicitaDescarga(request));
  });
}
