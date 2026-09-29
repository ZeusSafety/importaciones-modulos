import { NextResponse } from "next/server";
import { leerCuerpoJson, manejarRuta } from "@/modules/shared/infrastructure/http/manejarRuta";
import { contenedor } from "@/server/contenedor";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return manejarRuta(async () => {
    const { id } = await params;
    return NextResponse.json(await contenedor.requerimientos.aprobar.ejecutar(id, await leerCuerpoJson(request)));
  });
}
