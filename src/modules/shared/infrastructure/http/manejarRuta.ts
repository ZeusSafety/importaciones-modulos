import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  ErrorConflicto,
  ErrorNoEncontrado,
  ErrorValidacion,
} from "../../domain/errores";
import type { RespuestaError } from "./contratoHttp";

function responderError(estado: number, mensaje: string, detalles: string[]) {
  const cuerpo: RespuestaError = { error: { mensaje, detalles } };
  return NextResponse.json(cuerpo, { status: estado });
}

export async function manejarRuta(accion: () => Promise<Response>): Promise<Response> {
  try {
    return await accion();
  } catch (error) {
    if (error instanceof ZodError) {
      return responderError(
        400,
        "Los datos enviados no son válidos.",
        error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
      );
    }
    if (error instanceof ErrorValidacion) return responderError(400, error.message, []);
    if (error instanceof ErrorNoEncontrado) return responderError(404, error.message, []);
    if (error instanceof ErrorConflicto) return responderError(409, error.message, []);

    console.error(error);
    return responderError(500, "Ocurrió un error interno en el servidor.", []);
  }
}

export async function leerCuerpoJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ErrorValidacion("El cuerpo de la solicitud no es un JSON válido.");
  }
}
