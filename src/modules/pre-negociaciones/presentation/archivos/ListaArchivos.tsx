"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineArrowDownTray, HiOutlineDocumentText, HiOutlinePhoto, HiOutlineXMark } from "react-icons/hi2";
import type { ArchivoAdjuntoDto } from "@/modules/archivos/application/dto";
import { formatearFechaHora } from "@/modules/shared/domain/fechas";
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
                <a
                  href={apiPreNegociaciones.urlArchivo(archivo.id, false)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-xs font-semibold text-slate-800 hover:text-zeus-tinta hover:underline"
                >
                  {archivo.nombre}
                </a>
                <p className="text-[11px] text-slate-500">
                  {formatearTamano(archivo.tamanoBytes)} · Subido el {formatearFechaHora(archivo.subidoEn)} por{" "}
                  <span className="font-semibold text-slate-600">{archivo.subidoPor}</span>
                </p>
              </div>
              <a
                href={apiPreNegociaciones.urlArchivo(archivo.id, true)}
                aria-label={`Descargar ${archivo.nombre}`}
                className="rounded-md p-1.5 text-slate-400 transition hover:bg-zeus-celeste hover:text-zeus-tinta"
              >
                <HiOutlineArrowDownTray className="h-4 w-4" />
              </a>
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
