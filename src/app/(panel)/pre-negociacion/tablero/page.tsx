import type { Metadata } from "next";
import { PaginaTablero } from "@/modules/pre-negociaciones/presentation/tablero/PaginaTablero";

export const metadata: Metadata = { title: "Tablero Kanban" };

export default function Pagina() {
  return <PaginaTablero />;
}
