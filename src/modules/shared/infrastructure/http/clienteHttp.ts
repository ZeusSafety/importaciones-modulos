import type { RespuestaError } from "./contratoHttp";

export class ErrorHttp extends Error {
  constructor(
    mensaje: string,
    readonly estado: number,
    readonly detalles: string[],
  ) {
    super(mensaje);
    this.name = "ErrorHttp";
  }
}

async function procesarRespuesta<T>(respuesta: Response): Promise<T> {
  if (respuesta.ok) {
    return (await respuesta.json()) as T;
  }
  const cuerpo = (await respuesta.json()) as RespuestaError;
  throw new ErrorHttp(cuerpo.error.mensaje, respuesta.status, cuerpo.error.detalles);
}

export async function obtenerJson<T>(url: string): Promise<T> {
  return procesarRespuesta<T>(await fetch(url, { cache: "no-store" }));
}

export async function enviarJson<T>(url: string, metodo: "POST" | "PUT", cuerpo: unknown): Promise<T> {
  return procesarRespuesta<T>(
    await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
    }),
  );
}

export async function enviarFormulario<T>(url: string, formulario: FormData): Promise<T> {
  return procesarRespuesta<T>(await fetch(url, { method: "POST", body: formulario }));
}

/** El servidor publicado no puede escribir `storage/`. El navegador puede conservar el dato en su lugar. */
export function esAlmacenamientoNoDisponible(error: unknown): boolean {
  return error instanceof ErrorHttp && error.message.startsWith("No se pudo guardar en el servidor publicado");
}

export function mensajeDeError(error: unknown): string {
  if (error instanceof ErrorHttp) {
    return error.detalles.length > 0 ? `${error.message} ${error.detalles.join(" | ")}` : error.message;
  }
  if (error instanceof Error) return error.message;
  throw error;
}
