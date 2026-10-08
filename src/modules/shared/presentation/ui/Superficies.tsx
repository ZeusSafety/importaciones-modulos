import type { ReactNode } from "react";

interface PropsEncabezadoPagina {
  icono: ReactNode;
  titulo: string;
  descripcion: string;
  acciones?: ReactNode;
}

export function EncabezadoPagina({ icono, titulo, descripcion, acciones }: PropsEncabezadoPagina) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-superficie p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3.5">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-zeus-azul text-xl text-white shadow-md shadow-zeus-azul/25">
          {icono}
        </span>
        <div>
          <h1 className="font-display text-xl font-bold text-slate-900">{titulo}</h1>
          <p className="text-sm text-slate-500">{descripcion}</p>
        </div>
      </div>
      {acciones && <div className="flex shrink-0 flex-wrap gap-2">{acciones}</div>}
    </div>
  );
}

interface PropsTarjetaSeccion {
  icono: ReactNode;
  titulo: string;
  subtitulo: string;
  acciones?: ReactNode;
  /** Ocupa todo el alto de la celda de la grilla, para igualar tarjetas vecinas. */
  altoCompleto?: boolean;
  children: ReactNode;
}

export function TarjetaSeccion({ icono, titulo, subtitulo, acciones, altoCompleto = false, children }: PropsTarjetaSeccion) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-superficie shadow-sm ${altoCompleto ? "flex h-full flex-col" : ""}`}>
      <header className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zeus-celeste text-base text-zeus-tinta">
            {icono}
          </span>
          <div>
            <h2 className="font-display text-[15px] font-semibold text-slate-900">{titulo}</h2>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{subtitulo}</p>
          </div>
        </div>
        {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
      </header>
      <div className={`p-5 ${altoCompleto ? "flex flex-1 flex-col" : ""}`}>{children}</div>
    </section>
  );
}

/** Marco redondeado para tablas dentro de una tarjeta, con la paginación incluida al pie. */
export function ContenedorTabla({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-xl border border-slate-200 bg-superficie shadow-sm">{children}</div>;
}

export function EstadoVacio({ icono, titulo, descripcion }: { icono: ReactNode; titulo: string; descripcion: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <span className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-zeus-celeste text-2xl text-zeus-tinta">
        {icono}
      </span>
      <p className="font-display text-sm font-semibold text-slate-800">{titulo}</p>
      <p className="max-w-sm text-xs text-slate-500">{descripcion}</p>
    </div>
  );
}

export function Cargando({ texto }: { texto: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-zeus-azul border-t-transparent" />
      {texto}
    </div>
  );
}
