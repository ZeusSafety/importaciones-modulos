import { ErrorNoEncontrado } from "@/modules/shared/domain/errores";
import type { Bytes } from "@/modules/shared/domain/puertos";
import { CodigoRequerimiento } from "../domain/CodigoRequerimiento";
import type { RepositorioRequerimientos } from "../domain/RepositorioRequerimientos";
import type { RequerimientoLogisticaDto, SiguienteCodigoRequerimientoDto } from "./dto";
import type { GeneradorPdfRequerimiento } from "./GeneradorPdfRequerimiento";

export class ListarRequerimientosLogistica {
  constructor(private readonly repositorio: RepositorioRequerimientos) {}

  async ejecutar(): Promise<RequerimientoLogisticaDto[]> {
    const requerimientos = await this.repositorio.listar();
    return requerimientos
      .sort((a, b) => b.secuencia - a.secuencia)
      .map((requerimiento) => requerimiento.aPrimitivos());
  }
}

export class ObtenerSiguienteCodigoRequerimiento {
  constructor(private readonly repositorio: RepositorioRequerimientos) {}

  async ejecutar(): Promise<SiguienteCodigoRequerimientoDto> {
    const secuencias = await this.repositorio.secuenciasRegistradas();
    return { codigo: CodigoRequerimiento.siguienteA(secuencias).valor };
  }
}

export interface PdfRequerimiento {
  readonly nombreArchivo: string;
  readonly contenido: Bytes;
}

export class GenerarPdfRequerimiento {
  constructor(
    private readonly repositorio: RepositorioRequerimientos,
    private readonly generador: GeneradorPdfRequerimiento,
  ) {}

  async ejecutar(id: string): Promise<PdfRequerimiento> {
    const requerimiento = await this.repositorio.buscarPorId(id);
    if (!requerimiento) {
      throw new ErrorNoEncontrado("El requerimiento solicitado no existe.");
    }
    const datos = requerimiento.aPrimitivos();
    const contenido = await this.generador.generar({ ...datos, fecha: datos.fechaRegistro });
    return { nombreArchivo: `${datos.codigo}.pdf`, contenido };
  }
}
