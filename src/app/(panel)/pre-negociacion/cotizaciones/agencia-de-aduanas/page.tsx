import type { Metadata } from "next";
import { PaginaCotizaciones } from "@/modules/pre-negociaciones/presentation/PaginaCotizaciones";
import { configuracionVista } from "@/modules/pre-negociaciones/domain/vistasCotizacion";

const vista = configuracionVista("agencia-aduanas");

export const metadata: Metadata = { title: vista.titulo };

export default function Pagina() {
  return <PaginaCotizaciones vista="agencia-aduanas" />;
}
