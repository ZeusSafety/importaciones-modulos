import { NextResponse } from "next/server";
import { leerCuerpoJson, manejarRuta } from "@/modules/shared/infrastructure/http/manejarRuta";
import { contenedor } from "@/server/contenedor";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return manejarRuta(async () => {
    const { id } = await params;
    const preNegociacion = await contenedor.preNegociaciones.actualizar.ejecutar(id, await leerCuerpoJson(request));
    return NextResponse.json(preNegociacion);
  });
}
