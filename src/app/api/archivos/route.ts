import { NextResponse } from "next/server";
import { ErrorValidacion } from "@/modules/shared/domain/errores";
import { manejarRuta } from "@/modules/shared/infrastructure/http/manejarRuta";
import { contenedor } from "@/server/contenedor";

export async function POST(request: Request) {
  return manejarRuta(async () => {
    const formulario = await request.formData();
    const archivo = formulario.get("archivo");
    const subidoPor = formulario.get("subidoPor");
    if (!(archivo instanceof File)) {
      throw new ErrorValidacion('Debe adjuntar un archivo en el campo "archivo".');
    }
    if (typeof subidoPor !== "string") {
      throw new ErrorValidacion('Debe indicar quién sube el archivo en el campo "subidoPor".');
    }
    const adjunto = await contenedor.archivos.subir.ejecutar({
      nombre: archivo.name,
      tipoMime: archivo.type,
      contenido: new Uint8Array(await archivo.arrayBuffer()),
      subidoPor,
    });
    return NextResponse.json(adjunto, { status: 201 });
  });
}
