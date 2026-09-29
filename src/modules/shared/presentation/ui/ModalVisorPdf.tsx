"use client";

import type { ReactNode } from "react";
import { HiOutlineDocumentText } from "react-icons/hi2";
import { Modal } from "./Modal";
import { Cargando } from "./Superficies";

interface PropsModalVisorPdf {
  abierto: boolean;
  alCerrar: () => void;
  titulo: string;
  subtitulo: string;
  url: string | null;
  pie: ReactNode;
}

export function ModalVisorPdf({ abierto, alCerrar, titulo, subtitulo, url, pie }: PropsModalVisorPdf) {
  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      titulo={titulo}
      subtitulo={subtitulo}
      icono={<HiOutlineDocumentText />}
      tamano="extraGrande"
      pie={pie}
    >
      <div className="h-[68vh] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        {url === null ? (
          <Cargando texto="Generando documento…" />
        ) : (
          <iframe src={url} title={titulo} className="h-full w-full" />
        )}
      </div>
    </Modal>
  );
}
