import type { CSSProperties } from "react";

/** Colores fijos (no los tokens de Tailwind que el modo oscuro reasigna) para que el texto blanco siempre contraste. */
const TONOS = {
  exito: { clase: "bg-[#059669] text-white", brillo: "rgb(16 185 129 / 0.55)" },
  advertencia: { clase: "bg-[#f97316] text-white", brillo: "rgb(249 115 22 / 0.55)" },
  peligro: { clase: "bg-[#dc2626] text-white", brillo: "rgb(239 68 68 / 0.55)" },
  info: { clase: "bg-zeus-azul text-white", brillo: "rgb(59 130 246 / 0.5)" },
  neutro: { clase: "bg-slate-200 text-slate-700", brillo: "rgb(148 163 184 / 0.45)" },
} as const;

export type TonoInsignia = keyof typeof TONOS;

interface PropsInsignia {
  tono: TonoInsignia;
  texto: string;
  /** Anima la insignia (halo, destello y punto vivo) para destacar estados. */
  resaltada?: boolean;
}

export function Insignia({ tono, texto, resaltada = false }: PropsInsignia) {
  const { clase, brillo } = TONOS[tono];
  return (
    <span
      style={resaltada ? ({ "--brillo": brillo } as CSSProperties) : undefined}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide shadow-sm ${clase} ${
        resaltada ? "insignia-resaltada" : ""
      }`}
    >
      {resaltada && <span className="insignia-punto h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {texto}
    </span>
  );
}
