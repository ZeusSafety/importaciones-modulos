import { NextResponse } from "next/server";
import { leerCuerpoJson, manejarRuta } from "@/modules/shared/infrastructure/http/manejarRuta";
import { contenedor } from "@/server/contenedor";

export async function GET() {
  return manejarRuta(async () => NextResponse.json(await contenedor.preNegociaciones.listar.ejecutar()));
}

export async function POST(request: Request) {
  return manejarRuta(async () => {
    const preNegociacion = await contenedor.preNegociaciones.registrar.ejecutar(await leerCuerpoJson(request));
    return NextResponse.json(preNegociacion, { status: 201 });
  });
}
