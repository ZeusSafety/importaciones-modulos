"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";
import type { PreNegociacionDto } from "../../application/dto";
import { LineaTiempoCotizacion } from "./LineaTiempoCotizacion";

type CotizacionDto = PreNegociacionDto["cotizaciones"][number];

const EASE = [0.22, 1, 0.36, 1] as const;

function useTarjetasVisibles(total: number): number {
  const [visibles, setVisibles] = useState(2);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const aplicar = () => setVisibles(media.matches && total > 1 ? 2 : 1);
    aplicar();
    media.addEventListener("change", aplicar);
    return () => media.removeEventListener("change", aplicar);
  }, [total]);

  return visibles;
}

export function CarruselProveedores({ cotizaciones }: { cotizaciones: readonly CotizacionDto[] }) {
  const visibles = useTarjetasVisibles(cotizaciones.length);
  const [inicio, setInicio] = useState(0);
  const maxInicio = Math.max(0, cotizaciones.length - visibles);
  const inicioVisible = Math.min(inicio, maxInicio);

  if (cotizaciones.length === 1) {
    return (
      <div className="md:max-w-[calc(50%-0.5rem)]">
        <LineaTiempoCotizacion cotizacion={cotizaciones[0]} numero={1} />
      </div>
    );
  }

  const mover = (delta: number) => setInicio((actual) => Math.min(maxInicio, Math.max(0, actual + delta)));
  const desde = inicioVisible + 1;
  const hasta = Math.min(inicioVisible + visibles, cotizaciones.length);

  return (
    <div className="flex items-stretch gap-2">
      <BotonDeslizar direccion="anterior" deshabilitado={inicioVisible === 0} alPulsar={() => mover(-1)} />
      <div className="min-w-0 flex-1 overflow-hidden">
        <motion.div
          className="flex"
          animate={{ x: `${(-inicioVisible * 100) / cotizaciones.length}%` }}
          transition={{ duration: 0.38, ease: EASE }}
          style={{ width: `${(cotizaciones.length / visibles) * 100}%` }}
        >
          {cotizaciones.map((cotizacion, indice) => (
            <div key={cotizacion.id} className="px-1.5" style={{ width: `${100 / cotizaciones.length}%` }}>
              <LineaTiempoCotizacion cotizacion={cotizacion} numero={indice + 1} />
            </div>
          ))}
        </motion.div>
        <p className="mt-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {desde === hasta ? `Proveedor ${desde}` : `Proveedores ${desde}–${hasta}`} de {cotizaciones.length}
        </p>
      </div>
      <BotonDeslizar direccion="siguiente" deshabilitado={inicioVisible === maxInicio} alPulsar={() => mover(1)} />
    </div>
  );
}

function BotonDeslizar({
  direccion,
  deshabilitado,
  alPulsar,
}: {
  direccion: "anterior" | "siguiente";
  deshabilitado: boolean;
  alPulsar: () => void;
}) {
  const Icono = direccion === "anterior" ? HiOutlineChevronLeft : HiOutlineChevronRight;
  return (
    <button
      type="button"
      onClick={alPulsar}
      disabled={deshabilitado}
      aria-label={direccion === "anterior" ? "Ver proveedores anteriores" : "Ver proveedores siguientes"}
      className="mt-16 flex h-10 w-10 shrink-0 items-center justify-center self-start rounded-full border border-slate-300 bg-superficie text-zeus-tinta shadow-sm transition hover:border-zeus-azul/40 hover:bg-zeus-celeste disabled:pointer-events-none disabled:opacity-30"
    >
      <Icono className="h-5 w-5" />
    </button>
  );
}
