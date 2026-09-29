export const MODULOS_BITACORA = ["REQUERIMIENTOS LOGISTICA", "COTIZACIONES"] as const;
export type ModuloBitacora = (typeof MODULOS_BITACORA)[number];

export const ACCIONES_BITACORA = ["REGISTRO", "ACTUALIZACION", "APROBACION"] as const;
export type AccionBitacora = (typeof ACCIONES_BITACORA)[number];

export interface EventoBitacora {
  readonly id: string;
  readonly fecha: string;
  readonly modulo: ModuloBitacora;
  readonly accion: AccionBitacora;
  readonly referencia: string;
  readonly descripcion: string;
  readonly usuario: string;
}

export type NuevoEventoBitacora = Omit<EventoBitacora, "id" | "fecha">;
