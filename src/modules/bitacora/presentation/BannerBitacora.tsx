"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { CSSProperties } from "react";
import { HiOutlineCalendarDays, HiOutlineComputerDesktop, HiOutlinePresentationChartLine } from "react-icons/hi2";
import { ZONA_HORARIA } from "@/modules/shared/domain/fechas";
import { useMinutoActual } from "@/modules/shared/presentation/hooks/useMinutoActual";

const FORMATO_FECHA_LARGA = new Intl.DateTimeFormat("es-PE", {
  timeZone: ZONA_HORARIA,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const ESTILO_PILDORA =
  "inline-flex cursor-default items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-zeus-dorado/70 hover:bg-white/20 hover:text-white hover:shadow-[0_6px_18px_-4px_rgba(229,160,23,0.45)]";

const TOTAL_PARTICULAS = 28;

/** Valores deterministas: el servidor y el cliente deben generar exactamente las mismas partículas. */
const PARTICULAS = Array.from({ length: TOTAL_PARTICULAS }, (_, i) => {
  const tamano = 2 + ((i * 7) % 4);
  const dorada = i % 6 === 0;
  return {
    id: i,
    estilo: {
      left: `${(i * 37 + 11) % 100}%`,
      width: tamano,
      height: tamano,
      background: dorada ? "rgb(229 160 23)" : "rgb(255 255 255)",
      boxShadow: dorada ? "0 0 10px rgb(229 160 23 / 0.8)" : "0 0 8px rgb(140 192 255 / 0.9)",
      "--duracion": `${8 + ((i * 5) % 7)}s`,
      "--retraso": `-${((i * 1.7) % 12).toFixed(1)}s`,
      "--deriva": `${((i * 13) % 50) - 25}px`,
      "--opacidad": (0.3 + (i % 4) * 0.15).toFixed(2),
    } as CSSProperties,
  };
});

function IconoDestacado() {
  return (
    <span className="relative hidden h-24 w-24 shrink-0 items-center justify-center sm:flex">
      {[0, 1].map((onda) => (
        <motion.span
          key={onda}
          className="absolute inset-0 rounded-full border border-white/40"
          initial={{ scale: 1, opacity: 0.55 }}
          animate={{ scale: 1.55, opacity: 0 }}
          transition={{ duration: 2.6, repeat: Infinity, delay: onda * 1.3, ease: "easeOut" }}
        />
      ))}
      <span className="absolute inset-0 rounded-full border border-white/15 bg-white/10 shadow-[inset_0_0_24px_rgba(255,255,255,0.08)] backdrop-blur-sm" />
      <motion.span
        className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/25"
        animate={{
          boxShadow: ["0 0 0px rgba(229,160,23,0)", "0 0 26px rgba(229,160,23,0.55)", "0 0 0px rgba(229,160,23,0)"],
        }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }} className="flex">
          <HiOutlinePresentationChartLine className="h-8 w-8" />
        </motion.span>
      </motion.span>
    </span>
  );
}

export function BannerBitacora() {
  const minuto = useMinutoActual();

  return (
    <section className="relative isolate overflow-hidden rounded-2xl bg-zeus-banner shadow-[0_18px_40px_-18px_rgba(1,43,122,0.65)]">
      <Image
        src="/images/banner-zeus.png"
        alt=""
        width={2170}
        height={725}
        priority
        className="absolute inset-y-0 right-0 -z-20 h-full w-auto max-w-none [mask-image:linear-gradient(to_right,transparent,black_25%,black_80%,transparent)] md:right-[4%] xl:right-[8%] 2xl:right-[15%]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-zeus-banner via-zeus-banner/80 to-transparent md:via-zeus-banner/30" />
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        {PARTICULAS.map((particula) => (
          <span key={particula.id} className="particula-banner" style={particula.estilo} />
        ))}
      </div>

      <div className="flex min-h-48 items-center gap-6 px-6 py-7 sm:px-8">
        <IconoDestacado />

        <div className="min-w-0 max-w-xl">
          <h1 className="font-display text-2xl font-bold text-white sm:text-[28px]">Bitácora y Reportes</h1>
          <span className="mt-2 block h-1 w-14 rounded-full bg-zeus-dorado" />
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            Estado de los despachos en negociación y actividad reciente del sistema.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={ESTILO_PILDORA}>
              <HiOutlineCalendarDays className="h-4 w-4" />
              {minuto === null ? (
                <span className="h-3 w-40 animate-pulse rounded bg-white/20" />
              ) : (
                <span className="inline-block first-letter:uppercase">{FORMATO_FECHA_LARGA.format(minuto)}</span>
              )}
            </span>
            <span className={ESTILO_PILDORA}>
              <HiOutlineComputerDesktop className="h-4 w-4" />
              Panel de Control
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
