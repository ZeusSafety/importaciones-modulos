"use client";

import { AnimatePresence, motion, type Transition } from "framer-motion";
import { useEffect, useEffectEvent, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { HiXMark } from "react-icons/hi2";
import { useMontado } from "../hooks/useMontado";

const ANCHOS = {
  mediano: "max-w-xl",
  grande: "max-w-3xl",
  extraGrande: "max-w-5xl",
  completo: "max-w-6xl",
} as const;

export type TamanoModal = keyof typeof ANCHOS;

const ENTRADA: Transition = { duration: 0.42, ease: [0.22, 1, 0.36, 1] };
const SALIDA: Transition = { duration: 0.24, ease: [0.4, 0, 1, 1] };

/** Pila de modales abiertos: solo el superior responde a Escape y el scroll se libera al cerrar el último. */
const pilaModales: string[] = [];

function registrarModalAbierto(id: string): () => void {
  pilaModales.push(id);
  document.body.style.overflow = "hidden";
  return () => {
    pilaModales.splice(pilaModales.indexOf(id), 1);
    if (pilaModales.length === 0) document.body.style.overflow = "";
  };
}

function esModalSuperior(id: string): boolean {
  return pilaModales[pilaModales.length - 1] === id;
}

interface PropsModal {
  abierto: boolean;
  alCerrar: () => void;
  titulo: string;
  subtitulo?: string;
  icono: ReactNode;
  tamano: TamanoModal;
  pie?: ReactNode;
  /** Modales apilados sobre otro modal usan un nivel mayor. */
  nivel?: 0 | 1;
  children: ReactNode;
}

export function Modal({
  abierto,
  alCerrar,
  titulo,
  subtitulo,
  icono,
  tamano,
  pie,
  nivel = 0,
  children,
}: PropsModal) {
  const montado = useMontado();
  const idTitulo = useId();

  const alPresionarTecla = useEffectEvent((evento: KeyboardEvent) => {
    if (evento.key === "Escape" && esModalSuperior(idTitulo)) alCerrar();
  });

  useEffect(() => {
    if (!abierto) return;
    const liberar = registrarModalAbierto(idTitulo);
    const manejador = (evento: KeyboardEvent) => alPresionarTecla(evento);
    window.addEventListener("keydown", manejador);
    return () => {
      liberar();
      window.removeEventListener("keydown", manejador);
    };
  }, [abierto, idTitulo]);

  if (!montado) return null;

  return createPortal(
    <AnimatePresence>
      {abierto && (
        <motion.div
          key="modal"
          className="fixed inset-0 flex items-center justify-center p-3 sm:p-6"
          style={{ zIndex: 60 + nivel * 10 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.28 } }}
          exit={{ opacity: 0, transition: { duration: 0.24, delay: 0.04 } }}
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[3px]"
            onClick={alCerrar}
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby={idTitulo}
            className={`relative flex max-h-[92vh] w-full ${ANCHOS[tamano]} flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-superficie shadow-[0_24px_64px_-12px_rgba(0,31,61,0.45)]`}
            initial={{ opacity: 0, y: 28, scale: 0.965 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: ENTRADA }}
            exit={{ opacity: 0, y: 18, scale: 0.975, transition: SALIDA }}
          >
            <motion.div
              aria-hidden
              className="h-1 w-full origin-left bg-gradient-to-r from-zeus-azul via-zeus-azul-medio to-zeus-dorado"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1, transition: { duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] } }}
            />
            <header className="flex items-center gap-3 border-b border-slate-200 bg-gradient-to-r from-zeus-celeste/60 to-superficie px-5 py-3.5 sm:px-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zeus-azul text-lg text-white shadow-md shadow-zeus-azul/25">
                {icono}
              </span>
              <div className="min-w-0 flex-1">
                <h2 id={idTitulo} className="truncate font-display text-base font-semibold text-slate-900 sm:text-lg">
                  {titulo}
                </h2>
                {subtitulo && <p className="truncate text-xs text-slate-500">{subtitulo}</p>}
              </div>
              <button
                type="button"
                onClick={alCerrar}
                aria-label="Cerrar"
                className="rounded-lg p-2 text-slate-500 transition duration-200 hover:rotate-90 hover:bg-slate-100 hover:text-slate-800"
              >
                <HiXMark className="h-5 w-5" />
              </button>
            </header>

            <div className="scroll-zeus flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

            {pie && (
              <footer className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-superficie px-5 py-3.5 sm:flex-row sm:items-center sm:justify-end sm:px-6">
                {pie}
              </footer>
            )}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
