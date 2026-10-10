import { HiOutlineChatBubbleBottomCenterText, HiOutlineClock } from "react-icons/hi2";
import { formatearFechaHora } from "@/modules/shared/domain/fechas";
import { Insignia } from "@/modules/shared/presentation/ui/Insignia";
import type { PreNegociacionDto } from "../../application/dto";
import { etiquetaContacto } from "../../domain/reglasContacto";
import { ListaArchivos } from "../archivos/ListaArchivos";
import { TEXTO_COTIZACION_SIN_ESTADO, TONO_ESTADO_COTIZACION } from "../tonosEstado";

type CotizacionDto = PreNegociacionDto["cotizaciones"][number];

export function EstadoCotizacion({ estado }: { estado: CotizacionDto["estado"] }) {
  return estado === null ? <Insignia tono="neutro" texto={TEXTO_COTIZACION_SIN_ESTADO} /> : <Insignia tono={TONO_ESTADO_COTIZACION[estado]} texto={estado} resaltada />;
}

export function LineaTiempoCotizacion({ cotizacion, numero }: { cotizacion: CotizacionDto; numero: number }) {
  const ultimo = cotizacion.contactos.length - 1;

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-superficie shadow-sm">
      <header className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-zeus-celeste/70 to-transparent px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zeus-azul font-display text-sm font-bold text-white shadow-sm">
          {numero}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Cotización {numero}</p>
          <div className="flex min-w-0 items-baseline gap-2">
            <p className="truncate font-display text-sm font-bold text-slate-900">{cotizacion.proveedor}</p>
            {cotizacion.productos ? (
              <p className="truncate text-xs font-semibold text-zeus-tinta" title={cotizacion.productos}>
                {cotizacion.productos}
              </p>
            ) : null}
          </div>
        </div>
        <span className="rounded-full border border-slate-200 bg-superficie px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
          {cotizacion.contactos.length} contacto(s)
        </span>
        <EstadoCotizacion estado={cotizacion.estado} />
      </header>

      <ol className="px-4 py-4">
        {cotizacion.contactos.map((contacto, indice) => {
          const esUltimo = indice === ultimo;
          return (
            <li key={contacto.id} className="relative flex gap-3 pb-4 last:pb-0">
              {!esUltimo && <span aria-hidden className="absolute bottom-0 left-4 top-9 w-0.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-zeus-azul/35 to-slate-200" />}
              <span
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-[11px] font-bold ring-4 ring-superficie ${
                  esUltimo ? "bg-zeus-azul text-white shadow-md shadow-zeus-azul/25" : "bg-zeus-celeste text-zeus-tinta"
                }`}
              >
                {contacto.orden}°
              </span>
              <div
                className={`min-w-0 flex-1 rounded-lg border px-3.5 py-2.5 transition-colors ${
                  esUltimo ? "border-zeus-azul/25 bg-zeus-celeste/40" : "border-slate-200 bg-slate-50/60"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 font-display text-xs font-bold text-zeus-tinta">
                    {etiquetaContacto(contacto.orden)}
                    {esUltimo && cotizacion.contactos.length > 1 && (
                      <span className="rounded-full bg-zeus-dorado/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700">Último</span>
                    )}
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-md bg-superficie px-2 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">
                    <HiOutlineClock className="h-3.5 w-3.5" />
                    {formatearFechaHora(contacto.fechaHora)}
                  </span>
                </div>
                {contacto.observaciones ? (
                  <p className="mt-2 flex gap-1.5 text-xs leading-relaxed text-slate-700">
                    <HiOutlineChatBubbleBottomCenterText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                    {contacto.observaciones}
                  </p>
                ) : (
                  <p className="mt-2 text-[11px] italic text-slate-400">Sin observaciones</p>
                )}
                {contacto.archivos.length > 0 && (
                  <div className="mt-2.5">
                    <ListaArchivos archivos={contacto.archivos} />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </article>
  );
}
