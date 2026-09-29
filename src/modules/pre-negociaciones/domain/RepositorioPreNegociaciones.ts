import type { PreNegociacion } from "./PreNegociacion";

export interface RepositorioPreNegociaciones {
  listar(): Promise<PreNegociacion[]>;
  buscarPorId(id: string): Promise<PreNegociacion | undefined>;
  numerosRegistrados(): Promise<number[]>;
  /** Asigna el siguiente número correlativo y guarda en una sola operación atómica. */
  registrarConSiguienteNumero(crear: (numero: number) => PreNegociacion): Promise<PreNegociacion>;
  actualizar(preNegociacion: PreNegociacion): Promise<void>;
}
