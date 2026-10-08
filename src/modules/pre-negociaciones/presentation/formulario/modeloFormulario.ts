import type { ArchivoAdjuntoDto } from "@/modules/archivos/application/dto";
import { fechaHoraLocalAIso, isoAFechaHoraLocal } from "@/modules/shared/domain/fechas";
import type { GuardarPreNegociacionDto, PreNegociacionDto } from "../../application/dto";
import { fechaContactoEditable } from "../../domain/reglasContacto";
import {
  ESTADO_INICIAL_PRE_NEGOCIACION,
  type EstadoCotizacion,
  type EstadoPreNegociacion,
  type TipoCarga,
} from "../../domain/valores";

export type FechaContactoFormulario =
  | { readonly tipo: "automatica"; readonly registrada: string | null }
  | { readonly tipo: "editable"; readonly valorLocal: string };

export interface ContactoFormulario {
  readonly id: string;
  readonly fecha: FechaContactoFormulario;
  readonly observaciones: string;
  readonly archivos: readonly ArchivoAdjuntoDto[];
}

export interface CotizacionFormulario {
  readonly id: string;
  readonly proveedor: string;
  readonly productos: string;
  readonly estado: EstadoCotizacion | "";
  readonly contactos: readonly ContactoFormulario[];
}

export interface FormularioPreNegociacion {
  readonly tipoCarga: TipoCarga | "";
  readonly productos: string;
  readonly pais: string;
  readonly puerto: string;
  readonly registradoPor: string;
  readonly estado: EstadoPreNegociacion;
  readonly cotizaciones: readonly CotizacionFormulario[];
}

export type CampoTextoCabecera = "productos" | "registradoPor";

export function formularioVacio(): FormularioPreNegociacion {
  return {
    tipoCarga: "",
    productos: "",
    pais: "",
    puerto: "",
    registradoPor: "",
    estado: ESTADO_INICIAL_PRE_NEGOCIACION,
    cotizaciones: [],
  };
}

export function formularioDesde(dto: PreNegociacionDto): FormularioPreNegociacion {
  return {
    tipoCarga: dto.tipoCarga,
    productos: dto.productos,
    pais: dto.pais,
    puerto: dto.puerto,
    registradoPor: dto.registradoPor,
    estado: dto.estado,
    cotizaciones: dto.cotizaciones.map((cotizacion) => ({
      id: cotizacion.id,
      proveedor: cotizacion.proveedor,
      productos: cotizacion.productos,
      estado: cotizacion.estado === null ? "" : cotizacion.estado,
      contactos: cotizacion.contactos.map((contacto) => ({
        id: contacto.id,
        observaciones: contacto.observaciones,
        archivos: contacto.archivos,
        fecha: fechaContactoEditable(contacto.orden)
          ? { tipo: "editable", valorLocal: isoAFechaHoraLocal(contacto.fechaHora) }
          : { tipo: "automatica", registrada: contacto.fechaHora },
      })),
    })),
  };
}

/**
 * Copia para registrar una pre-negociación parecida (p. ej. el mismo producto del mes anterior):
 * conserva los datos generales y los proveedores, pero el estado, los resultados, los contactos
 * y los archivos empiezan de cero porque pertenecen a la negociación original.
 */
export function formularioDuplicado(dto: PreNegociacionDto): FormularioPreNegociacion {
  return {
    tipoCarga: dto.tipoCarga,
    productos: dto.productos,
    pais: dto.pais,
    puerto: dto.puerto,
    registradoPor: dto.registradoPor,
    estado: ESTADO_INICIAL_PRE_NEGOCIACION,
    cotizaciones: dto.cotizaciones.map((cotizacion) => ({
      ...nuevaCotizacion(),
      proveedor: cotizacion.proveedor,
      productos: cotizacion.productos,
    })),
  };
}

export function nuevoContacto(orden: number): ContactoFormulario {
  return {
    id: crypto.randomUUID(),
    observaciones: "",
    archivos: [],
    fecha: fechaContactoEditable(orden)
      ? { tipo: "editable", valorLocal: isoAFechaHoraLocal(new Date().toISOString()) }
      : { tipo: "automatica", registrada: null },
  };
}

export function nuevaCotizacion(): CotizacionFormulario {
  return { id: crypto.randomUUID(), proveedor: "", productos: "", estado: "", contactos: [nuevoContacto(1)] };
}

type ResultadoConversion =
  | { readonly valido: true; readonly datos: GuardarPreNegociacionDto }
  | { readonly valido: false; readonly errores: string[] };

export function convertirAGuardar(formulario: FormularioPreNegociacion): ResultadoConversion {
  const errores: string[] = [];
  if (formulario.tipoCarga === "") errores.push("Seleccione el TIPO DE CARGA.");
  if (formulario.productos.trim() === "") errores.push("Ingrese los PRODUCTOS.");
  if (formulario.pais === "") errores.push("Seleccione el PAÍS.");
  if (formulario.puerto.trim() === "") errores.push("Indique el PUERTO.");
  if (formulario.registradoPor.trim() === "") errores.push("Ingrese REGISTRADO POR.");
  formulario.cotizaciones.forEach((cotizacion, indice) => {
    if (cotizacion.proveedor.trim() === "") errores.push(`Ingrese el PROVEEDOR de la negociación ${indice + 1}.`);
    if (cotizacion.productos.trim() === "") errores.push(`Ingrese los PRODUCTOS de la negociación ${indice + 1}.`);
    cotizacion.contactos.forEach((contacto, indiceContacto) => {
      if (contacto.fecha.tipo === "editable" && contacto.fecha.valorLocal === "") {
        errores.push(`Ingrese la fecha del contacto ${indiceContacto + 1} de la cotización ${indice + 1}.`);
      }
    });
  });
  if (errores.length > 0 || formulario.tipoCarga === "") return { valido: false, errores };

  return {
    valido: true,
    datos: {
      tipoCarga: formulario.tipoCarga,
      productos: formulario.productos.trim(),
      pais: formulario.pais,
      puerto: formulario.puerto,
      registradoPor: formulario.registradoPor.trim(),
      estado: formulario.estado,
      cotizaciones: formulario.cotizaciones.map((cotizacion) => ({
        id: cotizacion.id,
        proveedor: cotizacion.proveedor.trim(),
        productos: cotizacion.productos.trim(),
        estado: cotizacion.estado === "" ? null : cotizacion.estado,
        contactos: cotizacion.contactos.map((contacto) => ({
          id: contacto.id,
          observaciones: contacto.observaciones.trim(),
          archivoIds: contacto.archivos.map((archivo) => archivo.id),
          ...(contacto.fecha.tipo === "editable" && { fechaHora: fechaHoraLocalAIso(contacto.fecha.valorLocal) }),
        })),
      })),
    },
  };
}
