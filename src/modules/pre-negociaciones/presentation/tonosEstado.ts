import type { TonoInsignia } from "@/modules/shared/presentation/ui/Insignia";
import type { EstadoCotizacion, EstadoPreNegociacion } from "../domain/valores";

export const TONO_ESTADO_PRE_NEGOCIACION: Record<EstadoPreNegociacion, TonoInsignia> = {
  "EN PROCESO": "advertencia",
  COMPLETADO: "exito",
  ANULADO: "peligro",
};

export const TONO_ESTADO_COTIZACION: Record<EstadoCotizacion, TonoInsignia> = {
  ACEPTADO: "exito",
  CANCELADO: "peligro",
};

export const TEXTO_COTIZACION_SIN_ESTADO = "POR DEFINIR";
