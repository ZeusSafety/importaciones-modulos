import { HiOutlineCheckBadge, HiOutlineClock, HiOutlinePencilSquare, HiOutlinePlus, HiOutlineSquares2X2, HiOutlineUser } from "react-icons/hi2";
import { formatearFechaHora } from "@/modules/shared/domain/fechas";
import type { AccionBitacora, EventoBitacora } from "../domain/EventoBitacora";

const ESTILO_ACCION: Record<AccionBitacora, { icono: typeof HiOutlinePlus; avatar: string; insignia: string; texto: string }> = {
  REGISTRO: {
    icono: HiOutlinePlus,
    avatar: "bg-gradient-to-br from-zeus-azul to-zeus-azul-medio text-white shadow-zeus-azul/30",
    insignia: "bg-zeus-celeste text-zeus-tinta",
    texto: "Registro",
  },
  ACTUALIZACION: {
    icono: HiOutlinePencilSquare,
    avatar: "bg-gradient-to-br from-amber-500 to-zeus-dorado text-white shadow-amber-500/30",
    insignia: "bg-amber-50 text-amber-700",
    texto: "Actualización",
  },
  APROBACION: {
    icono: HiOutlineCheckBadge,
    avatar: "bg-gradient-to-br from-[#10b981] to-[#059669] text-white shadow-emerald-500/30",
    insignia: "bg-[#10b981]/12 text-[#047857] dark:text-[#6ee7b7]",
    texto: "Aprobación",
  },
};

export function LineaTiempoBitacora({ eventos }: { eventos: readonly EventoBitacora[] }) {
  return (
    <ol className="scroll-zeus -mr-2 max-h-[440px] overflow-y-auto pr-2">
      {eventos.map((evento, indice) => {
        const estilo = ESTILO_ACCION[evento.accion];
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
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{evento.descripcion}</p>
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
