import "server-only";
import { z } from "zod";
import catalogo from "../../../../data/catalogo-productos.json";
import type { Producto } from "../domain/Producto";
import type { RepositorioProductos } from "../domain/RepositorioProductos";

const esquemaCatalogo = z.array(
  z.object({
    codigo: z.string().min(1),
    nombre: z.string().min(1),
    stockActual: z.number().int().nonnegative(),
    stockMinimo: z.number().int().nonnegative(),
  }),
);

export class RepositorioProductosJson implements RepositorioProductos {
  async listar(): Promise<Producto[]> {
    return esquemaCatalogo.parse(catalogo);
  }
}
