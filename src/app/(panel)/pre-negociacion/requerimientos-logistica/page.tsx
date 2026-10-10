import type { Metadata } from "next";
import { PaginaRequerimientosLogistica } from "@/modules/requerimientos-logistica/presentation/PaginaRequerimientosLogistica";

export const metadata: Metadata = { title: "Requerimientos Logística" };

export default function Pagina() {
  return <PaginaRequerimientosLogistica />;
}
