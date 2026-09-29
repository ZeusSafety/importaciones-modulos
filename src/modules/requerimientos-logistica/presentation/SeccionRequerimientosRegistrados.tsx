"use client";

import { useState } from "react";
import { HiOutlineCheckBadge, HiOutlineDocumentText, HiOutlineEye, HiOutlineInboxStack } from "react-icons/hi2";
import { formatearFechaHora } from "@/modules/shared/domain/fechas";
import { Insignia } from "@/modules/shared/presentation/ui/Insignia";
import { Paginacion, paginar } from "@/modules/shared/presentation/ui/Paginacion";
import { ContenedorTabla, EstadoVacio, TarjetaSeccion } from "@/modules/shared/presentation/ui/Superficies";
import type { RequerimientoLogisticaDto } from "../application/dto";

const POR_PAGINA = 8;

interface PropsSeccionRegistrados {
  requerimientos: RequerimientoLogisticaDto[];
  alVer: (requerimiento: RequerimientoLogisticaDto) => void;
  alAprobar: (requerimiento: RequerimientoLogisticaDto) => void;
}

export function SeccionRequerimientosRegistrados({ requerimientos, alVer, alAprobar }: PropsSeccionRegistrados) {
  const [pagina, setPagina] = useState(1);
  const vista = paginar(requerimientos, pagina, POR_PAGINA);
  const pendientes = requerimientos.filter((r) => r.aprobacion === null).length;

  return (
    <TarjetaSeccion
      icono={<HiOutlineInboxStack />}
      titulo="Requerimientos logística registrados"
      subtitulo={`${requerimientos.length} registro(s) · ${pendientes} pendiente(s) de aprobación`}
    >
      {requerimientos.length === 0 ? (
        <EstadoVacio icono={<HiOutlineDocumentText />} titulo="Sin requerimientos registrados" descripcion="Los requerimientos que registre aparecerán aquí con su PDF." />
      ) : (
        <ContenedorTabla>
          <div className="overflow-x-auto">
            <table className="tabla-zeus w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="px-5 py-3">Fecha de registro</th>
                  <th className="px-5 py-3">N° requerimiento</th>
                  <th className="px-5 py-3">Responsable</th>
                  <th className="px-5 py-3 text-center">Estado</th>
                  <th className="px-5 py-3">Aprobación</th>
                  <th className="px-5 py-3 text-center">Archivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vista.elementos.map((requerimiento) => (
                  <tr key={requerimiento.id} className="transition hover:bg-zeus-celeste/40">
                    <td className="px-5 py-3 text-slate-600">{formatearFechaHora(requerimiento.fechaRegistro)}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-md bg-zeus-celeste px-2 py-1 font-display text-xs font-bold text-zeus-tinta">
                        {requerimiento.codigo}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-800">{requerimiento.responsable}</td>
                    <td className="px-5 py-3 text-center">
                      {requerimiento.aprobacion === null ? (
                        <Insignia tono="advertencia" texto="Pendiente" resaltada />
                      ) : (
                        <Insignia tono="exito" texto="Aprobado" resaltada />
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {requerimiento.aprobacion === null ? (
                        <button
                          type="button"
                          onClick={() => alAprobar(requerimiento)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-[#10b981] to-[#059669] px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <HiOutlineCheckBadge className="h-4 w-4" /> Aprobar
                        </button>
                      ) : (
                        <div className="leading-tight">
                          <p className="font-semibold text-slate-800">{requerimiento.aprobacion.aprobadoPor}</p>
                          <p className="text-[11px] text-slate-500">{formatearFechaHora(requerimiento.aprobacion.fechaAprobacion)}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => alVer(requerimiento)}
                        title="Ver y descargar el PDF"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:-translate-y-0.5 hover:bg-red-100 hover:shadow-sm"
                      >
                        <HiOutlineEye className="h-4 w-4" /> {requerimiento.codigo}.pdf
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Paginacion paginaActual={vista.paginaActual} totalPaginas={vista.totalPaginas} alCambiar={setPagina} />
        </ContenedorTabla>
      )}
    </TarjetaSeccion>
  );
}
