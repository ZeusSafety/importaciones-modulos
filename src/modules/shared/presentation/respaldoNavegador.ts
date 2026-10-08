/**
 * Subir la versión descarta los respaldos de versiones anteriores (datos de prueba) en todos los navegadores:
 * la app vuelve a empezar vacía y solo muestra lo que se registre desde entonces.
 */
const VERSION_RESPALDO = 2;
const PREFIJO_BASE = "zeus.importaciones.";
const PREFIJO = `${PREFIJO_BASE}v${VERSION_RESPALDO}.`;
const BASE_DATOS_ANTERIOR = "zeus-importaciones";
const BASE_DATOS = `${BASE_DATOS_ANTERIOR}-v${VERSION_RESPALDO}`;
const ALMACEN_BLOBS = "archivos";
/** Claves con el prefijo base que no son respaldos de datos y deben conservarse. */
const CLAVES_CONSERVADAS = new Set([`${PREFIJO_BASE}notificaciones`]);

let respaldoAnteriorDescartado = false;

function descartarRespaldoAnterior() {
  if (respaldoAnteriorDescartado) return;
  respaldoAnteriorDescartado = true;
  const obsoletas = Object.keys(localStorage).filter(
    (clave) => clave.startsWith(PREFIJO_BASE) && !clave.startsWith(PREFIJO) && !CLAVES_CONSERVADAS.has(clave),
  );
  obsoletas.forEach((clave) => localStorage.removeItem(clave));
  if (obsoletas.length > 0 && typeof indexedDB !== "undefined") indexedDB.deleteDatabase(BASE_DATOS_ANTERIOR);
}

export function leerColeccion<T>(nombre: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    descartarRespaldoAnterior();
    const texto = localStorage.getItem(PREFIJO + nombre);
    if (!texto) return [];
    const datos = JSON.parse(texto) as unknown;
    return Array.isArray(datos) ? (datos as T[]) : [];
  } catch {
    return [];
  }
}

export function guardarEnColeccion<T extends { id: string }>(nombre: string, elemento: T): void {
  descartarRespaldoAnterior();
  const resto = leerColeccion<T>(nombre).filter((actual) => actual.id !== elemento.id);
  localStorage.setItem(PREFIJO + nombre, JSON.stringify([elemento, ...resto]));
}

/** El servidor manda cuando ya tiene el registro; lo guardado en el navegador completa lo que el disco publicado no pudo escribir. */
export function combinarPorId<T extends { id: string }>(servidor: readonly T[], navegador: readonly T[]): T[] {
  const idsServidor = new Set(servidor.map((elemento) => elemento.id));
  return [...servidor, ...navegador.filter((elemento) => !idsServidor.has(elemento.id))];
}

function abrirBase(): Promise<IDBDatabase> {
  return new Promise((resolver, rechazar) => {
    const pedido = indexedDB.open(BASE_DATOS, 1);
    pedido.onupgradeneeded = () => {
      if (!pedido.result.objectStoreNames.contains(ALMACEN_BLOBS)) {
        pedido.result.createObjectStore(ALMACEN_BLOBS);
      }
    };
    pedido.onsuccess = () => resolver(pedido.result);
    pedido.onerror = () => rechazar(pedido.error ?? new Error("No se pudo abrir el almacenamiento del navegador."));
  });
}

export async function guardarBlobLocal(id: string, contenido: Blob): Promise<void> {
  const base = await abrirBase();
  try {
    await new Promise<void>((resolver, rechazar) => {
      const transaccion = base.transaction(ALMACEN_BLOBS, "readwrite");
      transaccion.objectStore(ALMACEN_BLOBS).put(contenido, id);
      transaccion.oncomplete = () => resolver();
      transaccion.onerror = () => rechazar(transaccion.error ?? new Error("No se pudo guardar el archivo en el navegador."));
    });
  } finally {
    base.close();
  }
}

export async function leerBlobLocal(id: string): Promise<Blob | undefined> {
  if (typeof indexedDB === "undefined") return undefined;
  const base = await abrirBase();
  try {
    return await new Promise<Blob | undefined>((resolver, rechazar) => {
      const transaccion = base.transaction(ALMACEN_BLOBS, "readonly");
      const pedido = transaccion.objectStore(ALMACEN_BLOBS).get(id);
      pedido.onsuccess = () => resolver(pedido.result instanceof Blob ? pedido.result : undefined);
      pedido.onerror = () => rechazar(pedido.error ?? new Error("No se pudo leer el archivo del navegador."));
    });
  } finally {
    base.close();
  }
}

export async function urlDeBlobLocal(id: string): Promise<string | null> {
  const contenido = await leerBlobLocal(id);
  return contenido ? URL.createObjectURL(contenido) : null;
}
