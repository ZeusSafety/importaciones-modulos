export const MESES = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SETIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
] as const;
export type Mes = (typeof MESES)[number];

export const AREAS = [
  "ADMINISTRACIÓN",
  "FACTURACIÓN",
  "GERENCIA",
  "IMPORTACIÓN",
  "LOGÍSTICA",
  "MARKETING",
  "RECURSOS HUMANOS",
  "SISTEMAS",
  "VENTAS",
] as const;
export type Area = (typeof AREAS)[number];

export const DISPONIBILIDADES = ["SI", "NO"] as const;
export type Disponibilidad = (typeof DISPONIBILIDADES)[number];
