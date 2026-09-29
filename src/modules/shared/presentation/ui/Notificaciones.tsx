"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { HiCheckCircle, HiExclamationTriangle, HiXMark } from "react-icons/hi2";

type TipoNotificacion = "exito" | "error";

interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
}

type Notificar = (notificacion: Omit<Notificacion, "id">) => void;

const DURACION_MS = 4500;

const ContextoNotificaciones = createContext<Notificar | null>(null);

const ESTILOS: Record<TipoNotificacion, { icono: ReactNode; acento: string; barra: string }> = {
  exito: {
    icono: <HiCheckCircle className="h-6 w-6 text-emerald-600" />,
    acento: "border-l-emerald-500",
    barra: "bg-emerald-500",
  },
  error: {
    icono: <HiExclamationTriangle className="h-6 w-6 text-red-600" />,
    acento: "border-l-red-500",
    barra: "bg-red-500",
  },
};

let siguienteId = 1;

export function ProveedorNotificaciones({ children }: { children: ReactNode }) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  const descartar = useCallback((id: number) => {
    setNotificaciones((actuales) => actuales.filter((n) => n.id !== id));
  }, []);

  const notificar = useCallback<Notificar>(
    (notificacion) => {
      const id = siguienteId++;
      setNotificaciones((actuales) => [...actuales, { ...notificacion, id }]);
      window.setTimeout(() => descartar(id), DURACION_MS);
    },
    [descartar],
  );

  const valor = useMemo(() => notificar, [notificar]);

  return (
    <ContextoNotificaciones.Provider value={valor}>
      {children}
      <div className="pointer-events-none fixed right-4 top-20 z-[100] flex sm:right-6 w-[min(24rem,calc(100vw-2rem))] flex-col gap-2.5">
        <AnimatePresence initial={false}>
          {notificaciones.map((n) => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, x: 48, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1, transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ opacity: 0, x: 48, transition: { duration: 0.22 } }}
              className={`pointer-events-auto relative overflow-hidden rounded-xl border border-l-4 border-slate-200 bg-superficie shadow-xl ${ESTILOS[n.tipo].acento}`}
              role="status"
            >
              <div className="flex items-start gap-3 p-3.5">
                {ESTILOS[n.tipo].icono}
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-semibold text-slate-900">{n.titulo}</p>
                  <p className="mt-0.5 break-words text-xs text-slate-600">{n.mensaje}</p>
                </div>
                <button
                  type="button"
                  onClick={() => descartar(n.id)}
                  aria-label="Cerrar notificación"
                  className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <HiXMark className="h-4 w-4" />
                </button>
              </div>
              <motion.span
                className={`absolute bottom-0 left-0 h-0.5 ${ESTILOS[n.tipo].barra}`}
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: DURACION_MS / 1000, ease: "linear" }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ContextoNotificaciones.Provider>
  );
}

export function useNotificaciones(): Notificar {
  const notificar = useContext(ContextoNotificaciones);
  if (!notificar) {
    throw new Error("useNotificaciones debe usarse dentro de <ProveedorNotificaciones>.");
  }
  return notificar;
}
