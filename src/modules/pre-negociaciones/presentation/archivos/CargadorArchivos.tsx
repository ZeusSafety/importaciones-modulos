"use client";

import { useRef, useState, type DragEvent } from "react";
import { HiOutlineCloudArrowUp } from "react-icons/hi2";
import type { ArchivoAdjuntoDto } from "@/modules/archivos/application/dto";
import { ACEPTAR_TIPOS_PERMITIDOS } from "@/modules/archivos/domain/ArchivoAdjunto";
import { mensajeDeError } from "@/modules/shared/infrastructure/http/clienteHttp";
import { useNotificaciones } from "@/modules/shared/presentation/ui/Notificaciones";
import { apiPreNegociaciones } from "../apiPreNegociaciones";

interface PropsCargadorArchivos {
  /** Nombre de quien sube; si está vacío la subida se bloquea. */
  subidoPor: string;
  alSubir: (archivo: ArchivoAdjuntoDto) => void;
}

export function CargadorArchivos({ subidoPor, alSubir }: PropsCargadorArchivos) {
  const notificar = useNotificaciones();
  const entrada = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);

  const sinResponsable = subidoPor.trim() === "";

  const subir = async (archivos: FileList) => {
    if (sinResponsable) {
      notificar({
        tipo: "error",
        titulo: "Indique quién registra",
        mensaje: "Complete el campo REGISTRADO POR antes de subir archivos.",
      });
      return;
    }
    await Promise.all(
      Array.from(archivos).map(async (archivo) => {
        setSubiendo((n) => n + 1);
        try {
          alSubir(await apiPreNegociaciones.subirArchivo(archivo, subidoPor));
        } catch (error) {
          notificar({ tipo: "error", titulo: `No se pudo subir ${archivo.name}`, mensaje: mensajeDeError(error) });
        } finally {
          setSubiendo((n) => n - 1);
        }
      }),
    );
  };

  const alSoltar = (evento: DragEvent<HTMLButtonElement>) => {
    evento.preventDefault();
    setArrastrando(false);
    void subir(evento.dataTransfer.files);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => entrada.current?.click()}
        onDragOver={(evento) => {
          evento.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={alSoltar}
        className={`group flex min-h-[122px] w-full flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed px-4 py-4 text-center transition ${
          arrastrando
            ? "border-zeus-azul bg-zeus-celeste"
            : "border-slate-300 bg-slate-50/60 hover:border-zeus-azul/50 hover:bg-zeus-celeste/40"
        }`}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-superficie text-zeus-tinta shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5">
          {subiendo > 0 ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-zeus-azul border-t-transparent" />
          ) : (
            <HiOutlineCloudArrowUp className="h-6 w-6" />
          )}
        </span>
        <span>
          <span className="block text-xs font-semibold text-slate-700">
            {subiendo > 0 ? `Subiendo ${subiendo} archivo(s)…` : "Subir archivos o imágenes"}
          </span>
          <span className="block text-[11px] text-slate-500">Arrastre aquí o haga clic · Imágenes, PDF, Word o Excel (máx. 15 MB)</span>
        </span>
      </button>
      <input
        ref={entrada}
        type="file"
        multiple
        hidden
        accept={ACEPTAR_TIPOS_PERMITIDOS}
        onChange={(evento) => {
          const archivos = evento.target.files;
          if (archivos && archivos.length > 0) void subir(archivos);
          evento.target.value = "";
        }}
      />
    </>
  );
}
