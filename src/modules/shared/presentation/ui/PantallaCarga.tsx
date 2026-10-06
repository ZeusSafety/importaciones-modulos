"use client";

import { useEffect, useState } from "react";

const DURACION_MS = 3600;
const LOGO = "/images/logo-zeus-safety.png";
const LOGO_CLARO = "/images/logo-zeus-safety-blanco.png";

/** Cortes verticales del PNG real para que, al juntarse, sea el logo completo. */
const PIEZAS = [
  { id: "1", clip: "inset(0 80.4% 0 0)", clase: "zeus-desde-izq", retraso: "0.08s" },
  { id: "2", clip: "inset(0 60.4% 0 19.6%)", clase: "zeus-desde-arriba", retraso: "0.32s" },
  { id: "3", clip: "inset(0 40.4% 0 39.6%)", clase: "zeus-desde-abajo", retraso: "0.56s" },
  { id: "4", clip: "inset(0 20.4% 0 59.6%)", clase: "zeus-desde-arriba", retraso: "0.8s" },
  { id: "5", clip: "inset(0 0 0 79.6%)", clase: "zeus-desde-der", retraso: "1.04s" },
] as const;

function PiezasLogo({ src }: { src: string }) {
  return (
    <>
      {PIEZAS.map((pieza) => (
        <img
          key={pieza.id}
          src={src}
          alt=""
          className={`zeus-trozo zeus-pieza ${pieza.clase}`}
          style={{ clipPath: pieza.clip, animationDelay: pieza.retraso }}
        />
      ))}
    </>
  );
}

export function PantallaCarga() {
  const [visible, setVisible] = useState(true);
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    const mostrar = window.setTimeout(() => setSaliendo(true), DURACION_MS);
    return () => window.clearTimeout(mostrar);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Cargando Zeus Safety"
      onTransitionEnd={(evento) => {
        if (evento.target === evento.currentTarget && saliendo) setVisible(false);
      }}
      className={`zeus-carga fixed inset-0 z-[80] flex items-center justify-center transition-opacity duration-700 ${saliendo ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      <div className="flex w-[min(58vw,320px)] flex-col items-center">
        <div className="relative w-full dark:hidden" style={{ aspectRatio: "2480 / 1089" }}>
          <PiezasLogo src={LOGO} />
        </div>
        <div className="relative hidden w-full dark:block" style={{ aspectRatio: "600 / 263" }}>
          <PiezasLogo src={LOGO_CLARO} />
        </div>
        <p
          className="zeus-pieza zeus-desde-abajo mt-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-zeus-azul/50 dark:text-slate-400"
          style={{ animationDelay: "1.7s" }}
        >
          Sistema de importaciones
        </p>
      </div>
    </div>
  );
}
