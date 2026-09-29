import Image from "next/image";
import { HiOutlineGlobeAlt } from "react-icons/hi2";
import { esPaisImportacion } from "../domain/origenesImportacion";
import { BANDERA_PAIS } from "./banderasPais";

const TAMANOS = {
  chico: "h-3.5 w-5",
  mediano: "h-4 w-6",
  grande: "h-6 w-9",
} as const;

/** Países fuera del catálogo (ingresados desde «OTROS») no tienen bandera y muestran un globo. */
export function BanderaPais({ pais, tamano = "mediano" }: { pais: string; tamano?: keyof typeof TAMANOS }) {
  if (!esPaisImportacion(pais)) {
    return (
      <span className={`inline-flex shrink-0 items-center justify-center rounded-[3px] bg-zeus-celeste text-zeus-tinta ring-1 ring-zeus-azul/15 ${TAMANOS[tamano]}`}>
        <HiOutlineGlobeAlt className="h-3.5 w-3.5" />
      </span>
    );
  }
  return (
    <span className={`relative inline-block shrink-0 overflow-hidden rounded-[3px] shadow-sm ring-1 ring-black/10 ${TAMANOS[tamano]}`}>
      <Image src={BANDERA_PAIS[pais]} alt={`Bandera de ${pais}`} fill sizes="48px" className="object-cover" />
    </span>
  );
}
