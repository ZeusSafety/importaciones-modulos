import { z } from "zod";
import type { PreNegociacionPrimitivos } from "../domain/PreNegociacion";
import { ESTADOS_COTIZACION, ESTADOS_PRE_NEGOCIACION, TIPOS_CARGA } from "../domain/valores";

const esquemaContacto = z.object({
  id: z.uuid(),
  fechaHora: z.iso.datetime().optional(),
  observaciones: z.string(),
  archivoIds: z.array(z.uuid()),
});

const esquemaCotizacion = z.object({
  id: z.uuid(),
  proveedor: z.string(),
  productos: z.string(),
  estado: z.enum(ESTADOS_COTIZACION).nullable(),
  contactos: z.array(esquemaContacto).min(1, "Cada cotización necesita al menos un contacto."),
});

export const esquemaGuardarPreNegociacion = z.object({
  tipoCarga: z.enum(TIPOS_CARGA),
  productos: z.string(),
  pais: z.string(),
  puerto: z.string(),
  registradoPor: z.string(),
  estado: z.enum(ESTADOS_PRE_NEGOCIACION),
  cotizaciones: z.array(esquemaCotizacion),
});

export const esquemaCambiarEstadoPreNegociacion = z.object({
  estado: z.enum(ESTADOS_PRE_NEGOCIACION),
});

export type GuardarPreNegociacionDto = z.infer<typeof esquemaGuardarPreNegociacion>;
export type CambiarEstadoPreNegociacionDto = z.infer<typeof esquemaCambiarEstadoPreNegociacion>;
export type CotizacionEntradaDto = GuardarPreNegociacionDto["cotizaciones"][number];
export type ContactoEntradaDto = CotizacionEntradaDto["contactos"][number];

export type PreNegociacionDto = PreNegociacionPrimitivos;

export interface SiguienteNumeroPreNegociacionDto {
  readonly numero: number;
}
