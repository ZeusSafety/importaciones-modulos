"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { formatearFecha } from "@/modules/shared/domain/fechas";
import { Insignia } from "@/modules/shared/presentation/ui/Insignia";
import { Paginacion, paginar } from "@/modules/shared/presentation/ui/Paginacion";
import type { PreNegociacionDto } from "../../application/dto";
import { etiquetaPreNegociacion } from "../../domain/valores";
import { TONO_ESTADO_PRE_NEGOCIACION } from "../tonosEstado";
import { DetallePreNegociacion } from "./DetallePreNegociacion";

const POR_PAGINA = 6;
const ANCHO_LISTA = 300;
const EASE = [0.22, 1, 0.36, 1] as const;

interface PropsMaestroDetalle {
  preNegociaciones: PreNegociacionDto[];
  seleccionada: PreNegociacionDto;
  listaVisible: boolean;
  alSeleccionar: (preNegociacion: PreNegociacionDto) => void;
  alEditar: (preNegociacion: PreNegociacionDto) => void;
  alDuplicar: (preNegociacion: PreNegociacionDto) => void;
  duplicando: boolean;
  alVolver: () => void;
}

export function VistaMaestroDetalle({
  preNegociaciones,
  seleccionada,
  listaVisible,
  alSeleccionar,
  alEditar,
  alDuplicar,
  duplicando,
  alVolver,
}: PropsMaestroDetalle) {
  const [pagina, setPagina] = useState(() => {
    const posicion = preNegociaciones.findIndex((p) => p.id === seleccionada.id);
    return posicion < 0 ? 1 : Math.floor(posicion / POR_PAGINA) + 1;
  });
  const vista = paginar(preNegociaciones, pagina, POR_PAGINA);

  return (
    <div className="flex min-h-[560px] flex-col lg:flex-row">
      <AnimatePresence initial={false}>
        {listaVisible && (
          <motion.aside
            key="lista"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: ANCHO_LISTA, opacity: 1, transition: { duration: 0.38, ease: EASE } }}
            exit={{ width: 0, opacity: 0, transition: { duration: 0.28, ease: EASE } }}
            className="flex max-w-full shrink-0 flex-col overflow-hidden border-b border-slate-200 max-lg:w-full! lg:border-b-0 lg:border-r"
          >
            <div
              className="flex items-center justify-between border-b-[3px] border-zeus-dorado bg-cabecera-tabla px-4 py-3 text-cabecera-tabla-texto dark:border-zeus-dorado/70"
              style={{ minWidth: ANCHO_LISTA }}
            >
              <span className="font-display text-[11px] font-bold uppercase tracking-[0.12em]">Pre-negociaciones</span>
              <span className="text-[11px] opacity-75">{preNegociaciones.length} reg.</span>
            </div>
            <ul className="scroll-zeus flex-1 divide-y divide-slate-100 overflow-y-auto" style={{ minWidth: ANCHO_LISTA }}>
              {vista.elementos.length === 0 && <li className="px-4 py-6 text-center text-xs text-slate-400">Sin coincidencias</li>}
              {vista.elementos.map((p) => {
                const activa = p.id === seleccionada.id;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      aria-pressed={activa}
                      title={activa ? "Pulse de nuevo para volver a la tabla" : undefined}
                      onClick={() => (activa ? alVolver() : alSeleccionar(p))}
                      className={`relative w-full px-4 py-3 text-left transition-colors ${activa ? "bg-zeus-celeste/70 hover:bg-zeus-celeste" : "hover:bg-slate-50"}`}
                    >
                      {activa && <motion.span layoutId="marcador-pre-negociacion" className="absolute inset-y-0 left-0 w-1 bg-zeus-azul" />}
                      <p className="font-display text-sm font-bold text-slate-900">{etiquetaPreNegociacion(p.numero)}</p>
                      <p className="text-[11px] font-medium uppercase text-slate-500">{p.tipoCarga}</p>
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400">{formatearFecha(p.creadoEn)}</span>
                        <Insignia tono={TONO_ESTADO_PRE_NEGOCIACION[p.estado]} texto={p.estado} resaltada />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div style={{ minWidth: ANCHO_LISTA }}>
              <Paginacion paginaActual={vista.paginaActual} totalPaginas={vista.totalPaginas} alCambiar={setPagina} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE, delay: 0.05 } }}
        className="min-w-0 flex-1"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={seleccionada.id}
            className="h-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE } }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
          >
            <DetallePreNegociacion
              preNegociacion={seleccionada}
              alEditar={() => alEditar(seleccionada)}
              alDuplicar={() => alDuplicar(seleccionada)}
              duplicando={duplicando}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
