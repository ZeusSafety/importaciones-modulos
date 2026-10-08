import { NextResponse } from "next/server";
import { manejarRuta } from "@/modules/shared/infrastructure/http/manejarRuta";
import { contenedor } from "@/server/contenedor";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return manejarRuta(async () => {
    const limite = Number(new URL(request.url).searchParams.get("limite") ?? 40);
    return NextResponse.json(await contenedor.bitacora.recientes.ejecutar(limite));
  });
}
