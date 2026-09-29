"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState, useSyncExternalStore } from "react";
import {
  HiOutlineArrowsPointingIn,
  HiOutlineArrowsPointingOut,
  HiOutlineClock,
  HiOutlineMoon,
  HiOutlineSun,
} from "react-icons/hi2";
import { ZONA_HORARIA } from "@/modules/shared/domain/fechas";
import { useMinutoActual } from "../hooks/useMinutoActual";
import { AvisoCambioTema, type Aviso } from "../tema/AvisoCambioTema";
import { aplicarTema, useTema } from "../tema/tema";

const ESTILO_BASE_BOTON_CABECERA =
  "group flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-superficie shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-[0_8px_18px_rgba(15,23,42,0.08)]";

export const ESTILO_BOTON_CABECERA = `${ESTILO_BASE_BOTON_CABECERA} text-slate-600 hover:text-slate-900`;

const ESTILO_ICONO = "h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110";

export function BotonTema() {
  const tema = useTema();
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const cerrarAviso = useCallback(() => setAviso(null), []);
  if (tema === null) return <span className={`${ESTILO_BOTON_CABECERA} pointer-events-none opacity-0`} aria-hidden />;

  const oscuro = tema === "oscuro";
  const alternar = () => {
    const nuevo = oscuro ? "claro" : "oscuro";
    aplicarTema(nuevo);
    setAviso({ tema: nuevo, clave: Date.now() });
  };

  return (
    <>
    <AvisoCambioTema aviso={aviso} alCerrar={cerrarAviso} />
    <button
      type="button"
      onClick={alternar}
      className={`overflow-hidden ${oscuro ? `${ESTILO_BASE_BOTON_CABECERA} text-amber-300 hover:text-amber-200` : ESTILO_BOTON_CABECERA}`}
      aria-label={oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      aria-pressed={oscuro}
      title={oscuro ? "Modo claro" : "Modo oscuro"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={tema}
          initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="flex"
        >
          {oscuro ? <HiOutlineSun className={ESTILO_ICONO} /> : <HiOutlineMoon className={ESTILO_ICONO} />}
        </motion.span>
      </AnimatePresence>
    </button>
    </>
  );
}

function suscribirPantallaCompleta(notificar: () => void) {
  document.addEventListener("fullscreenchange", notificar);
  return () => document.removeEventListener("fullscreenchange", notificar);
}

export function BotonPantallaCompleta() {
  const activa = useSyncExternalStore(
    suscribirPantallaCompleta,
    () => document.fullscreenElement !== null,
    () => false,
  );

  const alternar = () => (activa ? document.exitFullscreen() : document.documentElement.requestFullscreen());

  return (
    <button
      type="button"
      onClick={alternar}
      className={`${ESTILO_BOTON_CABECERA} max-sm:hidden!`}
      aria-label={activa ? "Salir de pantalla completa" : "Pantalla completa"}
      aria-pressed={activa}
      title={activa ? "Salir de pantalla completa" : "Pantalla completa"}
    >
      {activa ? <HiOutlineArrowsPointingIn className={ESTILO_ICONO} /> : <HiOutlineArrowsPointingOut className={ESTILO_ICONO} />}
    </button>
  );
}

const FORMATO_HORA = new Intl.DateTimeFormat("es-PE", {
  timeZone: ZONA_HORARIA,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function RelojCabecera() {
  const minuto = useMinutoActual();
  return (
    <div
      className="hidden items-center gap-1.5 rounded-full border border-slate-200/70 bg-slate-50 px-2.5 py-1.5 shadow-sm lg:flex"
      title="Hora actual (Lima)"
    >
      <HiOutlineClock className="h-4 w-4 shrink-0 text-zeus-tinta" aria-hidden />
      {minuto === null ? (
        <span className="h-3 w-9 animate-pulse rounded bg-slate-200" />
      ) : (
        <span className="pr-0.5 text-xs font-semibold tabular-nums text-slate-800">{FORMATO_HORA.format(minuto)}</span>
      )}
    </div>
  );
}
