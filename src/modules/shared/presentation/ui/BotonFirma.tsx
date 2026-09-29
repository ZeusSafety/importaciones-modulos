"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { HiOutlineArrowPath, HiOutlineCheckCircle, HiOutlineFingerPrint, HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";
import { Boton } from "./Boton";
import { Modal } from "./Modal";
import { PanelFirma } from "./PanelFirma";

interface PropsBotonFirma {
  id?: string;
  /** Cargo con el que se imprime la firma en el PDF, p. ej. "Elaborado por". */
  cargo: string;
  firmante: string;
  valor: string | null;
  alCambiar: (firma: string | null) => void;
  deshabilitado?: boolean;
  /** Nivel del modal de firma: 1 cuando se abre desde otro modal. */
  nivelModal?: 0 | 1;
}

export function BotonFirma({ id, cargo, firmante, valor, alCambiar, deshabilitado = false, nivelModal = 0 }: PropsBotonFirma) {
  const [abierto, setAbierto] = useState(false);
  const [borrador, setBorrador] = useState<string | null>(null);

  const abrir = () => {
    setBorrador(null);
    setAbierto(true);
  };

  const guardar = () => {
    alCambiar(borrador);
    setAbierto(false);
  };

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        {valor === null ? (
          <motion.button
            key="sin-firma"
            id={id}
            type="button"
            onClick={abrir}
            disabled={deshabilitado}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="group flex h-10 w-full items-center gap-2.5 rounded-lg border border-dashed border-slate-300 bg-superficie px-3 text-left text-sm text-slate-600 transition hover:border-zeus-azul/50 hover:bg-zeus-celeste/40 hover:text-zeus-tinta disabled:pointer-events-none disabled:opacity-60"
          >
            <HiOutlineFingerPrint className="h-4 w-4 shrink-0 text-zeus-tinta/70 transition group-hover:scale-110" />
            <span className="flex-1 truncate font-medium">Agregar firma digital</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Opcional</span>
          </motion.button>
        ) : (
          <motion.div
            key="con-firma"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex h-10 items-center gap-2.5 rounded-lg border border-slate-300 bg-superficie pl-1 pr-1.5"
          >
            <span className="flex h-8 w-20 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element -- data URL generado en el navegador */}
              <img src={valor} alt={`Firma de ${firmante || cargo}`} className="max-h-7 max-w-[72px] object-contain" />
            </span>
            <span className="inline-flex flex-1 items-center gap-1 truncate text-xs font-semibold text-zeus-tinta">
              <HiOutlineCheckCircle className="h-4 w-4 shrink-0" /> Firmado
            </span>
            <button
              id={id}
              type="button"
              onClick={abrir}
              disabled={deshabilitado}
              title="Cambiar firma"
              className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-zeus-tinta disabled:pointer-events-none disabled:opacity-40"
            >
              <HiOutlineArrowPath className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => alCambiar(null)}
              disabled={deshabilitado}
              title="Quitar firma"
              className="rounded-md p-1.5 text-slate-500 transition hover:bg-[#dc2626]/10 hover:text-[#dc2626] disabled:pointer-events-none disabled:opacity-40"
            >
              <HiOutlineTrash className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        abierto={abierto}
        alCerrar={() => setAbierto(false)}
        titulo={`Firma digital · ${cargo}`}
        subtitulo={firmante ? `Firma de ${firmante}` : "La firma se imprime en el PDF sobre la línea."}
        icono={<HiOutlinePencilSquare />}
        tamano="mediano"
        nivel={nivelModal}
        pie={
          <>
            <Boton variante="secundario" onClick={() => setAbierto(false)}>
              Cancelar
            </Boton>
            <Boton variante="primario" icono={<HiOutlineCheckCircle />} onClick={guardar} disabled={borrador === null}>
              Guardar firma
            </Boton>
          </>
        }
      >
        <PanelFirma firmante={firmante} valor={borrador} alCambiar={setBorrador} />
      </Modal>
    </>
  );
}
