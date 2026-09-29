import { fechaLocalDe } from "@/modules/shared/domain/fechas";
import { normalizarBusqueda } from "@/modules/shared/domain/texto";
import { RANGO_VACIO, type RangoFechas } from "@/modules/shared/presentation/ui/SelectorRangoFechas";
import type { PreNegociacionDto } from "../../application/dto";
import { etiquetaPreNegociacion, type EstadoPreNegociacion, type TipoCarga } from "../../domain/valores";

export const OPCION_TODOS = "TODOS";
type ConTodos<T> = T | typeof OPCION_TODOS;

export interface FiltrosPreNegociaciones {
  readonly busqueda: string;
  readonly estado: ConTodos<EstadoPreNegociacion>;
  readonly tipoCarga: ConTodos<TipoCarga>;
  /** Vacío significa todos los países. */
  readonly pais: string;
  /** Días en hora de Lima. */
  readonly fechas: RangoFechas;
}

export const FILTROS_INICIALES: FiltrosPreNegociaciones = {
  busqueda: "",
  estado: OPCION_TODOS,
  tipoCarga: OPCION_TODOS,
  pais: "",
  fechas: RANGO_VACIO,
};

export function hayFiltrosActivos(filtros: FiltrosPreNegociaciones): boolean {
  return (
    filtros.busqueda.trim() !== "" ||
    filtros.estado !== OPCION_TODOS ||
    filtros.tipoCarga !== OPCION_TODOS ||
    filtros.pais !== "" ||
    filtros.fechas.desde !== ""
  );
}

function coincideBusqueda(preNegociacion: PreNegociacionDto, termino: string): boolean {
  const buscado = normalizarBusqueda(termino);
  const campos = [
    etiquetaPreNegociacion(preNegociacion.numero),
    preNegociacion.tipoCarga,
    preNegociacion.productos,
    preNegociacion.registradoPor,
    preNegociacion.pais,
    preNegociacion.puerto,
    preNegociacion.estado,
    ...preNegociacion.cotizaciones.map((c) => c.proveedor),
  ];
  return campos.some((campo) => normalizarBusqueda(campo).includes(buscado));
}

function dentroDelRango(iso: string, { desde, hasta }: RangoFechas): boolean {
  if (desde === "") return true;
  const dia = fechaLocalDe(iso);
  return dia >= desde && dia <= hasta;
}

export function aplicarFiltros(preNegociaciones: readonly PreNegociacionDto[], filtros: FiltrosPreNegociaciones): PreNegociacionDto[] {
  return preNegociaciones.filter(
    (p) =>
      (filtros.busqueda.trim() === "" || coincideBusqueda(p, filtros.busqueda)) &&
      (filtros.estado === OPCION_TODOS || p.estado === filtros.estado) &&
      (filtros.tipoCarga === OPCION_TODOS || p.tipoCarga === filtros.tipoCarga) &&
      (filtros.pais === "" || p.pais === filtros.pais) &&
      dentroDelRango(p.creadoEn, filtros.fechas),
  );
}
