import type { Metadata } from "next";
import { PanelPrincipal } from "@/modules/bitacora/presentation/PanelPrincipal";
import { contenedor } from "@/server/contenedor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Bitácora y Reportes" };

export default async function PaginaPrincipal() {
  const panel = await contenedor.panelPrincipal.obtener.ejecutar();
  return <PanelPrincipal panel={panel} />;
}
