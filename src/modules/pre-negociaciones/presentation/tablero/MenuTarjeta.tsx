"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import {
  HiOutlineArrowsRightLeft,
  HiOutlineDocumentDuplicate,
  HiOutlineEllipsisVertical,
  HiOutlineEye,
} from "react-icons/hi2";
import { useDesplegable } from "@/modules/shared/presentation/hooks/useDesplegable";
import { useMontado } from "@/modules/shared/presentation/hooks/useMontado";
import { ESTADOS_PRE_NEGOCIACION, type EstadoPreNegociacion } from "../../domain/valores";
import { COLUMNAS_TABLERO } from "./columnasTablero";

const ANCHO_MENU = 208;
/** Igual al `w-7` del disparador: el menú se alinea con su borde derecho. */
const ANCHO_DISPARADOR = 28;

interface PropsMenu {
  etiqueta: string;
  estadoActual: EstadoPreNegociacion;
  deshabilitado: boolean;
  alVer: () => void;
  alMover: (estado: EstadoPreNegociacion) => void;
  alDuplicar: () => void;
}

export function MenuTarjeta({ etiqueta, estadoActual, deshabilitado, alVer, alMover, alDuplicar }: PropsMenu) {
  const montado = useMontado();
  const { disparador, panel, posicion, abierto, abrir, cerrar } = useDesplegable<HTMLButtonElement>({
    alturaMaxima: 320,
    alturaMinimaHaciaAbajo: 240,
    anchoMinimo: ANCHO_MENU,
  });
  const destinos = ESTADOS_PRE_NEGOCIACION.filter((estado) => estado !== estadoActual);

  const elegir = (accion: () => void) => {
    cerrar(false);
    accion();
  };

  return (
    <>
      <button
        ref={disparador}
        type="button"
        disabled={deshabilitado}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-label={`Acciones de ${etiqueta}`}
        onClick={() => (abierto ? cerrar(false) : abrir())}
        className={`-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition disabled:opacity-40 ${
          abierto ? "bg-zeus-celeste text-zeus-tinta" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        }`}
      >
        <HiOutlineEllipsisVertical className="h-4 w-4" />
      </button>

      {montado &&
        createPortal(
          <AnimatePresence>
            {posicion && (
              <motion.div
                ref={panel}
                role="menu"
                aria-label={`Acciones de ${etiqueta}`}
                initial={{ opacity: 0, y: posicion.haciaArriba ? 6 : -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: "fixed",
                  left: Math.max(12, posicion.left + ANCHO_DISPARADOR - ANCHO_MENU),
                  top: posicion.top,
                  bottom: posicion.bottom,
                  width: ANCHO_MENU,
                }}
                className="z-[65] overflow-hidden rounded-xl border border-slate-200 bg-superficie p-1.5 shadow-[0_18px_40px_-12px_rgba(0,31,61,0.35)]"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => elegir(alVer)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-700 transition hover:bg-zeus-celeste hover:text-zeus-tinta"
                >
                  <HiOutlineEye className="h-4 w-4" />
                  Ver detalle
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => elegir(alDuplicar)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-700 transition hover:bg-zeus-celeste hover:text-zeus-tinta"
                >
                  <HiOutlineDocumentDuplicate className="h-4 w-4" />
                  Duplicar
                </button>
                <p className="mt-1 flex items-center gap-1.5 border-t border-slate-100 px-2.5 pb-1 pt-2 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  <HiOutlineArrowsRightLeft className="h-3 w-3" />
                  Mover a
                </p>
                {destinos.map((estado) => {
                  const { titulo, icono: Icono, fondoIcono } = COLUMNAS_TABLERO[estado];
                  return (
                    <button
                      key={estado}
                      type="button"
                      role="menuitem"
                      onClick={() => elegir(() => alMover(estado))}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      <span className={`flex h-6 w-6 items-center justify-center rounded-md ${fondoIcono}`}>
                        <Icono className="h-3.5 w-3.5" />
                      </span>
                      {titulo}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
