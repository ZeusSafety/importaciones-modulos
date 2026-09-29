import { ErrorValidacion } from "@/modules/shared/domain/errores";
import { coincideConBusqueda, type Producto } from "../domain/Producto";
import type { RepositorioProductos } from "../domain/RepositorioProductos";

export const LONGITUD_MINIMA_BUSQUEDA = 2;
export const MAXIMO_RESULTADOS_BUSQUEDA = 8;

export class BuscarProductos {
  constructor(private readonly repositorio: RepositorioProductos) {}

  async ejecutar(termino: string): Promise<Producto[]> {
    if (termino.trim().length < LONGITUD_MINIMA_BUSQUEDA) {
      throw new ErrorValidacion(
        `Ingrese al menos ${LONGITUD_MINIMA_BUSQUEDA} caracteres para buscar un producto.`,
      );
    }
    const productos = await this.repositorio.listar();
    return productos
      .filter((producto) => coincideConBusqueda(producto, termino))
      .slice(0, MAXIMO_RESULTADOS_BUSQUEDA);
  }
}
