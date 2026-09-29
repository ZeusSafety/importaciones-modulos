"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, type PointerEvent } from "react";
import { HiOutlineArrowUturnLeft, HiOutlineCheckCircle, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";

type Punto = { x: number; y: number };
type Trazo = Punto[];

const ALTO_LIENZO = 180;
/** Tinta fija: la firma se imprime sobre papel blanco aunque la app esté en modo oscuro. */
const TINTA = "#0f2a4a";
const GROSOR = 2.2;
const MARGEN_EXPORTACION = 8;
const ESCALA_EXPORTACION = 2;

function dibujarTrazos(contexto: CanvasRenderingContext2D, trazos: readonly Trazo[], desplazamiento: Punto) {
  contexto.strokeStyle = TINTA;
  contexto.fillStyle = TINTA;
  contexto.lineWidth = GROSOR;
  contexto.lineCap = "round";
  contexto.lineJoin = "round";
  for (const trazo of trazos) {
    const [primero, ...resto] = trazo.map((p) => ({ x: p.x - desplazamiento.x, y: p.y - desplazamiento.y }));
    if (resto.length === 0) {
      contexto.beginPath();
      contexto.arc(primero.x, primero.y, GROSOR / 2, 0, Math.PI * 2);
      contexto.fill();
      continue;
    }
    contexto.beginPath();
    contexto.moveTo(primero.x, primero.y);
    resto.forEach((punto, indice) => {
      const siguiente = resto[indice + 1];
      if (siguiente) contexto.quadraticCurveTo(punto.x, punto.y, (punto.x + siguiente.x) / 2, (punto.y + siguiente.y) / 2);
      else contexto.lineTo(punto.x, punto.y);
    });
    contexto.stroke();
  }
}

/** PNG transparente recortado al área firmada, para que encaje bien en el PDF. */
function exportarPng(trazos: readonly Trazo[]): string {
  const puntos = trazos.flat();
  const minX = Math.min(...puntos.map((p) => p.x)) - MARGEN_EXPORTACION;
  const minY = Math.min(...puntos.map((p) => p.y)) - MARGEN_EXPORTACION;
  const ancho = Math.max(...puntos.map((p) => p.x)) + MARGEN_EXPORTACION - minX;
  const alto = Math.max(...puntos.map((p) => p.y)) + MARGEN_EXPORTACION - minY;
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.ceil(ancho * ESCALA_EXPORTACION);
  lienzo.height = Math.ceil(alto * ESCALA_EXPORTACION);
  const contexto = lienzo.getContext("2d");
  if (!contexto) throw new Error("El navegador no permite dibujar la firma.");
  contexto.scale(ESCALA_EXPORTACION, ESCALA_EXPORTACION);
  dibujarTrazos(contexto, trazos, { x: minX, y: minY });
  return lienzo.toDataURL("image/png");
}

interface PropsPanelFirma {
  /** Nombre de quien firma; se muestra bajo la línea como en el PDF. */
  firmante: string;
  valor: string | null;
  alCambiar: (firma: string | null) => void;
  deshabilitado?: boolean;
}

export function PanelFirma({ firmante, valor, alCambiar, deshabilitado = false }: PropsPanelFirma) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const trazos = useRef<Trazo[]>([]);
  const dibujando = useRef(false);

  const redibujar = () => {
    const elemento = lienzo.current;
    const contexto = elemento?.getContext("2d");
    if (!elemento || !contexto) return;
    const escala = window.devicePixelRatio;
    const { width } = elemento.getBoundingClientRect();
    elemento.width = Math.round(width * escala);
    elemento.height = Math.round(ALTO_LIENZO * escala);
    contexto.scale(escala, escala);
    dibujarTrazos(contexto, trazos.current, { x: 0, y: 0 });
  };

  useEffect(() => {
    const elemento = lienzo.current;
    if (!elemento) return;
    const observador = new ResizeObserver(redibujar);
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    if (valor !== null || trazos.current.length === 0) return;
    trazos.current = [];
    redibujar();
  }, [valor]);

  const puntoDe = (evento: PointerEvent<HTMLCanvasElement>): Punto => {
    const caja = evento.currentTarget.getBoundingClientRect();
    return { x: evento.clientX - caja.left, y: evento.clientY - caja.top };
  };

  const iniciar = (evento: PointerEvent<HTMLCanvasElement>) => {
    if (deshabilitado) return;
    evento.currentTarget.setPointerCapture(evento.pointerId);
    dibujando.current = true;
    trazos.current = [...trazos.current, [puntoDe(evento)]];
    redibujar();
  };

  const mover = (evento: PointerEvent<HTMLCanvasElement>) => {
    if (!dibujando.current) return;
    trazos.current[trazos.current.length - 1].push(puntoDe(evento));
    redibujar();
  };

  const terminar = () => {
    if (!dibujando.current) return;
    dibujando.current = false;
    alCambiar(exportarPng(trazos.current));
  };

  const deshacer = () => {
    trazos.current = trazos.current.slice(0, -1);
    redibujar();
    alCambiar(trazos.current.length === 0 ? null : exportarPng(trazos.current));
  };

  const limpiar = () => {
    trazos.current = [];
    redibujar();
    alCambiar(null);
  };

  const firmado = valor !== null;

  return (
    <div
      className={`overflow-hidden rounded-xl border-2 transition-colors duration-300 ${
        firmado ? "border-zeus-azul/50 shadow-[0_0_0_4px_rgb(0_45_90/0.06)]" : "border-dashed border-slate-300"
      }`}
    >
      <div className="relative bg-white">
        <canvas
          ref={lienzo}
          onPointerDown={iniciar}
          onPointerMove={mover}
          onPointerUp={terminar}
          onPointerCancel={terminar}
          style={{ height: ALTO_LIENZO }}
          className={`block w-full touch-none ${deshabilitado ? "cursor-not-allowed opacity-60" : "cursor-crosshair"}`}
          aria-label={`Área de firma de ${firmante || "quien firma"}`}
        />
        <AnimatePresence>
          {!firmado && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-sm font-medium text-[#94a3b8]"
            >
              <HiOutlinePencil className="h-4 w-4" /> Firme aquí con el mouse o el dedo
            </motion.span>
          )}
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-x-6 bottom-7 border-b border-[#cbd5e1]" />
        <p className="pointer-events-none absolute inset-x-0 bottom-2 truncate px-6 text-center font-display text-[10px] font-semibold uppercase tracking-wide text-[#64748b]">
          {firmante || "Nombre / Firma"}
        </p>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-3 py-1.5">
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${firmado ? "text-zeus-tinta" : "text-slate-400"}`}>
          {firmado ? (
            <>
              <HiOutlineCheckCircle className="h-4 w-4" /> Firmado
            </>
          ) : (
            "Sin firma (opcional)"
          )}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={deshacer}
            disabled={!firmado || deshabilitado}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-200 disabled:pointer-events-none disabled:opacity-40"
          >
            <HiOutlineArrowUturnLeft className="h-3.5 w-3.5" /> Deshacer
          </button>
          <button
            type="button"
            onClick={limpiar}
            disabled={!firmado || deshabilitado}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-[#dc2626] transition hover:bg-[#dc2626]/10 disabled:pointer-events-none disabled:opacity-40"
          >
            <HiOutlineTrash className="h-3.5 w-3.5" /> Borrar
          </button>
        </div>
      </div>
    </div>
  );
}
