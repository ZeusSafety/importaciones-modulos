"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Familia = "guante" | "casco" | "lente" | "respirador" | "auditivo" | "calzado" | "ropa" | "arnes" | "senal" | "general";

export function familiaDeProducto(codigo: string): Familia {
  switch (codigo.split("-")[1]) {
    case "GUA":
      return "guante";
    case "CAS":
      return "casco";
    case "LEN":
      return "lente";
    case "RES":
      return "respirador";
    case "AUD":
      return "auditivo";
    case "CAL":
      return "calzado";
    case "ROP":
      return "ropa";
    case "ALT":
      return "arnes";
    case "SEN":
      return "senal";
    default:
      return "general";
  }
}

function Trazo({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

function Ilustracion({ familia }: { familia: Familia }) {
  switch (familia) {
    case "guante":
      return (
        <Trazo>
          <path d="M11 16v-6.5a1.7 1.7 0 0 1 3.4 0V15" />
          <path d="M14.4 14.2V8.2a1.7 1.7 0 0 1 3.4 0V15" />
          <path d="M17.8 14.5V9.4a1.7 1.7 0 0 1 3.4 0V16" />
          <path d="M21.2 16.2v-3.2a1.6 1.6 0 0 1 3.1.5l-.4 5.2c-.3 3.2-2.6 6.3-6.4 6.3h-2.2c-3.2 0-5.3-1.6-5.3-4.6v-6.2a1.7 1.7 0 0 1 3.3-.4" />
        </Trazo>
      );
    case "casco":
      return (
        <Trazo>
          <path d="M6 18.5c.4-6 4.2-10 10-10s9.6 4 10 10" />
          <path d="M5 18.5h22" />
          <path d="M9 18.5c.6 3.2 3.2 5.5 7 5.5s6.4-2.3 7-5.5" />
          <path d="M16 8.5V6" />
        </Trazo>
      );
    case "lente":
      return (
        <Trazo>
          <path d="M4 15.5c1.2-3 3.6-4.5 6.2-4.5 2.4 0 4 1.2 5.8 1.2s3.4-1.2 5.8-1.2c2.6 0 5 1.5 6.2 4.5" />
          <path d="M6.2 15.5h6.4a3.2 3.2 0 0 1 0 6.4H9.2a3.2 3.2 0 0 1-3-6.4Z" />
          <path d="M19.4 15.5h6.4a3.2 3.2 0 0 1 0 6.4h-3.4a3.2 3.2 0 0 1-3-6.4Z" />
        </Trazo>
      );
    case "respirador":
      return (
        <Trazo>
          <path d="M9 14.5c0-4 3-7 7-7s7 3 7 7v3.2c0 3.6-2.6 6.8-7 6.8s-7-3.2-7-6.8Z" />
          <path d="M12 16.5h8" />
          <path d="M13 19.5h6" />
          <path d="M8 15.5H6.5M25.5 15.5H24" />
        </Trazo>
      );
    case "auditivo":
      return (
        <Trazo>
          <path d="M9 16a7 7 0 0 1 14 0" />
          <path d="M8 16.5v4.2a2.3 2.3 0 0 0 2.3 2.3H12v-8H10.3A2.3 2.3 0 0 0 8 17.3" />
          <path d="M24 16.5v4.2a2.3 2.3 0 0 1-2.3 2.3H20v-8h1.7A2.3 2.3 0 0 1 24 17.3" />
        </Trazo>
      );
    case "calzado":
      return (
        <Trazo>
          <path d="M6 19.5c2.2-5 5.4-7.5 8.2-7.5 1.6 0 2.4 1 3.6 1 2.4 0 3.2-4 6.4-4 1.8 0 2.8 1.2 2.8 3.2 0 2.6-2 4.8-6.2 4.8H8.2A2.2 2.2 0 0 1 6 14.8" />
          <path d="M6 20.5h22" />
        </Trazo>
      );
    case "ropa":
      return (
        <Trazo>
          <path d="M12 7.5 16 10l4-2.5 5 3-2.2 3.2V25H9.2V13.7L7 10.5Z" />
          <path d="M13.2 8.2a2.8 2.8 0 0 0 5.6 0" />
        </Trazo>
      );
    case "arnes":
      return (
        <Trazo>
          <path d="M12 6.5h8v4.2H12Z" />
          <path d="M13 10.7 10 25M19 10.7 22 25M10 17.5h12" />
          <circle cx="16" cy="17.5" r="1.4" />
        </Trazo>
      );
    case "senal":
      return (
        <Trazo>
          <path d="M16 26.5v-16" />
          <path d="M16 7.5h9l-2.2 3.2L25 14H16" />
          <path d="M11 26.5h10" />
        </Trazo>
      );
    default:
      return (
        <Trazo>
          <path d="M8 12.5 16 8l8 4.5v9L16 26l-8-4.5Z" />
          <path d="M16 17.5V26M8 12.5l8 5 8-5" />
        </Trazo>
      );
  }
}

export function MiniaturaProducto({ codigo, nombre }: { codigo: string; nombre: string }) {
  return (
    <motion.span
      initial={{ scale: 0.55, opacity: 0, rotate: -8 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 460, damping: 16 }}
      title={nombre}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-zeus-tinta shadow-sm ring-1 ring-zeus-azul/15"
    >
      <Ilustracion familia={familiaDeProducto(codigo)} />
    </motion.span>
  );
}
