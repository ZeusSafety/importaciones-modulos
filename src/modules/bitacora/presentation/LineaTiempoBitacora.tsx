import { HiArrowLongRight, HiOutlineClock, HiOutlineSquares2X2, HiOutlineUser } from "react-icons/hi2";
import { TONO_ESTADO_PRE_NEGOCIACION } from "@/modules/pre-negociaciones/presentation/tonosEstado";
import { formatearFechaHora } from "@/modules/shared/domain/fechas";
import { Insignia } from "@/modules/shared/presentation/ui/Insignia";
import type { EventoBitacora } from "../domain/EventoBitacora";
import { COLOR_ESTADO, estiloDe, transicionDe } from "./estiloEventoBitacora";

export function LineaTiempoBitacora({ eventos }: { eventos: readonly EventoBitacora[] }) {
  return (
    <ol className="scroll-zeus -mr-2 max-h-[440px] overflow-y-auto pr-2">
      {eventos.map((evento, indice) => {
        const transicion = transicionDe(evento);
        const estilo = estiloDe(evento, transicion);
        const Icono = estilo.icono;
        return (
          <li key={evento.id} className="relative flex gap-3.5 pb-4 last:pb-0">
            {indice < eventos.length - 1 && <span className="absolute bottom-0 left-[17px] top-10 w-px bg-slate-200" aria-hidden />}
            <span className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-md ${estilo.avatar}`}>
              <Icono className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5 transition-colors hover:border-slate-200">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate font-display text-[13px] font-semibold text-slate-900">{evento.referencia}</p>
                <span className={`shrink-0 rounded-md px-1.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide ${estilo.insignia}`}>
                  {estilo.texto}
                </span>
              </div>
              {transicion ? (
                <div className="mt-1.5 flex flex-wrap items-center gap-2" aria-label={`De ${transicion.desde} a ${transicion.hacia}`}>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-superficie px-2.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    <span className={`h-1.5 w-1.5 rounded-full ${COLOR_ESTADO[transicion.desde].punto}`} aria-hidden />
                    {transicion.desde}
                  </span>
                  <HiArrowLongRight className="h-4 w-4 text-slate-400" aria-hidden />
                  <Insignia tono={TONO_ESTADO_PRE_NEGOCIACION[transicion.hacia]} texto={transicion.hacia} />
                </div>
              ) : (
                <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{evento.descripcion}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <HiOutlineClock className="h-3.5 w-3.5 text-slate-400" />
                  {formatearFechaHora(evento.fecha)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <HiOutlineUser className="h-3.5 w-3.5 text-slate-400" />
                  {evento.usuario}
                </span>
                <span className="inline-flex items-center gap-1">
                  <HiOutlineSquares2X2 className="h-3.5 w-3.5 text-slate-400" />
                  {evento.modulo}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
