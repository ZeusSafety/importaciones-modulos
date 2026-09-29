import { NextResponse } from "next/server";
import { manejarRuta } from "@/modules/shared/infrastructure/http/manejarRuta";
import { ErrorValidacion } from "@/modules/shared/domain/errores";
import { contenedor } from "@/server/contenedor";

export async function GET(request: Request) {
  return manejarRuta(async () => {
    const termino = new URL(request.url).searchParams.get("q");
    if (termino === null) {
      throw new ErrorValidacion('El parámetro "q" es obligatorio.');
    }
    return NextResponse.json(await contenedor.productos.buscar.ejecutar(termino));
  });
}
