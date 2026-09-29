const ORDINALES = [
  "PRIMER",
  "SEGUNDO",
  "TERCER",
  "CUARTO",
  "QUINTO",
  "SEXTO",
  "SÉPTIMO",
  "OCTAVO",
  "NOVENO",
  "DÉCIMO",
] as const;

export function etiquetaContacto(orden: number): string {
  const ordinal = ORDINALES[orden - 1];
  return ordinal ? `${ordinal} CONTACTO` : `CONTACTO N° ${orden}`;
}

/**
 * Patrón intercalado: el primer contacto registra su fecha automáticamente,
 * el segundo permite modificarla, el tercero no, el cuarto sí, y así sucesivamente.
 */
export function fechaContactoEditable(orden: number): boolean {
  return orden % 2 === 0;
}
