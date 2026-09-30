"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import { HiOutlineChatBubbleLeftRight, HiOutlineClock, HiOutlineLockClosed } from "react-icons/hi2";
import { formatearFechaHora } from "@/modules/shared/domain/fechas";
import { AreaTextoMayusculas, Campo } from "@/modules/shared/presentation/ui/Formulario";
import { SelectorFechaHora } from "@/modules/shared/presentation/ui/SelectorFechaHora";
import { etiquetaContacto } from "../../domain/reglasContacto";
import { CargadorArchivos } from "../archivos/CargadorArchivos";
import { ListaArchivos } from "../archivos/ListaArchivos";
import type { ContactoFormulario } from "./modeloFormulario";
import type { DespacharFormulario } from "./useFormularioPreNegociacion";

interface PropsTarjetaContacto {
  cotizacionId: string;
  contacto: ContactoFormulario;
  orden: number;
  registradoPor: string;
  despachar: DespacharFormulario;
}

function FechaContacto({ contacto, alCambiar }: { contacto: ContactoFormulario; alCambiar: (valorLocal: string) => void }) {
  const id = useId();
  if (contacto.fecha.tipo === "editable") {
    return <SelectorFechaHora id={id} valor={contacto.fecha.valorLocal} alCambiar={alCambiar} />;
  }
  return (
    <span className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
      <HiOutlineLockClosed className="h-4 w-4 text-slate-400" />
      {contacto.fecha.registrada === null ? "Se registra automáticamente al guardar" : formatearFechaHora(contacto.fecha.registrada)}
    </span>
  );
}

export function TarjetaContacto({ cotizacionId, contacto, orden, registradoPor, despachar }: PropsTarjetaContacto) {
  const referencia = { cotizacionId, contactoId: contacto.id };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div className="rounded-xl border border-slate-200 bg-superficie p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zeus-azul text-xs font-bold text-white">{orden}</span>
            <div>
              <p className="font-display text-[11px] font-semibold uppercase tracking-wide text-slate-500">Contacto</p>
              <p className="font-display text-sm font-bold text-zeus-tinta">{etiquetaContacto(orden)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HiOutlineClock className="h-4 w-4 text-slate-400" />
            <FechaContacto
              contacto={contacto}
              alCambiar={(valorLocal) => despachar({ tipo: "fechaEditable", ...referencia, valorLocal })}
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <p className="font-display text-[11px] font-semibold uppercase tracking-wide text-slate-600">Archivos del contacto</p>
            <CargadorArchivos
              subidoPor={registradoPor}
              alSubir={(archivo) => despachar({ tipo: "agregarArchivo", ...referencia, archivo })}
            />
            <ListaArchivos
              archivos={contacto.archivos}
              alQuitar={(archivoId) => despachar({ tipo: "quitarArchivo", ...referencia, archivoId })}
            />
          </div>
          <Campo etiqueta="Observaciones">
            {(id) => (
              <AreaTextoMayusculas
                id={id}
                filas={5}
                redimensionable={false}
                valor={contacto.observaciones}
                alCambiar={(valor) => despachar({ tipo: "observaciones", ...referencia, valor })}
                placeholder="DETALLE DE LA COMUNICACIÓN CON EL PROVEEDOR"
              />
            )}
          </Campo>
        </div>
        <p className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
          <HiOutlineChatBubbleLeftRight className="h-3 w-3" />
          {contacto.fecha.tipo === "editable"
            ? "La fecha y hora de este contacto puede modificarse."
            : "La fecha y hora de este contacto la asigna el sistema."}
        </p>
      </div>
    </motion.div>
  );
}
