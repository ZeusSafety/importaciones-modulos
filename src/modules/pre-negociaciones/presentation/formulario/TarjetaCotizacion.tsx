"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineBuildingStorefront, HiOutlineMinus, HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import { Boton } from "@/modules/shared/presentation/ui/Boton";
import { Campo, EntradaTexto } from "@/modules/shared/presentation/ui/Formulario";
import { Selector } from "@/modules/shared/presentation/ui/Selector";
import { ESTADOS_COTIZACION } from "../../domain/valores";
import { TONO_ESTADO_COTIZACION } from "../tonosEstado";
import { CampoProductosProveedor } from "./CampoProductosProveedor";
import type { CotizacionFormulario } from "./modeloFormulario";
import { TarjetaContacto } from "./TarjetaContacto";
import type { DespacharFormulario } from "./useFormularioPreNegociacion";

interface PropsTarjetaCotizacion {
  cotizacion: CotizacionFormulario;
  numero: number;
  registradoPor: string;
  despachar: DespacharFormulario;
}

export function TarjetaCotizacion({ cotizacion, numero, registradoPor, despachar }: PropsTarjetaCotizacion) {
  const cotizacionId = cotizacion.id;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-2xl border border-zeus-azul/15 bg-gradient-to-b from-zeus-celeste/50 to-superficie shadow-sm"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zeus-azul/10 bg-superficie/70 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zeus-azul text-white shadow-md shadow-zeus-azul/25">
            <HiOutlineBuildingStorefront className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-sm font-bold text-slate-900">Negociación {numero}</p>
            <p className="text-[11px] text-slate-500">{cotizacion.contactos.length} contacto(s) registrados</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-44">
            <Selector
              id={`estado-${cotizacionId}`}
              valor={cotizacion.estado}
              opciones={ESTADOS_COTIZACION}
              tonos={TONO_ESTADO_COTIZACION}
              marcador="ESTADO: POR DEFINIR"
              alCambiar={(valor) => despachar({ tipo: "estadoCotizacion", cotizacionId, valor })}
            />
          </div>
          <button
            type="button"
            aria-label={`Quitar negociación ${numero}`}
            onClick={() => despachar({ tipo: "quitarCotizacion", cotizacionId })}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <HiOutlineTrash className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="space-y-4 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Campo etiqueta="Proveedor">
            {(id) => (
              <EntradaTexto
                id={id}
                mayusculas
                valor={cotizacion.proveedor}
                alCambiar={(valor) => despachar({ tipo: "proveedor", cotizacionId, valor })}
                placeholder="NOMBRE DEL PROVEEDOR"
              />
            )}
          </Campo>
          <CampoProductosProveedor
            valor={cotizacion.productos}
            alCambiar={(valor) => despachar({ tipo: "productosProveedor", cotizacionId, valor })}
          />
        </div>

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {cotizacion.contactos.map((contacto, indice) => (
              <TarjetaContacto
                key={contacto.id}
                cotizacionId={cotizacionId}
                contacto={contacto}
                orden={indice + 1}
                registradoPor={registradoPor}
                despachar={despachar}
              />
            ))}
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          {cotizacion.contactos.length > 1 && (
            <Boton
              variante="peligro"
              tamano="chico"
              icono={<HiOutlineMinus />}
              onClick={() => despachar({ tipo: "quitarUltimoContacto", cotizacionId })}
            >
              Quitar último contacto
            </Boton>
          )}
          <Boton
            variante="secundario"
            tamano="chico"
            icono={<HiOutlinePlus />}
            onClick={() => despachar({ tipo: "agregarContacto", cotizacionId })}
          >
            Añadir contacto
          </Boton>
        </div>
      </div>
    </motion.article>
  );
}
