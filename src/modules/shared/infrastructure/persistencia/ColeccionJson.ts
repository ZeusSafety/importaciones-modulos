import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { rutasAlmacenamiento } from "./rutasAlmacenamiento";

type Cerrojo = Promise<unknown>;

/**
 * Los route handlers de Next pueden cargar instancias distintas de este módulo,
 * por eso los cerrojos se comparten a través de `globalThis`.
 */
const REGISTRO_CERROJOS = Symbol.for("zeus.importaciones.cerrojos-json");
type GlobalConCerrojos = typeof globalThis & { [REGISTRO_CERROJOS]?: Map<string, Cerrojo> };

function cerrojos(): Map<string, Cerrojo> {
  const global = globalThis as GlobalConCerrojos;
  if (!global[REGISTRO_CERROJOS]) {
    global[REGISTRO_CERROJOS] = new Map();
  }
  return global[REGISTRO_CERROJOS];
}

/**
 * Colección persistida como archivo JSON. Todas las escrituras se serializan
 * y se guardan de forma atómica (archivo temporal + rename).
 */
export class ColeccionJson<T> {
  private readonly rutaArchivo: string;

  constructor(nombre: string) {
    this.rutaArchivo = path.join(rutasAlmacenamiento.datos, `${nombre}.json`);
  }

  async leerTodos(): Promise<T[]> {
    await this.esperarEscrituras();
    return this.leerArchivo();
  }

  /** Ejecuta una transacción exclusiva: recibe el estado actual y devuelve el nuevo estado junto con un resultado. */
  async transaccion<R>(operacion: (elementos: T[]) => { elementos: T[]; resultado: R }): Promise<R> {
    const mapa = cerrojos();
    const anterior = mapa.get(this.rutaArchivo) ?? Promise.resolve();
    const actual = anterior.then(async () => {
      const { elementos, resultado } = operacion(await this.leerArchivo());
      await this.escribirArchivo(elementos);
      return resultado;
    });
    mapa.set(
      this.rutaArchivo,
      actual.catch(() => undefined),
    );
    return actual;
  }

  private async esperarEscrituras(): Promise<void> {
    await cerrojos().get(this.rutaArchivo);
  }

  private async leerArchivo(): Promise<T[]> {
    try {
      const contenido = await readFile(this.rutaArchivo, "utf-8");
      return JSON.parse(contenido) as T[];
    } catch (error) {
      if (esArchivoInexistente(error)) {
        return [];
      }
      throw error;
    }
  }

  private async escribirArchivo(elementos: T[]): Promise<void> {
    await mkdir(path.dirname(this.rutaArchivo), { recursive: true });
    const temporal = `${this.rutaArchivo}.${process.pid}.tmp`;
    await writeFile(temporal, JSON.stringify(elementos, null, 2), "utf-8");
    await rename(temporal, this.rutaArchivo);
  }
}

function esArchivoInexistente(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
