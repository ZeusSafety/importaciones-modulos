"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiOutlineArrowUturnLeft } from "react-icons/hi2";
import { URL_REGRESO_IMPORTACION } from "../configuracion";
import { esRutaActiva, SECCIONES_NAVEGACION } from "./navegacion";

interface PropsBarraLateral {
  colapsada: boolean;
  alNavegar?: () => void;
  /** Distingue la instancia móvil de la de escritorio para que el indicador animado no salte entre ambas. */
  variante: "escritorio" | "movil";
}

export function BarraLateral({ colapsada, alNavegar, variante }: PropsBarraLateral) {
  const rutaActual = usePathname();

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
              {seccion.enlaces.map(({ ruta, etiqueta, icono: Icono }) => {
                const activo = esRutaActiva(rutaActual, ruta);
                return (
                  <li key={ruta}>
                    <Link
                      href={ruta}
                      onClick={alNavegar}
                      title={etiqueta}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors ${
                        colapsada ? "justify-center" : ""
                      } ${activo ? "text-zeus-tinta" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                    >
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
                        className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                          activo
                            ? "bg-zeus-azul text-white shadow-md shadow-zeus-azul/25"
                            : "bg-zeus-celeste text-zeus-tinta group-hover:bg-zeus-azul/10"
                        }`}
                      >
                        <Icono className="h-[18px] w-[18px]" />
                      </span>
                      {!colapsada && <span className="relative font-display">{etiqueta}</span>}
                    </Link>
                  </li>
                );
              })}
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
