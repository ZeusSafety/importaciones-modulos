import { ErrorValidacion } from "./errores";

export const ZONA_HORARIA = "America/Lima";

export function fechaIsoValida(campo: string, valor: string): string {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) {
    throw new ErrorValidacion(`El campo ${campo} no contiene una fecha válida.`);
  }
  return fecha.toISOString();
}

export function formatearFecha(iso: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: ZONA_HORARIA,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatearFechaHora(iso: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: ZONA_HORARIA,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

/** Convierte un ISO a `YYYY-MM-DDTHH:mm` en hora de Lima, formato que exige `<input type="datetime-local">`. */
export function isoAFechaHoraLocal(iso: string): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const valor = (tipo: Intl.DateTimeFormatPartTypes) => {
    const parte = partes.find((p) => p.type === tipo);
    if (!parte) throw new Error(`No se pudo obtener "${tipo}" de la fecha ${iso}.`);
    return parte.value;
  };
  return `${valor("year")}-${valor("month")}-${valor("day")}T${valor("hour")}:${valor("minute")}`;
}

/** Día calendario `YYYY-MM-DD` en hora de Lima. */
export function fechaLocalDe(iso: string): string {
  return isoAFechaHoraLocal(iso).slice(0, 10);
}

/** Interpreta un valor `YYYY-MM-DDTHH:mm` como hora de Lima (UTC-5, sin horario de verano). */
export function fechaHoraLocalAIso(valor: string): string {
  const fecha = new Date(`${valor}:00-05:00`);
  if (Number.isNaN(fecha.getTime())) {
    throw new ErrorValidacion("La fecha y hora ingresada no es válida.");
  }
  return fecha.toISOString();
}
