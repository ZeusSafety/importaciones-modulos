import type { EventoBitacora } from "./EventoBitacora";

export interface RepositorioBitacora {
  agregar(evento: EventoBitacora): Promise<void>;
  listarRecientes(limite: number): Promise<EventoBitacora[]>;
}
