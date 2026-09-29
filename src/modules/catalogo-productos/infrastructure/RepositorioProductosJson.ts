import "server-only";
import { readFile } from "node:fs/promises";
import { z } from "zod";
import { rutasAlmacenamiento } from "@/modules/shared/infrastructure/persistencia/rutasAlmacenamiento";
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
    const contenido = await readFile(rutasAlmacenamiento.catalogoProductos, "utf-8");
    return esquemaCatalogo.parse(JSON.parse(contenido));
  }
}
