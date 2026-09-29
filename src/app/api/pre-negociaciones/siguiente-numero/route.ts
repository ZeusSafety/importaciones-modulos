import { NextResponse } from "next/server";
import { manejarRuta } from "@/modules/shared/infrastructure/http/manejarRuta";
import { contenedor } from "@/server/contenedor";

export async function GET() {
  return manejarRuta(async () => NextResponse.json(await contenedor.preNegociaciones.siguienteNumero.ejecutar()));
}
