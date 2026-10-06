"use client";

import { useState } from "react";
import { HiOutlineChevronRight, HiOutlineDocumentCurrencyDollar } from "react-icons/hi2";
import { formatearFecha } from "@/modules/shared/domain/fechas";
import { Insignia } from "@/modules/shared/presentation/ui/Insignia";
import { Paginacion, paginar } from "@/modules/shared/presentation/ui/Paginacion";
import { ContenedorTabla, EstadoVacio } from "@/modules/shared/presentation/ui/Superficies";
import type { PreNegociacionDto } from "../../application/dto";
import { etiquetaPreNegociacion } from "../../domain/valores";
import { TONO_ESTADO_PRE_NEGOCIACION } from "../tonosEstado";

const POR_PAGINA = 10;

interface PropsTabla {
  preNegociaciones: PreNegociacionDto[];
  alSeleccionar: (preNegociacion: PreNegociacionDto) => void;
}

export function TablaPreNegociaciones({ preNegociaciones, alSeleccionar }: PropsTabla) {
  const [pagina, setPagina] = useState(1);
  const vista = paginar(preNegociaciones, pagina, POR_PAGINA);

  if (preNegociaciones.length === 0) {
    return (
      <EstadoVacio
        icono={<HiOutlineDocumentCurrencyDollar />}
        titulo="No hay pre-negociaciones para mostrar"
        descripcion="Pulse «Registrar» para crear la primera pre-negociación o ajuste los filtros."
      />
    );
  }

  return (
    <ContenedorTabla>
      <table className="tabla-zeus w-full table-fixed text-left text-sm">
        <thead>
          <tr>
            <th className="w-[36%] truncate px-4 py-3 sm:w-[24%] md:w-[20%] lg:w-[17%]">Pre-negociación</th>
            <th className="hidden truncate px-4 py-3 sm:table-cell sm:w-[28%] md:w-[23%] lg:w-[19%]">Tipo carga</th>
            <th className="w-[26%] truncate px-4 py-3 sm:w-[18%] md:w-[14%] lg:w-[11%]">Fecha</th>
            <th className="hidden truncate px-4 py-3 lg:table-cell">Productos</th>
            <th className="hidden truncate px-4 py-3 md:table-cell">Registrado por</th>
            <th className="w-[28%] truncate px-4 py-3 sm:w-[22%] md:w-[16%] lg:w-[13%]">Estado</th>
            <th className="w-10 px-2 py-3" aria-label="Abrir" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {vista.elementos.map((p) => (
            <tr key={p.id} onClick={() => alSeleccionar(p)} className="group cursor-pointer transition-colors hover:bg-zeus-celeste/50">
              <td className="truncate px-4 py-3.5 font-display font-semibold text-zeus-tinta">{etiquetaPreNegociacion(p.numero)}</td>
              <td className="hidden truncate px-4 py-3.5 text-slate-700 sm:table-cell" title={p.tipoCarga}>
                {p.tipoCarga}
              </td>
              <td className="truncate px-4 py-3.5 text-slate-600">{formatearFecha(p.creadoEn)}</td>
              <td className="hidden truncate px-4 py-3.5 text-slate-700 lg:table-cell" title={p.productos}>
                {p.productos}
              </td>
              <td className="hidden truncate px-4 py-3.5 text-slate-700 md:table-cell" title={p.registradoPor}>
                {p.registradoPor}
              </td>
              <td className="px-4 py-3.5">
                <Insignia tono={TONO_ESTADO_PRE_NEGOCIACION[p.estado]} texto={p.estado} resaltada />
              </td>
              <td className="px-2 py-3.5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-zeus-tinta">
                <HiOutlineChevronRight className="h-4 w-4" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Paginacion paginaActual={vista.paginaActual} totalPaginas={vista.totalPaginas} alCambiar={setPagina} />
    </ContenedorTabla>
  );
}
