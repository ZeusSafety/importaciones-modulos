"use client";

import { motion } from "framer-motion";
import { HiOutlineBuildingOffice2, HiOutlineChatBubbleLeftRight, HiOutlineCube } from "react-icons/hi2";
import { formatearFecha } from "@/modules/shared/domain/fechas";
import type { PreNegociacionDto } from "../../application/dto";
import { etiquetaPreNegociacion, type EstadoPreNegociacion } from "../../domain/valores";
import { BanderaPais } from "../BanderaPais";
import { COLUMNAS_TABLERO } from "./columnasTablero";
import { MenuTarjeta } from "./MenuTarjeta";

const PROVEEDORES_VISIBLES = 2;

interface PropsTarjeta {
  preNegociacion: PreNegociacionDto;
  moviendo: boolean;
  alAbrir: () => void;
  alMover: (estado: EstadoPreNegociacion) => void;
  alIniciarArrastre: () => void;
  alTerminarArrastre: () => void;
}

function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("");
}

export function TarjetaTablero({ preNegociacion: p, moviendo, alAbrir, alMover, alIniciarArrastre, alTerminarArrastre }: PropsTarjeta) {
  const etiqueta = etiquetaPreNegociacion(p.numero);
  const contactos = p.cotizaciones.reduce((total, c) => total + c.contactos.length, 0);
  const proveedores = p.cotizaciones.map((c) => c.proveedor);
  const restantes = proveedores.length - PROVEEDORES_VISIBLES;

  return (
    <motion.div
      layout
      layoutId={`tarjeta-${p.id}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: moviendo ? 0.55 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <article
        draggable={!moviendo}
        onDragStart={(evento) => {
          evento.dataTransfer.setData("text/plain", p.id);
          evento.dataTransfer.effectAllowed = "move";
          alIniciarArrastre();
        }}
        onDragEnd={alTerminarArrastre}
        className="group relative cursor-grab overflow-hidden rounded-xl border border-slate-200 bg-superficie shadow-sm transition hover:-translate-y-0.5 hover:border-zeus-azul/25 hover:shadow-md active:cursor-grabbing"
      >
        <span className={`absolute inset-y-0 left-0 w-1 ${COLUMNAS_TABLERO[p.estado].acento}`} aria-hidden />

        <div className="py-3 pl-4 pr-3">
          <div className="flex items-start justify-between gap-2">
            <button type="button" onClick={alAbrir} className="min-w-0 text-left" aria-label={`Ver ${etiqueta}`}>
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{etiqueta}</p>
              <h3 className="mt-0.5 line-clamp-2 font-display text-sm font-semibold leading-snug text-slate-900 transition group-hover:text-zeus-tinta">
                {p.productos}
              </h3>
            </button>
            <MenuTarjeta etiqueta={etiqueta} estadoActual={p.estado} deshabilitado={moviendo} alVer={alAbrir} alMover={alMover} />
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              <BanderaPais pais={p.pais} tamano="chico" />
              {p.pais} · {p.puerto}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-zeus-celeste px-2 py-0.5 text-[10px] font-semibold text-zeus-tinta">
              <HiOutlineCube className="h-3 w-3" />
              {p.tipoCarga}
            </span>
          </div>

          {proveedores.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1">
              {proveedores.slice(0, PROVEEDORES_VISIBLES).map((proveedor, indice) => (
                <span
                  key={`${proveedor}-${indice}`}
                  className="inline-flex max-w-[150px] items-center gap-1 rounded-full border border-slate-200 py-0.5 pl-0.5 pr-2 text-[10px] font-medium text-slate-600"
                  title={proveedor}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zeus-celeste text-zeus-tinta">
                    <HiOutlineBuildingOffice2 className="h-2.5 w-2.5" />
                  </span>
                  <span className="truncate">{proveedor}</span>
                </span>
              ))}
              {restantes > 0 && (
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500" title={proveedores.slice(PROVEEDORES_VISIBLES).join(", ")}>
                  +{restantes}
                </span>
              )}
            </div>
          )}

          <footer className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1" title="Proveedores">
                <HiOutlineBuildingOffice2 className="h-3.5 w-3.5" />
                {proveedores.length}
              </span>
              <span className="flex items-center gap-1" title="Contactos">
                <HiOutlineChatBubbleLeftRight className="h-3.5 w-3.5" />
                {contactos}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span title="Última actualización">{formatearFecha(p.actualizadoEn)}</span>
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zeus-azul font-display text-[9px] font-bold text-white ring-2 ring-superficie"
                title={p.registradoPor}
              >
                {iniciales(p.registradoPor)}
              </span>
            </div>
          </footer>
        </div>

        {moviendo && (
          <span className="absolute inset-0 flex items-center justify-center bg-superficie/50">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-zeus-azul border-t-transparent" />
          </span>
        )}
      </article>
    </motion.div>
  );
}
