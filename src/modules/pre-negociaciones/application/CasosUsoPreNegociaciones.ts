import type { RepositorioArchivos } from "@/modules/archivos/domain/puertos";
import type { RegistradorBitacora } from "@/modules/bitacora/application/RegistradorBitacora";
import { ErrorNoEncontrado } from "@/modules/shared/domain/errores";
import type { GeneradorId, Reloj } from "@/modules/shared/domain/puertos";
import { PreNegociacion } from "../domain/PreNegociacion";
import type { RepositorioPreNegociaciones } from "../domain/RepositorioPreNegociaciones";
import { etiquetaPreNegociacion } from "../domain/valores";
import {
  esquemaGuardarPreNegociacion,
  type PreNegociacionDto,
  type SiguienteNumeroPreNegociacionDto,
} from "./dto";
import { resolverDatosPreNegociacion } from "./resolverDatosPreNegociacion";

export class RegistrarPreNegociacion {
  constructor(
    private readonly repositorio: RepositorioPreNegociaciones,
    private readonly archivos: RepositorioArchivos,
    private readonly bitacora: RegistradorBitacora,
    private readonly reloj: Reloj,
    private readonly generadorId: GeneradorId,
  ) {}

  async ejecutar(entrada: unknown): Promise<PreNegociacionDto> {
    const datos = await resolverDatosPreNegociacion(esquemaGuardarPreNegociacion.parse(entrada), this.archivos);
    const id = this.generadorId.generar();
    const ahora = this.reloj.ahora().toISOString();

    const preNegociacion = await this.repositorio.registrarConSiguienteNumero((numero) =>
      PreNegociacion.registrar(datos, { id, numero, ahora }),
    );

    const etiqueta = etiquetaPreNegociacion(preNegociacion.numero);
    await this.bitacora.registrar({
      modulo: "COTIZACIONES",
      accion: "REGISTRO",
      referencia: etiqueta,
      descripcion: `Se registró la ${etiqueta} con ${datos.cotizaciones.length} cotización(es).`,
      usuario: preNegociacion.registradoPor,
    });

    return preNegociacion.aPrimitivos();
  }
}

export class ActualizarPreNegociacion {
  constructor(
    private readonly repositorio: RepositorioPreNegociaciones,
    private readonly archivos: RepositorioArchivos,
    private readonly bitacora: RegistradorBitacora,
    private readonly reloj: Reloj,
  ) {}

  async ejecutar(id: string, entrada: unknown): Promise<PreNegociacionDto> {
    const existente = await this.repositorio.buscarPorId(id);
    if (!existente) {
      throw new ErrorNoEncontrado("La pre-negociación que intenta editar no existe.");
    }
    const datos = await resolverDatosPreNegociacion(esquemaGuardarPreNegociacion.parse(entrada), this.archivos);
    const actualizada = existente.actualizar(datos, this.reloj.ahora().toISOString());
    await this.repositorio.actualizar(actualizada);

    const etiqueta = etiquetaPreNegociacion(actualizada.numero);
    await this.bitacora.registrar({
      modulo: "COTIZACIONES",
      accion: "ACTUALIZACION",
      referencia: etiqueta,
      descripcion: `Se actualizó la ${etiqueta} (estado: ${datos.estado}).`,
      usuario: actualizada.registradoPor,
    });

    return actualizada.aPrimitivos();
  }
}

export class ListarPreNegociaciones {
  constructor(private readonly repositorio: RepositorioPreNegociaciones) {}

  async ejecutar(): Promise<PreNegociacionDto[]> {
    const preNegociaciones = await this.repositorio.listar();
    return preNegociaciones.sort((a, b) => b.numero - a.numero).map((p) => p.aPrimitivos());
  }
}

export class ObtenerSiguienteNumeroPreNegociacion {
  constructor(private readonly repositorio: RepositorioPreNegociaciones) {}

  async ejecutar(): Promise<SiguienteNumeroPreNegociacionDto> {
    return { numero: PreNegociacion.siguienteNumero(await this.repositorio.numerosRegistrados()) };
  }
}
