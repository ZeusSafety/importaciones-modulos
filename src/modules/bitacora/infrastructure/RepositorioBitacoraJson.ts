import "server-only";
import { ColeccionJson } from "@/modules/shared/infrastructure/persistencia/ColeccionJson";
import type { EventoBitacora } from "../domain/EventoBitacora";
import type { RepositorioBitacora } from "../domain/RepositorioBitacora";

export class RepositorioBitacoraJson implements RepositorioBitacora {
  private readonly coleccion = new ColeccionJson<EventoBitacora>("bitacora");

  async agregar(evento: EventoBitacora): Promise<void> {
    await this.coleccion.transaccion((eventos) => ({
      elementos: [...eventos, evento],
      resultado: undefined,
    }));
  }

  async listarRecientes(limite: number): Promise<EventoBitacora[]> {
    const eventos = await this.coleccion.leerTodos();
    return [...eventos].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, limite);
  }
}
