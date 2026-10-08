"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { HiOutlineBars3BottomLeft } from "react-icons/hi2";
import { BarraLateral } from "./BarraLateral";
import { BotonPantallaCompleta, BotonTema, ESTILO_BOTON_CABECERA, RelojCabecera } from "./ControlesCabecera";

const TRANSICION = { duration: 0.34, ease: [0.22, 1, 0.36, 1] } as const;

interface PropsMarco {
  children: ReactNode;
  /** Controles de otros módulos que se muestran antes de los botones fijos de la cabecera. */
  accionesCabecera?: ReactNode;
}

export function MarcoAplicacion({ children, accionesCabecera }: PropsMarco) {
  const [colapsada, setColapsada] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const alternarMenu = () => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setColapsada((valor) => !valor);
    } else {
      setMenuMovilAbierto((valor) => !valor);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-zeus-fondo">
      <motion.aside
        className="relative z-30 hidden shrink-0 shadow-[2px_0_12px_rgba(15,23,42,0.06)] lg:block"
        animate={{ width: colapsada ? 84 : 264 }}
        transition={TRANSICION}
      >
        <BarraLateral colapsada={colapsada} variante="escritorio" />
      </motion.aside>

      <AnimatePresence>
        {menuMovilAbierto && (
          <>
            <motion.div
              key="fondo-menu"
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuMovilAbierto(false)}
            />
            <motion.aside
              key="menu-movil"
              className="fixed inset-y-0 left-0 z-50 w-72 shadow-2xl lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0, transition: TRANSICION }}
              exit={{ x: "-100%", transition: { duration: 0.24 } }}
            >
              <BarraLateral colapsada={false} alNavegar={() => setMenuMovilAbierto(false)} variante="movil" />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="relative z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-superficie px-4 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] transition-colors duration-300 sm:px-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={alternarMenu} aria-label="Mostrar u ocultar menú" title="Menú" className={ESTILO_BOTON_CABECERA}>
              <HiOutlineBars3BottomLeft className="h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110" />
            </button>
            <p className="whitespace-nowrap font-display text-sm font-medium tracking-tight text-slate-700 sm:text-[15px]">
              Sistema de Importaciones
            </p>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            {accionesCabecera}
            <BotonPantallaCompleta />
            <BotonTema />
            <RelojCabecera />
          </div>
        </header>

        <main className="scroll-zeus flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
