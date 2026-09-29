import { ErrorValidacion } from "./errores";

const PREFIJO_PNG = "data:image/png;base64,";
/** ~375 KB de imagen: una firma trazada a mano ocupa muy por debajo de esto. */
const LONGITUD_MAXIMA = 500_000;

/** Firma trazada a mano como data URL PNG. Es opcional: `null` significa "sin firma digital". */
export function validarFirmaDigital(campo: string, firma: string | null): string | null {
  if (firma === null) return null;
  if (!firma.startsWith(PREFIJO_PNG)) {
    throw new ErrorValidacion(`La firma de ${campo} debe ser una imagen PNG.`);
  }
  if (firma.length > LONGITUD_MAXIMA) {
    throw new ErrorValidacion(`La firma de ${campo} es demasiado grande.`);
  }
  return firma;
}
