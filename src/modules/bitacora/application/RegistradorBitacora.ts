import type { GeneradorId, Reloj } from "@/modules/shared/domain/puertos";
import type { NuevoEventoBitacora } from "../domain/EventoBitacora";
import type { RepositorioBitacora } from "../domain/RepositorioBitacora";

/** Puerto que usan los demás módulos para dejar constancia de sus operaciones. */
export class RegistradorBitacora {
  constructor(
    private readonly repositorio: RepositorioBitacora,
    private readonly reloj: Reloj,
    private readonly generadorId: GeneradorId,
  ) {}

  async registrar(evento: NuevoEventoBitacora): Promise<void> {
    await this.repositorio.agregar({
      ...evento,
      id: this.generadorId.generar(),
      fecha: this.reloj.ahora().toISOString(),
    });
  }
}
