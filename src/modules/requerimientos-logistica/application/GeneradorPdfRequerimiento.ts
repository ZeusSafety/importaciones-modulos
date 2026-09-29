import type { Bytes } from "@/modules/shared/domain/puertos";
import type { AprobacionRequerimiento, DetalleRequerimiento } from "../domain/RequerimientoLogistica";
import type { Mes } from "../domain/valores";

export interface DatosPdfRequerimiento {
  readonly codigo: string;
  readonly fecha: string;
  readonly mes: Mes;
  readonly area: string;
  readonly responsable: string;
  readonly revisadoPor: string;
  readonly firmaResponsable: string | null;
  readonly firmaRevisor: string | null;
  readonly observaciones: string;
  readonly detalles: readonly DetalleRequerimiento[];
  readonly aprobacion: AprobacionRequerimiento | null;
}

export interface GeneradorPdfRequerimiento {
  generar(datos: DatosPdfRequerimiento): Promise<Bytes>;
}
