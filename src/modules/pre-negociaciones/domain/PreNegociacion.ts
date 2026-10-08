import { ErrorValidacion } from "@/modules/shared/domain/errores";
import { fechaIsoValida } from "@/modules/shared/domain/fechas";
import { textoMayusculasOpcional, textoMayusculasRequerido } from "@/modules/shared/domain/texto";
import { validarOrigen } from "./origenesImportacion";
import { etiquetaContacto, fechaContactoEditable } from "./reglasContacto";
import type { EstadoCotizacion, EstadoPreNegociacion, TipoCarga } from "./valores";

export interface ArchivoContacto {
  readonly id: string;
  readonly nombre: string;
  readonly tipoMime: string;
  readonly tamanoBytes: number;
  readonly subidoEn: string;
  readonly subidoPor: string;
}

export interface ContactoPrimitivos {
  readonly id: string;
  readonly orden: number;
  readonly fechaHora: string;
  readonly observaciones: string;
  readonly archivos: ArchivoContacto[];
}

export interface CotizacionPrimitivos {
  readonly id: string;
  readonly proveedor: string;
  /** Productos que se negocian con este proveedor. */
  readonly productos: string;
  readonly estado: EstadoCotizacion | null;
  readonly contactos: ContactoPrimitivos[];
}

export interface PreNegociacionPrimitivos {
  readonly id: string;
  readonly numero: number;
  readonly tipoCarga: TipoCarga;
  readonly productos: string;
  /** País del catálogo o uno ingresado libremente desde «OTROS». */
  readonly pais: string;
  readonly puerto: string;
  readonly registradoPor: string;
  readonly estado: EstadoPreNegociacion;
  readonly cotizaciones: CotizacionPrimitivos[];
  readonly creadoEn: string;
  readonly actualizadoEn: string;
}

export interface DatosContacto {
  readonly id: string;
  /** Solo se informa en los contactos cuya fecha es editable. */
  readonly fechaHora?: string;
  readonly observaciones: string;
  readonly archivos: ArchivoContacto[];
}

export interface DatosCotizacion {
  readonly id: string;
  readonly proveedor: string;
  readonly productos: string;
  readonly estado: EstadoCotizacion | null;
  readonly contactos: DatosContacto[];
}

export interface DatosPreNegociacion {
  readonly tipoCarga: TipoCarga;
  readonly productos: string;
  readonly pais: string;
  readonly puerto: string;
  readonly registradoPor: string;
  readonly estado: EstadoPreNegociacion;
  readonly cotizaciones: DatosCotizacion[];
}

function validarIdsUnicos(ids: string[], descripcion: string) {
  if (new Set(ids).size !== ids.length) {
    throw new ErrorValidacion(`Hay ${descripcion} con identificadores duplicados.`);
  }
}

function resolverFechaContacto(
  orden: number,
  dato: DatosContacto,
  existente: ContactoPrimitivos | undefined,
  ahora: string,
): string {
  const etiqueta = etiquetaContacto(orden);
  if (fechaContactoEditable(orden)) {
    if (dato.fechaHora === undefined) {
      throw new ErrorValidacion(`Ingrese la fecha y hora del ${etiqueta}.`);
    }
    return fechaIsoValida(`fecha del ${etiqueta}`, dato.fechaHora);
  }
  if (dato.fechaHora !== undefined) {
    throw new ErrorValidacion(`La fecha y hora del ${etiqueta} se registra automáticamente y no es modificable.`);
  }
  return existente ? existente.fechaHora : ahora;
}

function construirCotizaciones(
  datos: DatosCotizacion[],
  anteriores: CotizacionPrimitivos[],
  ahora: string,
): CotizacionPrimitivos[] {
  validarIdsUnicos(
    datos.map((c) => c.id),
    "cotizaciones",
  );
  validarIdsUnicos(
    datos.flatMap((c) => c.contactos.map((contacto) => contacto.id)),
    "contactos",
  );

  const contactosAnteriores = new Map(
    anteriores.flatMap((c) => c.contactos).map((contacto) => [contacto.id, contacto]),
  );

  return datos.map((cotizacion, indiceCotizacion) => {
    if (cotizacion.contactos.length === 0) {
      throw new ErrorValidacion(`La cotización ${indiceCotizacion + 1} debe tener al menos un contacto.`);
    }
    return {
      id: cotizacion.id,
      proveedor: textoMayusculasRequerido(`PROVEEDOR de la cotización ${indiceCotizacion + 1}`, cotizacion.proveedor),
      productos: textoMayusculasRequerido(`PRODUCTOS de la cotización ${indiceCotizacion + 1}`, cotizacion.productos),
      estado: cotizacion.estado,
      contactos: cotizacion.contactos.map((contacto, indiceContacto) => {
        const orden = indiceContacto + 1;
        return {
          id: contacto.id,
          orden,
          fechaHora: resolverFechaContacto(orden, contacto, contactosAnteriores.get(contacto.id), ahora),
          observaciones: textoMayusculasOpcional(contacto.observaciones),
          archivos: contacto.archivos,
        };
      }),
    };
  });
}

function normalizarCabecera(datos: DatosPreNegociacion) {
  return {
    tipoCarga: datos.tipoCarga,
    productos: textoMayusculasRequerido("PRODUCTOS", datos.productos),
    ...validarOrigen(datos.pais, datos.puerto),
    registradoPor: textoMayusculasRequerido("REGISTRADO POR", datos.registradoPor),
    estado: datos.estado,
  };
}

export class PreNegociacion {
  private constructor(private readonly estado: PreNegociacionPrimitivos) {}

  static registrar(
    datos: DatosPreNegociacion,
    identidad: { id: string; numero: number; ahora: string },
  ): PreNegociacion {
    if (!Number.isInteger(identidad.numero) || identidad.numero < 1) {
      throw new ErrorValidacion("El número de pre-negociación debe ser un entero positivo.");
    }
    return new PreNegociacion({
      id: identidad.id,
      numero: identidad.numero,
      ...normalizarCabecera(datos),
      cotizaciones: construirCotizaciones(datos.cotizaciones, [], identidad.ahora),
      creadoEn: identidad.ahora,
      actualizadoEn: identidad.ahora,
    });
  }

  static desdePrimitivos(primitivos: PreNegociacionPrimitivos): PreNegociacion {
    return new PreNegociacion({
      ...primitivos,
      cotizaciones: primitivos.cotizaciones.map((cotizacion) => ({
        ...cotizacion,
        productos: typeof cotizacion.productos === "string" ? cotizacion.productos : "",
      })),
    });
  }

  static siguienteNumero(numerosExistentes: number[]): number {
    return Math.max(0, ...numerosExistentes) + 1;
  }

  actualizar(datos: DatosPreNegociacion, ahora: string): PreNegociacion {
    return new PreNegociacion({
      ...this.estado,
      ...normalizarCabecera(datos),
      cotizaciones: construirCotizaciones(datos.cotizaciones, this.estado.cotizaciones, ahora),
      actualizadoEn: ahora,
    });
  }

  cambiarEstado(estado: EstadoPreNegociacion, ahora: string): PreNegociacion {
    return new PreNegociacion({ ...this.estado, estado, actualizadoEn: ahora });
  }

  get id(): string {
    return this.estado.id;
  }

  get estadoActual(): EstadoPreNegociacion {
    return this.estado.estado;
  }

  get numero(): number {
    return this.estado.numero;
  }

  get registradoPor(): string {
    return this.estado.registradoPor;
  }

  aPrimitivos(): PreNegociacionPrimitivos {
    return this.estado;
  }
}
