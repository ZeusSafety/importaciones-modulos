import type { EventoBitacora } from "../domain/EventoBitacora";
import type { RepositorioBitacora } from "../domain/RepositorioBitacora";

const LIMITE_MAXIMO = 100;

/** Últimos eventos de la bitácora, del más reciente al más antiguo; alimenta el centro de notificaciones. */
export class ListarEventosRecientes {
  constructor(private readonly bitacora: RepositorioBitacora) {}

  ejecutar(limite: number): Promise<EventoBitacora[]> {
    const acotado = Number.isFinite(limite) ? Math.min(Math.max(Math.trunc(limite), 1), LIMITE_MAXIMO) : LIMITE_MAXIMO;
    return this.bitacora.listarRecientes(acotado);
  }
}
