import type { RegistradorBitacora } from "@/modules/bitacora/application/RegistradorBitacora";
import type { Reloj } from "@/modules/shared/domain/puertos";
import type { RepositorioRequerimientos } from "../domain/RepositorioRequerimientos";
import { esquemaAprobacionRequerimiento, type RequerimientoLogisticaDto } from "./dto";

export class AprobarRequerimientoLogistica {
  constructor(
    private readonly repositorio: RepositorioRequerimientos,
    private readonly bitacora: RegistradorBitacora,
    private readonly reloj: Reloj,
  ) {}

  async ejecutar(id: string, entrada: unknown): Promise<RequerimientoLogisticaDto> {
    const { aprobadoPor, firma } = esquemaAprobacionRequerimiento.parse(entrada);
    const fechaAprobacion = this.reloj.ahora().toISOString();
    const requerimiento = await this.repositorio.modificar(id, (actual) => actual.aprobar(aprobadoPor, firma, fechaAprobacion));

    await this.bitacora.registrar({
      modulo: "REQUERIMIENTOS LOGISTICA",
      accion: "APROBACION",
      referencia: requerimiento.codigo,
      descripcion: `Se aprobó el requerimiento ${requerimiento.codigo}.`,
      usuario: requerimiento.aprobadoPor,
    });

    return requerimiento.aPrimitivos();
  }
}
