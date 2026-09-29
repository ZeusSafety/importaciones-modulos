import type { RegistradorBitacora } from "@/modules/bitacora/application/RegistradorBitacora";
import type { RepositorioProductos } from "@/modules/catalogo-productos/domain/RepositorioProductos";
import { ErrorValidacion } from "@/modules/shared/domain/errores";
import type { GeneradorId, Reloj } from "@/modules/shared/domain/puertos";
import { RequerimientoLogistica } from "../domain/RequerimientoLogistica";
import type { RepositorioRequerimientos } from "../domain/RepositorioRequerimientos";
import {
  esquemaRegistroRequerimiento,
  type RequerimientoLogisticaDto,
} from "./dto";

export class RegistrarRequerimientoLogistica {
  constructor(
    private readonly repositorio: RepositorioRequerimientos,
    private readonly productos: RepositorioProductos,
    private readonly bitacora: RegistradorBitacora,
    private readonly reloj: Reloj,
    private readonly generadorId: GeneradorId,
  ) {}

  async ejecutar(entrada: unknown): Promise<RequerimientoLogisticaDto> {
    const datos = esquemaRegistroRequerimiento.parse(entrada);
    const catalogo = new Map((await this.productos.listar()).map((p) => [p.codigo, p]));

    const detalles = datos.detalles.map(({ codigo, disponible }) => {
      const producto = catalogo.get(codigo);
      if (!producto) {
        throw new ErrorValidacion(`El producto con código ${codigo} no existe en el catálogo.`);
      }
      return {
        codigo: producto.codigo,
        producto: producto.nombre,
        stockActual: producto.stockActual,
        stockMinimo: producto.stockMinimo,
        disponible,
      };
    });

    const id = this.generadorId.generar();
    const fechaRegistro = this.reloj.ahora().toISOString();
    const requerimiento = await this.repositorio.registrarConSiguienteSecuencia((secuencia) =>
      RequerimientoLogistica.registrar({ ...datos, detalles }, { id, secuencia, fechaRegistro }),
    );

    await this.bitacora.registrar({
      modulo: "REQUERIMIENTOS LOGISTICA",
      accion: "REGISTRO",
      referencia: requerimiento.codigo,
      descripcion: `Se registró el requerimiento ${requerimiento.codigo} con ${detalles.length} producto(s).`,
      usuario: requerimiento.responsable,
    });

    return requerimiento.aPrimitivos();
  }
}
