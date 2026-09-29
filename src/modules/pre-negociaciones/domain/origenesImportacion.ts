import { ErrorValidacion } from "@/modules/shared/domain/errores";
import { textoMayusculasRequerido } from "@/modules/shared/domain/texto";

export const PUERTOS_POR_PAIS = {
  CHINA: ["DALIAN", "GUANGZHOU", "NINGBO", "QINGDAO", "SHANGHAI", "SHENZHEN", "TIANJIN", "XIAMEN"],
  INDIA: ["CHENNAI", "KOLKATA", "MUNDRA", "NHAVA SHEVA"],
  ALEMANIA: ["BREMERHAVEN", "HAMBURGO"],
  "COREA DEL NORTE": ["CHONGJIN", "NAMPO", "WONSAN"],
  "COREA DEL SUR": ["BUSAN", "INCHEON"],
  "ESTADOS UNIDOS": ["HOUSTON", "LONG BEACH", "LOS ÁNGELES", "MIAMI", "NUEVA YORK"],
  JAPÓN: ["KOBE", "NAGOYA", "OSAKA", "TOKIO", "YOKOHAMA"],
} as const satisfies Record<string, readonly string[]>;

export type PaisImportacion = keyof typeof PUERTOS_POR_PAIS;

export const PAISES_IMPORTACION = Object.keys(PUERTOS_POR_PAIS) as PaisImportacion[];

/** Orígenes habituales; el resto se elige desde «OTROS». */
export const PAISES_PRINCIPALES: readonly PaisImportacion[] = ["CHINA", "INDIA"];

export function esPaisPrincipal(pais: string): boolean {
  return PAISES_PRINCIPALES.some((principal) => principal === pais);
}

export const OTROS_PAISES: readonly PaisImportacion[] = PAISES_IMPORTACION.filter((pais) => !PAISES_PRINCIPALES.includes(pais));

export function esPaisImportacion(valor: string): valor is PaisImportacion {
  return Object.hasOwn(PUERTOS_POR_PAIS, valor);
}

/** Países ingresados libremente en registros previos, sin repetir y en orden alfabético. */
export function paisesFueraDelCatalogo(paises: readonly string[]): string[] {
  return [...new Set(paises.filter((pais) => !esPaisImportacion(pais)))].sort((a, b) => a.localeCompare(b, "es"));
}

export function puertosDe(pais: PaisImportacion): readonly string[] {
  return PUERTOS_POR_PAIS[pais];
}

/**
 * Los países del catálogo exigen uno de sus puertos; cualquier otro país (ingresado desde «OTROS»)
 * se acepta con un puerto libre.
 */
export function validarOrigen(pais: string, puerto: string): { pais: string; puerto: string } {
  const paisNormalizado = textoMayusculasRequerido("PAÍS", pais);
  const puertoNormalizado = textoMayusculasRequerido("PUERTO", puerto);
  if (esPaisImportacion(paisNormalizado) && !puertosDe(paisNormalizado).includes(puertoNormalizado)) {
    throw new ErrorValidacion(`El PUERTO «${puertoNormalizado}» no pertenece a ${paisNormalizado}.`);
  }
  return { pais: paisNormalizado, puerto: puertoNormalizado };
}
