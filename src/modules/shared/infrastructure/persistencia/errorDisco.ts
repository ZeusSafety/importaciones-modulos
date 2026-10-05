import "server-only";
import { ErrorAlmacenamiento } from "../../domain/errores";

export const MENSAJE_DISCO_SOLO_LECTURA =
  "No se pudo guardar en el servidor publicado. Vercel no permite escribir archivos en su disco; en su computadora el registro sí se guarda.";

function codigoDeSistema(error: unknown): string | undefined {
  return error instanceof Error && "code" in error && typeof error.code === "string" ? error.code : undefined;
}

/** El despliegue en Vercel solo puede escribir en un disco efímero; `storage/` del proyecto es de solo lectura. */
export function esDiscoDeSoloLectura(error: unknown): boolean {
  const codigo = codigoDeSistema(error);
  if (codigo === "EROFS" || codigo === "EPERM" || codigo === "EACCES") return true;
  if (process.env.VERCEL === "1" && (codigo === "ENOENT" || codigo === "ENOTDIR" || codigo === "EISDIR")) return true;
  return error instanceof Error && /read-only file system|EROFS/i.test(error.message);
}

export function asegurarEscritura(error: unknown): never {
  if (esDiscoDeSoloLectura(error)) {
    throw new ErrorAlmacenamiento(MENSAJE_DISCO_SOLO_LECTURA);
  }
  throw error;
}
