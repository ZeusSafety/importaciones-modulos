"use client";

import type { ReactNode } from "react";
import {
  HiOutlineBuildingStorefront,
  HiOutlineCube,
  HiOutlineFlag,
  HiOutlineGlobeAmericas,
  HiOutlineMapPin,
  HiOutlinePencilSquare,
  HiOutlineUser,
} from "react-icons/hi2";
import { formatearFechaHora } from "@/modules/shared/domain/fechas";
import { Boton } from "@/modules/shared/presentation/ui/Boton";
import { Insignia } from "@/modules/shared/presentation/ui/Insignia";
import type { PreNegociacionDto } from "../../application/dto";
import { etiquetaPreNegociacion, type EstadoPreNegociacion } from "../../domain/valores";
import { BanderaPais } from "../BanderaPais";
import { TONO_ESTADO_PRE_NEGOCIACION } from "../tonosEstado";
import { CarruselProveedores } from "./CarruselProveedores";
import { EstadoCotizacion } from "./LineaTiempoCotizacion";

const DESCRIPCION_ESTADO: Record<EstadoPreNegociacion, string> = {
  "EN PROCESO": "La negociación sigue abierta.",
  COMPLETADO: "Negociación cerrada con éxito.",
  ANULADO: "La negociación fue anulada.",
};

function Dato({ icono, etiqueta, children, ancho }: { icono: ReactNode; etiqueta: string; children: ReactNode; ancho?: boolean }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-superficie px-4 py-3 shadow-sm ${ancho ? "md:col-span-2" : ""}`}>
      <p className="mb-1 flex items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
        {icono} {etiqueta}
      </p>
      <div className="text-sm font-semibold text-slate-800">{children}</div>
    </div>
  );
}

function TituloBloque({ children }: { children: ReactNode }) {
  return <h3 className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{children}</h3>;
}

interface PropsDetalle {
  preNegociacion: PreNegociacionDto;
  alEditar: () => void;
}

export function DetallePreNegociacion({ preNegociacion: p, alEditar }: PropsDetalle) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-zeus-celeste font-display text-sm font-bold text-zeus-tinta">
            {p.numero}
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">{etiquetaPreNegociacion(p.numero)}</h2>
            <p className="text-xs text-slate-500">
              {p.registradoPor} · Actualizado {formatearFechaHora(p.actualizadoEn)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Insignia tono={TONO_ESTADO_PRE_NEGOCIACION[p.estado]} texto={p.estado} resaltada />
          <Boton variante="exito" tamano="chico" icono={<HiOutlinePencilSquare />} onClick={alEditar}>
            Editar
          </Boton>
        </div>
      </header>

      <div className="scroll-zeus flex-1 space-y-6 overflow-y-auto p-5">
        <section>
          <TituloBloque>Datos principales</TituloBloque>
          <div className="grid gap-3 md:grid-cols-2">
            <Dato icono={<HiOutlineCube />} etiqueta="Productos" ancho>
              {p.productos}
            </Dato>
            <Dato icono={<HiOutlineUser />} etiqueta="Registrado por">
              {p.registradoPor}
            </Dato>
            <Dato icono={<HiOutlineFlag />} etiqueta="Estado de la negociación">
              <div className="flex flex-wrap items-center gap-2">
                <Insignia tono={TONO_ESTADO_PRE_NEGOCIACION[p.estado]} texto={p.estado} resaltada />
                <span className="text-xs font-normal text-slate-500">{DESCRIPCION_ESTADO[p.estado]}</span>
              </div>
            </Dato>
            <Dato icono={<HiOutlineGlobeAmericas />} etiqueta="País">
              <span className="flex items-center gap-2.5">
                <BanderaPais pais={p.pais} />
                {p.pais}
              </span>
            </Dato>
            <Dato icono={<HiOutlineMapPin />} etiqueta="Puerto">
              {p.puerto}
            </Dato>
            <Dato icono={<HiOutlineBuildingStorefront />} etiqueta="Proveedores y estado de su negociación" ancho>
              {p.cotizaciones.length === 0 ? (
                <span className="font-normal text-slate-400">Sin negociaciones registradas</span>
              ) : (
                <ul className="mt-1 divide-y divide-slate-100">
                  {p.cotizaciones.map((c) => (
                    <li key={c.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zeus-celeste font-display text-xs font-bold text-zeus-tinta">
                        {c.proveedor.charAt(0)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{c.proveedor}</p>
                        <p className="text-[11px] font-normal text-slate-500">{c.contactos.length} contacto(s)</p>
                      </div>
                      <EstadoCotizacion estado={c.estado} />
                    </li>
                  ))}
                </ul>
              )}
            </Dato>
          </div>
        </section>

        {p.cotizaciones.length > 0 && (
          <section>
            <TituloBloque>Negociaciones y contactos</TituloBloque>
            <CarruselProveedores key={p.id} cotizaciones={p.cotizaciones} />
          </section>
        )}
      </div>
    </div>
  );
}
