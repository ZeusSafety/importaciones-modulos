import { ErrorValidacion } from "@/modules/shared/domain/errores";
import { validarFirmaDigital } from "@/modules/shared/domain/firmaDigital";
import { textoMayusculasOpcional, textoMayusculasRequerido } from "@/modules/shared/domain/texto";
import { CodigoRequerimiento } from "./CodigoRequerimiento";
import type { Area, Disponibilidad, Mes } from "./valores";

export interface DetalleRequerimiento {
  readonly item: number;
  readonly codigo: string;
  readonly producto: string;
  readonly stockActual: number;
  readonly stockMinimo: number;
  readonly disponible: Disponibilidad;
}

export interface AprobacionRequerimiento {
  readonly aprobadoPor: string;
  readonly fechaAprobacion: string;
  readonly firma: string | null;
}

export interface RequerimientoLogisticaPrimitivos {
  readonly id: string;
  readonly secuencia: number;
  readonly codigo: string;
  readonly mes: Mes;
  readonly area: string;
  readonly responsable: string;
  readonly revisadoPor: string;
  /** Firmas digitales opcionales (data URL PNG). */
  readonly firmaResponsable: string | null;
  readonly firmaRevisor: string | null;
  readonly observaciones: string;
  readonly detalles: DetalleRequerimiento[];
  readonly fechaRegistro: string;
  /** `null` mientras el requerimiento está pendiente de aprobación. */
  readonly aprobacion: AprobacionRequerimiento | null;
}

export interface DatosRequerimiento {
  readonly mes: Mes;
  readonly area: Area;
  readonly responsable: string;
  readonly revisadoPor: string;
  readonly firmaResponsable: string | null;
  readonly firmaRevisor: string | null;
  readonly observaciones: string;
  readonly detalles: Omit<DetalleRequerimiento, "item">[];
}

export class RequerimientoLogistica {
  private constructor(private readonly estado: RequerimientoLogisticaPrimitivos) {}

  static registrar(
    datos: DatosRequerimiento,
    identidad: { id: string; secuencia: number; fechaRegistro: string },
  ): RequerimientoLogistica {
    const codigo = CodigoRequerimiento.desdeSecuencia(identidad.secuencia);
    return new RequerimientoLogistica({
      id: identidad.id,
      secuencia: codigo.secuencia,
      codigo: codigo.valor,
      fechaRegistro: identidad.fechaRegistro,
      aprobacion: null,
      ...RequerimientoLogistica.normalizarDatos(datos),
    });
  }

  static desdePrimitivos(primitivos: RequerimientoLogisticaPrimitivos): RequerimientoLogistica {
    return new RequerimientoLogistica(primitivos);
  }

  /** Aplica las reglas del requerimiento sin asignarle identidad; lo usa también la vista previa del PDF. */
  static normalizarDatos(datos: DatosRequerimiento): Omit<
    RequerimientoLogisticaPrimitivos,
    "id" | "secuencia" | "codigo" | "fechaRegistro" | "aprobacion"
  > {
    if (datos.detalles.length === 0) {
      throw new ErrorValidacion("El requerimiento debe tener al menos un producto.");
    }
    const codigos = datos.detalles.map((detalle) => detalle.codigo);
    if (new Set(codigos).size !== codigos.length) {
      throw new ErrorValidacion("Un mismo producto no puede agregarse dos veces al requerimiento.");
    }
    return {
      mes: datos.mes,
      area: datos.area,
      responsable: textoMayusculasRequerido("RESPONSABLE", datos.responsable),
      revisadoPor: textoMayusculasRequerido("REVISADO POR", datos.revisadoPor),
      firmaResponsable: validarFirmaDigital("ELABORADO POR", datos.firmaResponsable),
      firmaRevisor: validarFirmaDigital("REVISADO POR", datos.firmaRevisor),
      observaciones: textoMayusculasOpcional(datos.observaciones),
      detalles: datos.detalles.map((detalle, indice) => ({
        item: indice + 1,
        codigo: textoMayusculasRequerido("CÓDIGO", detalle.codigo),
        producto: textoMayusculasRequerido("PRODUCTO", detalle.producto),
        stockActual: detalle.stockActual,
        stockMinimo: detalle.stockMinimo,
        disponible: detalle.disponible,
      })),
    };
  }

  get id(): string {
    return this.estado.id;
  }

  get codigo(): string {
    return this.estado.codigo;
  }

  get secuencia(): number {
    return this.estado.secuencia;
  }

  get responsable(): string {
    return this.estado.responsable;
  }

  get estaAprobado(): boolean {
    return this.estado.aprobacion !== null;
  }

  get aprobadoPor(): string {
    if (this.estado.aprobacion === null) {
      throw new ErrorValidacion(`El requerimiento ${this.codigo} aún no ha sido aprobado.`);
    }
    return this.estado.aprobacion.aprobadoPor;
  }

  aprobar(aprobadoPor: string, firma: string | null, fechaAprobacion: string): RequerimientoLogistica {
    if (this.estaAprobado) {
      throw new ErrorValidacion(`El requerimiento ${this.codigo} ya fue aprobado.`);
    }
    return new RequerimientoLogistica({
      ...this.estado,
      aprobacion: {
        aprobadoPor: textoMayusculasRequerido("APROBADO POR", aprobadoPor),
        fechaAprobacion,
        firma: validarFirmaDigital("APROBADO POR", firma),
      },
    });
  }

  aPrimitivos(): RequerimientoLogisticaPrimitivos {
    return this.estado;
  }
}
