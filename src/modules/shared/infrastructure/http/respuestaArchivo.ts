import "server-only";
import type { Bytes } from "../../domain/puertos";

export function respuestaArchivo(
  contenido: Bytes,
  tipoMime: string,
  nombreArchivo: string,
  comoDescarga: boolean,
): Response {
  const disposicion = comoDescarga ? "attachment" : "inline";
  return new Response(contenido, {
    headers: {
      "Content-Type": tipoMime,
      "Content-Length": String(contenido.byteLength),
      "Content-Disposition": `${disposicion}; filename*=UTF-8''${encodeURIComponent(nombreArchivo)}`,
      "Cache-Control": "private, no-store",
    },
  });
}

export function solicitaDescarga(request: Request): boolean {
  return new URL(request.url).searchParams.get("descarga") === "1";
}
