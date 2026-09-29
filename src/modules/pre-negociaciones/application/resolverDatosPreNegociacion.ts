import { aArchivoAdjuntoDto } from "@/modules/archivos/application/dto";
import type { RepositorioArchivos } from "@/modules/archivos/domain/puertos";
import { ErrorValidacion } from "@/modules/shared/domain/errores";
import type { DatosPreNegociacion } from "../domain/PreNegociacion";
import type { GuardarPreNegociacionDto } from "./dto";

/** Traduce el DTO de entrada a datos de dominio, reemplazando los ids de archivos por sus metadatos registrados. */
export async function resolverDatosPreNegociacion(
  dto: GuardarPreNegociacionDto,
  archivos: RepositorioArchivos,
): Promise<DatosPreNegociacion> {
  const idsSolicitados = dto.cotizaciones.flatMap((c) => c.contactos.flatMap((contacto) => contacto.archivoIds));
  const encontrados = new Map(
    (await archivos.buscarPorIds(idsSolicitados)).map((archivo) => [archivo.id, aArchivoAdjuntoDto(archivo)]),
  );

  return {
    ...dto,
    cotizaciones: dto.cotizaciones.map((cotizacion) => ({
      ...cotizacion,
      contactos: cotizacion.contactos.map(({ archivoIds, ...contacto }) => ({
        ...contacto,
        archivos: archivoIds.map((id) => {
          const archivo = encontrados.get(id);
          if (!archivo) {
            throw new ErrorValidacion("Uno de los archivos adjuntos no existe. Vuelva a subirlo.");
          }
          return archivo;
        }),
      })),
    })),
  };
}
