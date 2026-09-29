import { z } from "zod";
import type { RequerimientoLogisticaPrimitivos } from "../domain/RequerimientoLogistica";
import { AREAS, DISPONIBILIDADES, MESES } from "../domain/valores";

export const esquemaRegistroRequerimiento = z.object({
  mes: z.enum(MESES),
  area: z.enum(AREAS),
  responsable: z.string(),
  revisadoPor: z.string(),
  firmaResponsable: z.string().nullable(),
  firmaRevisor: z.string().nullable(),
  observaciones: z.string(),
  detalles: z
    .array(
      z.object({
        codigo: z.string().min(1),
        disponible: z.enum(DISPONIBILIDADES),
      }),
    )
    .min(1, "Agregue al menos un producto."),
});

export type RegistroRequerimientoDto = z.infer<typeof esquemaRegistroRequerimiento>;

export const esquemaAprobacionRequerimiento = z.object({
  aprobadoPor: z.string(),
  firma: z.string().nullable(),
});

export type AprobacionRequerimientoDto = z.infer<typeof esquemaAprobacionRequerimiento>;

export type RequerimientoLogisticaDto = RequerimientoLogisticaPrimitivos;

export interface SiguienteCodigoRequerimientoDto {
  readonly codigo: string;
}
