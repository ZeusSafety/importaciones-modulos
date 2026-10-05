"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineArrowDownTray, HiOutlineDocumentText, HiOutlinePhoto, HiOutlineXMark } from "react-icons/hi2";
import type { ArchivoAdjuntoDto } from "@/modules/archivos/application/dto";
import { formatearFechaHora } from "@/modules/shared/domain/fechas";
import { descargarBlob } from "@/modules/shared/presentation/descargarArchivo";
import { urlDeBlobLocal } from "@/modules/shared/presentation/respaldoNavegador";
import { apiPreNegociaciones } from "../apiPreNegociaciones";

function formatearTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface PropsListaArchivos {
  archivos: readonly ArchivoAdjuntoDto[];
  alQuitar?: (archivoId: string) => void;
}

async function abrirArchivo(archivo: ArchivoAdjuntoDto, descarga: boolean) {
  const local = await urlDeBlobLocal(archivo.id);
  if (local) {
    if (descarga) {
      descargarBlob(await fetch(local).then((respuesta) => respuesta.blob()), archivo.nombre);
    } else {
      window.open(local, "_blank", "noopener");
    }
    window.setTimeout(() => URL.revokeObjectURL(local), 1000);
    return;
  }
  const url = apiPreNegociaciones.urlArchivo(archivo.id, descarga);
  if (descarga) {
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.rel = "noopener";
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    return;
  }
  window.open(url, "_blank", "noopener");
}

export function ListaArchivos({ archivos, alQuitar }: PropsListaArchivos) {
  return (
    <ul className="space-y-2">
      <AnimatePresence initial={false}>
        {archivos.map((archivo) => {
          const esImagen = archivo.tipoMime.startsWith("image/");
          return (
            <motion.li
              key={archivo.id}
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-superficie px-3 py-2 shadow-sm"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${esImagen ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}
              >
                {esImagen ? <HiOutlinePhoto className="h-5 w-5" /> : <HiOutlineDocumentText className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => void abrirArchivo(archivo, false)}
                  className="block max-w-full truncate text-left text-xs font-semibold text-slate-800 hover:text-zeus-tinta hover:underline"
                >
                  {archivo.nombre}
                </button>
                <p className="text-[11px] text-slate-500">
                  {formatearTamano(archivo.tamanoBytes)} · Subido el {formatearFechaHora(archivo.subidoEn)} por{" "}
                  <span className="font-semibold text-slate-600">{archivo.subidoPor}</span>
                </p>
              </div>
              <button
                type="button"
                aria-label={`Descargar ${archivo.nombre}`}
                onClick={() => void abrirArchivo(archivo, true)}
                className="rounded-md p-1.5 text-slate-400 transition hover:bg-zeus-celeste hover:text-zeus-tinta"
              >
                <HiOutlineArrowDownTray className="h-4 w-4" />
              </button>
              {alQuitar && (
                <button
                  type="button"
                  aria-label={`Quitar ${archivo.nombre}`}
                  onClick={() => alQuitar(archivo.id)}
                  className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <HiOutlineXMark className="h-4 w-4" />
                </button>
              )}
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
