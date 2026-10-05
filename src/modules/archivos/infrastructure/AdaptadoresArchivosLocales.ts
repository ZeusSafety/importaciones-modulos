import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ColeccionJson } from "@/modules/shared/infrastructure/persistencia/ColeccionJson";
import { asegurarEscritura } from "@/modules/shared/infrastructure/persistencia/errorDisco";
import { rutasAlmacenamiento } from "@/modules/shared/infrastructure/persistencia/rutasAlmacenamiento";
import type { Bytes } from "@/modules/shared/domain/puertos";
import type { ArchivoAdjunto } from "../domain/ArchivoAdjunto";
import type { AlmacenArchivos, RepositorioArchivos } from "../domain/puertos";

export class RepositorioArchivosJson implements RepositorioArchivos {
  private readonly coleccion = new ColeccionJson<ArchivoAdjunto>("archivos");

  async guardar(archivo: ArchivoAdjunto): Promise<void> {
    await this.coleccion.transaccion((archivos) => ({
      elementos: [...archivos, archivo],
      resultado: undefined,
    }));
  }

  async buscarPorId(id: string): Promise<ArchivoAdjunto | undefined> {
    const archivos = await this.coleccion.leerTodos();
    return archivos.find((archivo) => archivo.id === id);
  }

  async buscarPorIds(ids: readonly string[]): Promise<ArchivoAdjunto[]> {
    const buscados = new Set(ids);
    const archivos = await this.coleccion.leerTodos();
    return archivos.filter((archivo) => buscados.has(archivo.id));
  }
}

export class AlmacenArchivosLocal implements AlmacenArchivos {
  async escribir(nombreAlmacenado: string, contenido: Bytes): Promise<void> {
    try {
      await mkdir(rutasAlmacenamiento.archivos, { recursive: true });
      await writeFile(this.ruta(nombreAlmacenado), contenido);
    } catch (error) {
      asegurarEscritura(error);
    }
  }

  async leer(nombreAlmacenado: string): Promise<Bytes> {
    return new Uint8Array(await readFile(this.ruta(nombreAlmacenado)));
  }

  private ruta(nombreAlmacenado: string): string {
    return path.join(rutasAlmacenamiento.archivos, path.basename(nombreAlmacenado));
  }
}
