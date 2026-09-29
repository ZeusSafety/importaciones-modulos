import type { Producto } from "./Producto";

export interface RepositorioProductos {
  listar(): Promise<Producto[]>;
}
