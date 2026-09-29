import { normalizarBusqueda } from "@/modules/shared/domain/texto";

export interface Producto {
  readonly codigo: string;
  readonly nombre: string;
  readonly stockActual: number;
  readonly stockMinimo: number;
}

export function coincideConBusqueda(producto: Producto, termino: string): boolean {
  const buscado = normalizarBusqueda(termino);
  return (
    normalizarBusqueda(producto.nombre).includes(buscado) ||
    normalizarBusqueda(producto.codigo).includes(buscado)
  );
}
