import { ErrorValidacion } from "./errores";

const LOCALE = "es-PE";

export function aMayusculas(valor: string): string {
  return valor.toLocaleUpperCase(LOCALE);
}

export function textoMayusculasRequerido(campo: string, valor: string): string {
  const normalizado = aMayusculas(valor.trim());
  if (normalizado.length === 0) {
    throw new ErrorValidacion(`El campo ${campo} es obligatorio.`);
  }
  return normalizado;
}

export function textoMayusculasOpcional(valor: string): string {
  return aMayusculas(valor.trim());
}

export function normalizarBusqueda(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase(LOCALE)
    .trim();
}
