function requerida(nombre: string, valor: string | undefined): string {
  if (!valor) throw new Error(`Falta configurar la variable de entorno ${nombre}.`);
  return valor;
}

/** Next solo incrusta en el cliente las variables `NEXT_PUBLIC_*` leídas de forma literal. */
export const URL_REGRESO_IMPORTACION = requerida(
  "NEXT_PUBLIC_URL_ZEUS_IMPORTACION",
  process.env.NEXT_PUBLIC_URL_ZEUS_IMPORTACION,
);
