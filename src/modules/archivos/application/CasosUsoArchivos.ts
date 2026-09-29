import { ErrorNoEncontrado } from "@/modules/shared/domain/errores";
import type { Bytes, GeneradorId, Reloj } from "@/modules/shared/domain/puertos";
import { crearArchivoAdjunto, type ArchivoAdjunto } from "../domain/ArchivoAdjunto";
import type { AlmacenArchivos, RepositorioArchivos } from "../domain/puertos";
import { aArchivoAdjuntoDto, type ArchivoAdjuntoDto } from "./dto";

export interface SolicitudSubidaArchivo {
  readonly nombre: string;
  readonly tipoMime: string;
  readonly contenido: Bytes;
  readonly subidoPor: string;
}

export class SubirArchivo {
  constructor(
    private readonly repositorio: RepositorioArchivos,
    private readonly almacen: AlmacenArchivos,
    private readonly reloj: Reloj,
    private readonly generadorId: GeneradorId,
  ) {}

  async ejecutar(solicitud: SolicitudSubidaArchivo): Promise<ArchivoAdjuntoDto> {
    const archivo = crearArchivoAdjunto({
      id: this.generadorId.generar(),
      nombre: solicitud.nombre,
      tipoMime: solicitud.tipoMime,
      tamanoBytes: solicitud.contenido.byteLength,
      subidoEn: this.reloj.ahora().toISOString(),
      subidoPor: solicitud.subidoPor,
    });
    await this.almacen.escribir(archivo.nombreAlmacenado, solicitud.contenido);
    await this.repositorio.guardar(archivo);
    return aArchivoAdjuntoDto(archivo);
  }
}

export interface ArchivoDescargable {
  readonly archivo: ArchivoAdjunto;
  readonly contenido: Bytes;
}

export class ObtenerArchivo {
  constructor(
    private readonly repositorio: RepositorioArchivos,
    private readonly almacen: AlmacenArchivos,
  ) {}

  async ejecutar(id: string): Promise<ArchivoDescargable> {
    const archivo = await this.repositorio.buscarPorId(id);
    if (!archivo) {
      throw new ErrorNoEncontrado("El archivo solicitado no existe.");
    }
    return { archivo, contenido: await this.almacen.leer(archivo.nombreAlmacenado) };
  }
}
