"use client";

import { HiOutlineMagnifyingGlass, HiOutlineXMark } from "react-icons/hi2";
import { Campo, EntradaTexto } from "@/modules/shared/presentation/ui/Formulario";
import { Selector } from "@/modules/shared/presentation/ui/Selector";
import { SelectorRangoFechas } from "@/modules/shared/presentation/ui/SelectorRangoFechas";
import { ESTADOS_PRE_NEGOCIACION, TIPOS_CARGA } from "../../domain/valores";
import { SelectorPais } from "../SelectorPais";
import { TONO_ESTADO_PRE_NEGOCIACION } from "../tonosEstado";
import { FILTROS_INICIALES, hayFiltrosActivos, OPCION_TODOS, type FiltrosPreNegociaciones } from "./filtrosPreNegociaciones";

const OPCIONES_ESTADO = [OPCION_TODOS, ...ESTADOS_PRE_NEGOCIACION] as const;
const TONOS_FILTRO_ESTADO = { [OPCION_TODOS]: "info", ...TONO_ESTADO_PRE_NEGOCIACION } as const;
const OPCIONES_TIPO_CARGA = [OPCION_TODOS, ...TIPOS_CARGA] as const;

interface PropsPanelFiltros {
  filtros: FiltrosPreNegociaciones;
  alCambiar: (filtros: FiltrosPreNegociaciones) => void;
  paisesAdicionales: readonly string[];
}

export function PanelFiltrosPreNegociaciones({ filtros, alCambiar, paisesAdicionales }: PropsPanelFiltros) {
  const cambiar = <K extends keyof FiltrosPreNegociaciones>(clave: K, valor: FiltrosPreNegociaciones[K]) => alCambiar({ ...filtros, [clave]: valor });

  return (
    <section className="@container rounded-2xl border border-slate-200/80 bg-superficie p-4 shadow-sm sm:p-5">
      <div className="grid items-end gap-3 @xl:grid-cols-2 @5xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))_minmax(0,1.35fr)_auto]">
        <Campo etiqueta="Buscar" className="@xl:col-span-2 @5xl:col-span-1">
          {(id) => (
            <div className="relative">
              <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <EntradaTexto
                id={id}
                valor={filtros.busqueda}
                alCambiar={(valor) => cambiar("busqueda", valor)}
                mayusculas={false}
                placeholder="Producto, proveedor, puerto…"
                autoComplete="off"
                style={{ paddingLeft: "2.25rem" }}
              />
            </div>
          )}
        </Campo>
        <Campo etiqueta="Estado">
          {(id) => (
            <Selector
              id={id}
              valor={filtros.estado}
              opciones={OPCIONES_ESTADO}
              tonos={TONOS_FILTRO_ESTADO}
              alCambiar={(valor) => cambiar("estado", valor)}
              marcador="Todos"
            />
          )}
        </Campo>
        <Campo etiqueta="Tipo de carga">
          {(id) => (
            <Selector id={id} valor={filtros.tipoCarga} opciones={OPCIONES_TIPO_CARGA} alCambiar={(valor) => cambiar("tipoCarga", valor)} marcador="Todos" />
          )}
        </Campo>
        <Campo etiqueta="País">
          {(id) => (
            <SelectorPais
              id={id}
              valor={filtros.pais}
              paisesAdicionales={paisesAdicionales}
              permitirNuevo={false}
              alCambiar={(valor) => cambiar("pais", valor)}
              marcador="Todos"
              opcionTodos={{ texto: OPCION_TODOS, alElegir: () => cambiar("pais", "") }}
            />
          )}
        </Campo>
        <Campo etiqueta="Rango de fechas">
          {(id) => <SelectorRangoFechas id={id} rango={filtros.fechas} alCambiar={(valor) => cambiar("fechas", valor)} marcador="Todas las fechas" />}
        </Campo>
        <button
          type="button"
          disabled={!hayFiltrosActivos(filtros)}
          onClick={() => alCambiar(FILTROS_INICIALES)}
          title="Limpiar filtros"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 font-display text-xs font-semibold text-slate-600 transition enabled:hover:border-red-300 enabled:hover:bg-red-50 enabled:hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-45 @xl:col-span-2 @5xl:col-span-1"
        >
          <HiOutlineXMark className="h-4 w-4" /> Limpiar
        </button>
      </div>
    </section>
  );
}
