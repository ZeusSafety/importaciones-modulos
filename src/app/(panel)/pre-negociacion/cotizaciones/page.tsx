import { redirect } from "next/navigation";
import { configuracionVista } from "@/modules/pre-negociaciones/domain/vistasCotizacion";

export default function Pagina() {
  redirect(configuracionVista("proveedores").ruta);
}
