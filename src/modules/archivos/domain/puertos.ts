import type { Bytes } from "@/modules/shared/domain/puertos";
import type { ArchivoAdjunto } from "./ArchivoAdjunto";

export interface RepositorioArchivos {
  guardar(archivo: ArchivoAdjunto): Promise<void>;
  buscarPorId(id: string): Promise<ArchivoAdjunto | undefined>;
  buscarPorIds(ids: readonly string[]): Promise<ArchivoAdjunto[]>;
}

export interface AlmacenArchivos {
  escribir(nombreAlmacenado: string, contenido: Bytes): Promise<void>;
  leer(nombreAlmacenado: string): Promise<Bytes>;
}
