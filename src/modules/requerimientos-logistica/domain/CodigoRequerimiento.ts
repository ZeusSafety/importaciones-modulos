import { ErrorValidacion } from "@/modules/shared/domain/errores";

export class CodigoRequerimiento {
  static readonly PREFIJO = "REG_LOG";

  private constructor(readonly secuencia: number) {}

  static desdeSecuencia(secuencia: number): CodigoRequerimiento {
    if (!Number.isInteger(secuencia) || secuencia < 1) {
      throw new ErrorValidacion("La secuencia del requerimiento debe ser un entero positivo.");
    }
    return new CodigoRequerimiento(secuencia);
  }

  static siguienteA(secuenciasExistentes: number[]): CodigoRequerimiento {
    return CodigoRequerimiento.desdeSecuencia(Math.max(0, ...secuenciasExistentes) + 1);
  }

  get valor(): string {
    return `${CodigoRequerimiento.PREFIJO} ${String(this.secuencia).padStart(2, "0")}`;
  }
}
