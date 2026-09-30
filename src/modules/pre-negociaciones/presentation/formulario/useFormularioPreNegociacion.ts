"use client";

import { useReducer } from "react";
import type { ArchivoAdjuntoDto } from "@/modules/archivos/application/dto";
import type { EstadoCotizacion, EstadoPreNegociacion, TipoCarga } from "../../domain/valores";
import {
  nuevaCotizacion,
  nuevoContacto,
  type CampoTextoCabecera,
  type ContactoFormulario,
  type CotizacionFormulario,
  type FormularioPreNegociacion,
} from "./modeloFormulario";

type Accion =
  | { tipo: "reiniciar"; formulario: FormularioPreNegociacion }
  | { tipo: "texto"; campo: CampoTextoCabecera; valor: string }
  | { tipo: "tipoCarga"; valor: TipoCarga }
  | { tipo: "pais"; valor: string }
  | { tipo: "puerto"; valor: string }
  | { tipo: "estado"; valor: EstadoPreNegociacion }
  | { tipo: "agregarCotizacion" }
  | { tipo: "quitarCotizacion"; cotizacionId: string }
  | { tipo: "proveedor"; cotizacionId: string; valor: string }
  | { tipo: "productosProveedor"; cotizacionId: string; valor: string }
  | { tipo: "estadoCotizacion"; cotizacionId: string; valor: EstadoCotizacion }
  | { tipo: "agregarContacto"; cotizacionId: string }
  | { tipo: "quitarUltimoContacto"; cotizacionId: string }
  | { tipo: "observaciones"; cotizacionId: string; contactoId: string; valor: string }
  | { tipo: "fechaEditable"; cotizacionId: string; contactoId: string; valorLocal: string }
  | { tipo: "agregarArchivo"; cotizacionId: string; contactoId: string; archivo: ArchivoAdjuntoDto }
  | { tipo: "quitarArchivo"; cotizacionId: string; contactoId: string; archivoId: string };

function actualizarCotizacion(
  estado: FormularioPreNegociacion,
  cotizacionId: string,
  cambio: (cotizacion: CotizacionFormulario) => CotizacionFormulario,
): FormularioPreNegociacion {
  return {
    ...estado,
    cotizaciones: estado.cotizaciones.map((c) => (c.id === cotizacionId ? cambio(c) : c)),
  };
}

function actualizarContacto(
  estado: FormularioPreNegociacion,
  cotizacionId: string,
  contactoId: string,
  cambio: (contacto: ContactoFormulario) => ContactoFormulario,
): FormularioPreNegociacion {
  return actualizarCotizacion(estado, cotizacionId, (cotizacion) => ({
    ...cotizacion,
    contactos: cotizacion.contactos.map((c) => (c.id === contactoId ? cambio(c) : c)),
  }));
}

function reductor(estado: FormularioPreNegociacion, accion: Accion): FormularioPreNegociacion {
  switch (accion.tipo) {
    case "reiniciar":
      return accion.formulario;
    case "texto":
      return { ...estado, [accion.campo]: accion.valor };
    case "tipoCarga":
      return { ...estado, tipoCarga: accion.valor };
    case "pais":
      return accion.valor === estado.pais ? estado : { ...estado, pais: accion.valor, puerto: "" };
    case "puerto":
      return { ...estado, puerto: accion.valor };
    case "estado":
      return { ...estado, estado: accion.valor };
    case "agregarCotizacion":
      return { ...estado, cotizaciones: [...estado.cotizaciones, nuevaCotizacion()] };
    case "quitarCotizacion":
      return { ...estado, cotizaciones: estado.cotizaciones.filter((c) => c.id !== accion.cotizacionId) };
    case "proveedor":
      return actualizarCotizacion(estado, accion.cotizacionId, (c) => ({ ...c, proveedor: accion.valor }));
    case "productosProveedor":
      return actualizarCotizacion(estado, accion.cotizacionId, (c) => ({ ...c, productos: accion.valor }));
    case "estadoCotizacion":
      return actualizarCotizacion(estado, accion.cotizacionId, (c) => ({ ...c, estado: accion.valor }));
    case "agregarContacto":
      return actualizarCotizacion(estado, accion.cotizacionId, (c) => ({
        ...c,
        contactos: [...c.contactos, nuevoContacto(c.contactos.length + 1)],
      }));
    case "quitarUltimoContacto":
      return actualizarCotizacion(estado, accion.cotizacionId, (c) => ({
        ...c,
        contactos: c.contactos.length > 1 ? c.contactos.slice(0, -1) : c.contactos,
      }));
    case "observaciones":
      return actualizarContacto(estado, accion.cotizacionId, accion.contactoId, (c) => ({
        ...c,
        observaciones: accion.valor,
      }));
    case "fechaEditable":
      return actualizarContacto(estado, accion.cotizacionId, accion.contactoId, (c) => ({
        ...c,
        fecha: { tipo: "editable", valorLocal: accion.valorLocal },
      }));
    case "agregarArchivo":
      return actualizarContacto(estado, accion.cotizacionId, accion.contactoId, (c) => ({
        ...c,
        archivos: [...c.archivos, accion.archivo],
      }));
    case "quitarArchivo":
      return actualizarContacto(estado, accion.cotizacionId, accion.contactoId, (c) => ({
        ...c,
        archivos: c.archivos.filter((a) => a.id !== accion.archivoId),
      }));
  }
}

export function useFormularioPreNegociacion(inicial: () => FormularioPreNegociacion) {
  const [formulario, despachar] = useReducer(reductor, undefined, inicial);
  return { formulario, despachar };
}

export type DespacharFormulario = ReturnType<typeof useFormularioPreNegociacion>["despachar"];
