export const TIPOS_CARGA = [
  "1 CONTENEDOR 40 HQ",
  "1 CONTENEDOR 40 NOR",
  "1 CONTENEDOR 20 ST",
  "CONSOLIDADO",
] as const;
export type TipoCarga = (typeof TIPOS_CARGA)[number];

export const ESTADOS_PRE_NEGOCIACION = ["EN PROCESO", "EN PAUSA", "COMPLETADO", "ANULADO"] as const;
export type EstadoPreNegociacion = (typeof ESTADOS_PRE_NEGOCIACION)[number];
export const ESTADO_INICIAL_PRE_NEGOCIACION: EstadoPreNegociacion = "EN PROCESO";

export const ESTADOS_COTIZACION = ["ACEPTADO", "CANCELADO"] as const;
export type EstadoCotizacion = (typeof ESTADOS_COTIZACION)[number];

export function etiquetaPreNegociacion(numero: number): string {
  return `PRE-NEGOCIACIÓN ${numero}`;
}
