"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ReactNode } from "react";
import { HiOutlineComputerDesktop, HiOutlineGlobeAmericas, HiOutlinePresentationChartLine, HiOutlineTruck } from "react-icons/hi2";

function EtiquetaBanner({ icono, children }: { icono: ReactNode; children: ReactNode }) {
  return (
    <span className="group inline-flex cursor-default items-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-zeus-dorado/70 hover:bg-white/[0.13] hover:text-white hover:shadow-[0_6px_18px_-6px_rgba(229,160,23,0.55)]">
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-zeus-dorado/15 text-zeus-dorado transition-all duration-300 group-hover:scale-110 group-hover:bg-zeus-dorado group-hover:text-zeus-banner [&>svg]:h-3.5 [&>svg]:w-3.5">
        {icono}
      </span>
      {children}
    </span>
  );
}

function IconoDestacado() {
  return (
    <span className="relative hidden h-24 w-24 shrink-0 items-center justify-center sm:flex">
      <motion.span
        className="absolute inset-0 rounded-full border border-zeus-dorado/40"
        initial={{ scale: 1, opacity: 0.5 }}
        animate={{ scale: 1.35, opacity: 0 }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
      />
      <span className="absolute inset-0 rounded-full border border-white/15 bg-white/[0.07] shadow-[inset_0_0_24px_rgba(255,255,255,0.06)]" />
      <motion.span
        className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-white/15 to-white/5 text-white ring-1 ring-zeus-dorado/40"
        animate={{ boxShadow: ["0 0 0px rgba(229,160,23,0)", "0 0 26px rgba(229,160,23,0.55)", "0 0 0px rgba(229,160,23,0)"] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }} className="flex">
          <HiOutlinePresentationChartLine className="h-7 w-7" />
        </motion.span>
      </motion.span>
    </span>
  );
}

export function BannerBitacora() {
  return (
    <section className="relative isolate overflow-hidden rounded-2xl bg-zeus-banner ring-1 ring-white/10 shadow-[0_18px_40px_-18px_rgba(1,43,122,0.65)]">
      <Image
        src="/images/banner-zeus.png"
        alt=""
        width={2170}
        height={725}
        priority
        className="absolute inset-y-0 right-0 -z-20 h-full w-auto max-w-none opacity-40 [mask-image:linear-gradient(to_right,transparent,black_30%)] md:opacity-100"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-zeus-banner from-35% via-zeus-banner/85 via-55% to-transparent" />
      <div
        className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(rgb(255_255_255)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(to_right,black,transparent_60%)]"
        aria-hidden
      />
      <span className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-zeus-dorado via-zeus-dorado/60 to-transparent" aria-hidden />

      <div className="flex min-h-48 items-center gap-6 px-6 py-7 sm:px-8">
        <IconoDestacado />
        <div className="min-w-0">
          <h1 className="bg-gradient-to-r from-white via-[#ffe3a3] to-zeus-dorado bg-clip-text font-display text-2xl font-bold tracking-tight text-transparent sm:text-[28px]">
            Bitácora y Reportes
          </h1>
          <span className="mt-2 block h-1 w-14 rounded-full bg-zeus-dorado" />
          <p className="mt-2.5 max-w-lg text-sm text-white/70">Estado de los despachos en negociación y actividad reciente del sistema.</p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <EtiquetaBanner icono={<HiOutlineComputerDesktop />}>Panel de Control</EtiquetaBanner>
            <EtiquetaBanner icono={<HiOutlineGlobeAmericas />}>Importaciones</EtiquetaBanner>
            <EtiquetaBanner icono={<HiOutlineTruck />}>Despachos</EtiquetaBanner>
          </div>
        </div>
      </div>
    </section>
  );
}
