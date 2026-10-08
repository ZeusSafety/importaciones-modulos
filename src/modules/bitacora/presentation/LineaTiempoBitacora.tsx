import type { IconType } from "react-icons";
import {
  HiArrowLongRight,
  HiOutlineArrowsRightLeft,
  HiOutlineCheckBadge,
  HiOutlineClock,
  HiOutlinePencilSquare,
  HiOutlinePlus,
  HiOutlineSquares2X2,
  HiOutlineUser,
} from "react-icons/hi2";
import { ESTADOS_PRE_NEGOCIACION, type EstadoPreNegociacion } from "@/modules/pre-negociaciones/domain/valores";
import { COLUMNAS_TABLERO } from "@/modules/pre-negociaciones/presentation/tablero/columnasTablero";
import { TONO_ESTADO_PRE_NEGOCIACION } from "@/modules/pre-negociaciones/presentation/tonosEstado";
import { formatearFechaHora } from "@/modules/shared/domain/fechas";
import { Insignia } from "@/modules/shared/presentation/ui/Insignia";
import type { AccionBitacora, EventoBitacora } from "../domain/EventoBitacora";

interface EstiloEvento {
  readonly icono: IconType;
  readonly avatar: string;
  readonly insignia: string;
  readonly texto: string;
}

const ESTILO_ACCION: Record<AccionBitacora, EstiloEvento> = {
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
  "CAMBIO DE ESTADO": {
    icono: HiOutlineArrowsRightLeft,
    avatar: "bg-gradient-to-br from-zeus-azul-medio to-zeus-azul text-white shadow-zeus-azul/30",
    insignia: "bg-zeus-celeste text-zeus-tinta",
    texto: "Cambio de estado",
  },
  APROBACION: {
    icono: HiOutlineCheckBadge,
    avatar: "bg-gradient-to-br from-[#10b981] to-[#059669] text-white shadow-emerald-500/30",
    insignia: "bg-[#10b981]/12 text-[#047857] dark:text-[#6ee7b7]",
    texto: "Aprobación",
  },
};

/** Colores fijos: los tokens de Tailwind se reasignan en modo oscuro. */
const COLOR_ESTADO: Record<EstadoPreNegociacion, { avatar: string; insignia: string; punto: string }> = {
  "EN PROCESO": {
    avatar: "bg-gradient-to-br from-[#fb923c] to-[#f97316] text-white shadow-orange-500/30",
    insignia: "bg-[#f97316]/12 text-[#c2410c] dark:text-[#fdba74]",
    punto: "bg-[#f97316]",
  },
  "EN PAUSA": {
    avatar: "bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] text-white shadow-violet-500/30",
    insignia: "bg-[#8b5cf6]/12 text-[#6d28d9] dark:text-[#c4b5fd]",
    punto: "bg-[#8b5cf6]",
  },
  COMPLETADO: {
    avatar: "bg-gradient-to-br from-[#10b981] to-[#059669] text-white shadow-emerald-500/30",
    insignia: "bg-[#10b981]/12 text-[#047857] dark:text-[#6ee7b7]",
    punto: "bg-[#10b981]",
  },
  ANULADO: {
    avatar: "bg-gradient-to-br from-[#f43f5e] to-[#dc2626] text-white shadow-red-500/30",
    insignia: "bg-[#ef4444]/12 text-[#b91c1c] dark:text-[#fca5a5]",
    punto: "bg-[#ef4444]",
  },
};

function esEstado(valor: string): valor is EstadoPreNegociacion {
  return (ESTADOS_PRE_NEGOCIACION as readonly string[]).includes(valor);
}

/** Los cambios hechos antes de guardar la transición solo la dejaron escrita en la descripción. */
const TRANSICION_EN_TEXTO = /pasó de (.+?) a (.+?) desde el tablero/;

function transicionDe(evento: EventoBitacora): { desde: EstadoPreNegociacion; hacia: EstadoPreNegociacion } | null {
  const [desde, hacia] = evento.transicion
    ? [evento.transicion.desde, evento.transicion.hacia]
    : (TRANSICION_EN_TEXTO.exec(evento.descripcion)?.slice(1) ?? []);
  return desde && hacia && esEstado(desde) && esEstado(hacia) ? { desde, hacia } : null;
}

function estiloDe(evento: EventoBitacora, transicion: ReturnType<typeof transicionDe>): EstiloEvento {
  if (!transicion) return ESTILO_ACCION[evento.accion];
  const color = COLOR_ESTADO[transicion.hacia];
  return { ...ESTILO_ACCION["CAMBIO DE ESTADO"], icono: COLUMNAS_TABLERO[transicion.hacia].icono, avatar: color.avatar, insignia: color.insignia };
}

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
