import type { RequerimientoLogistica } from "./RequerimientoLogistica";

export interface RepositorioRequerimientos {
  listar(): Promise<RequerimientoLogistica[]>;
  buscarPorId(id: string): Promise<RequerimientoLogistica | undefined>;
  secuenciasRegistradas(): Promise<number[]>;
  /** Asigna la siguiente secuencia y guarda el requerimiento en una sola operación atómica. */
  registrarConSiguienteSecuencia(
    crear: (secuencia: number) => RequerimientoLogistica,
  ): Promise<RequerimientoLogistica>;
  /** Busca, transforma y guarda el requerimiento en una sola operación atómica. */
  modificar(
    id: string,
    cambiar: (requerimiento: RequerimientoLogistica) => RequerimientoLogistica,
  ): Promise<RequerimientoLogistica>;
}
