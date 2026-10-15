"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HiOutlineArrowUturnLeft, HiOutlineChevronDown } from "react-icons/hi2";
import { URL_REGRESO_IMPORTACION } from "../configuracion";
import { esRutaActiva, RUTAS, SECCIONES_NAVEGACION, type EnlaceNavegacion } from "./navegacion";

interface PropsBarraLateral {
  colapsada: boolean;
  alNavegar?: () => void;
  /** Distingue la instancia móvil de la de escritorio para que el indicador animado no salte entre ambas. */
  variante: "escritorio" | "movil";
}

export function BarraLateral({ colapsada, alNavegar, variante }: PropsBarraLateral) {
  const rutaActual = usePathname();
  const [cotizacionesAbiertas, setCotizacionesAbiertas] = useState(() => esRutaActiva(rutaActual, RUTAS.cotizaciones));
  const [rutaVista, setRutaVista] = useState(rutaActual);
  if (rutaActual !== rutaVista) {
    setRutaVista(rutaActual);
    if (esRutaActiva(rutaActual, RUTAS.cotizaciones)) setCotizacionesAbiertas(true);
  }

  return (
    <div className="flex h-full flex-col bg-superficie">
      <div className={`flex h-20 shrink-0 items-center justify-center border-b border-slate-100 ${colapsada ? "px-2" : "px-6"}`}>
        <Link href="/" onClick={alNavegar} className="block" aria-label="Ir al inicio">
          <Image
            src="/images/logo-zeus-safety.png"
            alt="Zeus Safety"
            width={colapsada ? 52 : 128}
            height={colapsada ? 24 : 58}
            priority
            className="h-auto transition-all duration-300 dark:hidden"
          />
          <Image
            src="/images/logo-zeus-safety-blanco.png"
            alt="Zeus Safety"
            width={colapsada ? 52 : 128}
            height={colapsada ? 24 : 58}
            priority
            className="hidden h-auto transition-all duration-300 dark:block"
          />
        </Link>
      </div>

      <nav className="scroll-zeus flex-1 overflow-y-auto px-3 py-5">
        {SECCIONES_NAVEGACION.map((seccion) => (
          <div key={seccion.titulo} className="mb-6">
            <p
              className={`mb-2 px-3 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 ${colapsada ? "text-center" : ""}`}
            >
              {colapsada ? "•" : seccion.titulo}
            </p>
            <ul className="space-y-1">
              {seccion.enlaces.map((enlace) => (
                <li key={enlace.ruta}>
                  <EnlaceMenu
                    enlace={enlace}
                    rutaActual={rutaActual}
                    colapsada={colapsada}
                    variante={variante}
                    alNavegar={alNavegar}
                    submenuAbierto={cotizacionesAbiertas}
                    alAlternarSubmenu={() => setCotizacionesAbiertas((abierto) => !abierto)}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className={`shrink-0 border-t border-slate-100 ${colapsada ? "p-3" : "p-4"}`}>
        <a
          href={URL_REGRESO_IMPORTACION}
          title="Regresar a Importación"
          className={`group relative flex items-center gap-3 overflow-hidden rounded-xl bg-gradient-to-br from-zeus-azul to-zeus-azul-medio text-white shadow-md shadow-zeus-azul/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-zeus-azul/30 ${
            colapsada ? "h-12 justify-center" : "px-3.5 py-3"
          }`}
        >
          <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-zeus-dorado transition-transform duration-300 group-hover:scale-x-100" />
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20 transition-transform duration-300 group-hover:-translate-x-0.5">
            <HiOutlineArrowUturnLeft className="h-4 w-4" />
          </span>
          {!colapsada && (
            <span className="min-w-0">
              <span className="block font-display text-xs font-semibold">Regresar a Importación</span>
              <span className="block truncate text-[10px] text-white/70">Volver al sistema Zeus</span>
            </span>
          )}
        </a>
      </div>
    </div>
  );
}

function EnlaceMenu({
  enlace,
  rutaActual,
  colapsada,
  variante,
  alNavegar,
  submenuAbierto,
  alAlternarSubmenu,
}: {
  enlace: EnlaceNavegacion;
  rutaActual: string;
  colapsada: boolean;
  variante: "escritorio" | "movil";
  alNavegar?: () => void;
  submenuAbierto: boolean;
  alAlternarSubmenu: () => void;
}) {
  const Icono = enlace.icono;
  const hijos = enlace.hijos ?? [];
  const tieneHijos = hijos.length > 0;
  const activo = esRutaActiva(rutaActual, enlace.ruta);
  const destino = tieneHijos ? (hijos[0]?.ruta ?? enlace.ruta) : enlace.ruta;
  const clase = `group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-colors ${
    colapsada ? "justify-center" : ""
  } ${activo ? "text-zeus-tinta" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`;

  const contenido = (
    <>
      {activo && (
        <motion.span
          layoutId={`indicador-navegacion-${variante}`}
          className="absolute inset-0 rounded-xl bg-zeus-celeste"
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
        >
          <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-zeus-azul" />
        </motion.span>
      )}
      <span
        className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-zeus-azul-medio to-zeus-azul text-white shadow-md shadow-zeus-azul/25 transition-transform duration-200 group-hover:scale-105 ${
          activo ? "ring-2 ring-zeus-dorado/80 ring-offset-1 ring-offset-zeus-celeste" : ""
        }`}
      >
        <Icono className="h-[17px] w-[17px]" />
      </span>
      {!colapsada && <span className="relative font-display">{enlace.etiqueta}</span>}
      {tieneHijos && !colapsada && (
        <HiOutlineChevronDown
          className={`relative ml-auto h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${submenuAbierto ? "text-slate-600" : "rotate-180"}`}
        />
      )}
    </>
  );

  return (
    <>
      {tieneHijos && !colapsada ? (
        <button type="button" className={clase} aria-expanded={submenuAbierto} title={enlace.etiqueta} onClick={alAlternarSubmenu}>
          {contenido}
        </button>
      ) : (
        <Link href={destino} onClick={alNavegar} title={enlace.etiqueta} className={clase}>
          {contenido}
        </Link>
      )}
      <AnimatePresence initial={false}>
        {tieneHijos && submenuAbierto && !colapsada && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="mt-1 ml-2 space-y-0.5 overflow-hidden rounded-lg border border-[#f3f4f6] bg-[#f3f4f6] py-1.5 dark:border-[#334155] dark:bg-[#1e293b]"
          >
            {hijos.map((hijo) => {
              const activoHijo = rutaActual === hijo.ruta;
              const IconoHijo = hijo.icono;
              return (
                <li key={hijo.ruta}>
                  <Link
                    href={hijo.ruta}
                    onClick={alNavegar}
                    className={`flex w-full items-center gap-2 rounded-md border-l-4 py-2 pl-2 pr-3 text-xs font-medium transition-all duration-200 ${
                      activoHijo
                        ? "border-[#002D5A] bg-[#d1d5db] text-[#111827] dark:border-[#3b82f6] dark:bg-[#334155] dark:text-[#f1f5f9]"
                        : "border-transparent text-[#4b5563] hover:border-[#002D5A] hover:bg-[#E9F1FF] hover:text-[#001F3D] dark:text-[#94a3b8] dark:hover:border-[#3b82f6] dark:hover:bg-[#3b82f6]/15 dark:hover:text-[#e2e8f0]"
                    }`}
                  >
                    <IconoHijo className={`h-4 w-4 shrink-0 ${activoHijo ? "text-[#002D5A] dark:text-[#93c5fd]" : "text-[#6b7280] dark:text-[#94a3b8]"}`} />
                    <span className="text-left leading-snug">{hijo.etiqueta}</span>
                  </Link>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </>
  );
}
