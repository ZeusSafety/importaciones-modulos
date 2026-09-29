"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { HiOutlineMoon, HiOutlineSun, HiXMark } from "react-icons/hi2";
import { useMontado } from "../hooks/useMontado";
import type { Tema } from "./tema";

const DURACION_MS = 2200;

export interface Aviso {
  readonly tema: Tema;
  readonly clave: number;
}

export function AvisoCambioTema({ aviso, alCerrar }: { aviso: Aviso | null; alCerrar: () => void }) {
  const montado = useMontado();

  useEffect(() => {
    if (aviso === null) return;
    const temporizador = window.setTimeout(alCerrar, DURACION_MS);
    return () => window.clearTimeout(temporizador);
  }, [aviso, alCerrar]);

  if (!montado) return null;
  return createPortal(
    <AnimatePresence>
      {aviso && (
        <motion.div
          key={aviso.clave}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
          className="fixed bottom-3 left-2.5 right-2.5 z-[110] sm:bottom-6 sm:left-auto sm:right-6 sm:w-[22rem]"
        >
          <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-superficie font-display shadow-[0_8px_30px_rgba(0,45,90,0.14)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
            <div className="flex items-start gap-3 p-4 pb-[1.125rem]">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-zeus-celeste ring-2 ring-inset ring-zeus-azul/15">
                <motion.span
                  initial={{ rotate: -90, scale: 0.5 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.08 }}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-zeus-azul text-white"
                >
                  {aviso.tema === "oscuro" ? <HiOutlineMoon className="h-3.5 w-3.5" /> : <HiOutlineSun className="h-3.5 w-3.5" />}
                </motion.span>
              </span>
              <div className="min-w-0 flex-1 pr-6 pt-0.5">
                <p className="text-sm font-semibold text-slate-900">Preferencias actualizadas</p>
                <p className="mt-1 text-xs text-slate-500">{`Se activó el modo ${aviso.tema === "oscuro" ? "oscuro" : "claro"}.`}</p>
              </div>
              <button
                type="button"
                onClick={alCerrar}
                aria-label="Cerrar notificación"
                className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <HiXMark className="h-4 w-4" />
              </button>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-zeus-celeste" aria-hidden>
              <motion.div
                className="h-full bg-zeus-azul"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: DURACION_MS / 1000, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
