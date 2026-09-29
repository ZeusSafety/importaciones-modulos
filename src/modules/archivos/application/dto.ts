import type { ArchivoAdjunto } from "../domain/ArchivoAdjunto";

export type ArchivoAdjuntoDto = Omit<ArchivoAdjunto, "nombreAlmacenado">;

export function aArchivoAdjuntoDto(archivo: ArchivoAdjunto): ArchivoAdjuntoDto {
  return {
    id: archivo.id,
    nombre: archivo.nombre,
    tipoMime: archivo.tipoMime,
    tamanoBytes: archivo.tamanoBytes,
    subidoEn: archivo.subidoEn,
    subidoPor: archivo.subidoPor,
  };
}
