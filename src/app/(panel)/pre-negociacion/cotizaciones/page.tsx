import type { Metadata } from "next";
import { PaginaCotizaciones } from "@/modules/pre-negociaciones/presentation/PaginaCotizaciones";

export const metadata: Metadata = { title: "Cotizaciones" };

export default function Pagina() {
  return <PaginaCotizaciones />;
}
