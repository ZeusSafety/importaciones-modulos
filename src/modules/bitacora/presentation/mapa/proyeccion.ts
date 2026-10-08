/** Debe coincidir con scripts/generar-mapa-mundi.mjs, que dibuja la tierra con la misma proyección. */
export const ANCHO_MAPA = 1000;
const LONGITUD_IZQUIERDA = -25;
const LATITUD_NORTE = 80;
const LATITUD_SUR = -56;
export const ALTO_MAPA = ((LATITUD_NORTE - LATITUD_SUR) / 360) * ANCHO_MAPA;

export interface Punto {
  readonly x: number;
  readonly y: number;
}

/**
 * Equirectangular con el corte en el Atlántico (25° O): Europa y África a la izquierda, Asia al centro y
 * América a la derecha. El mapa se repite en horizontal, así que el corte nunca se ve al navegar.
 */
export function proyectar(latitud: number, longitud: number): Punto {
  const desplazada = (((longitud - LONGITUD_IZQUIERDA) % 360) + 360) % 360;
  return {
    x: (desplazada / 360) * ANCHO_MAPA,
    y: ((LATITUD_NORTE - latitud) / (LATITUD_NORTE - LATITUD_SUR)) * ALTO_MAPA,
  };
}

/** Copia horizontal de `punto` más cercana a `referencia`, para que las rutas tomen el camino corto. */
export function copiaCercana(punto: Punto, referencia: number): Punto {
  return { x: punto.x + ANCHO_MAPA * Math.round((referencia - punto.x) / ANCHO_MAPA), y: punto.y };
}

/**
 * Copia del destino hacia la que se traza la ruta. Solo se cruza el borde del mapa cuando el camino directo
 * es mucho más largo (p. ej. Europa → Callao por el Atlántico); así Asia siempre llega cruzando el Pacífico.
 */
export function destinoDeRuta(origen: Punto, destino: Punto): Punto {
  const distancia = destino.x - origen.x;
  if (Math.abs(distancia) <= ANCHO_MAPA * 0.6) return destino;
  return { x: destino.x - Math.sign(distancia) * ANCHO_MAPA, y: destino.y };
}

/** Curva cuadrática que se eleva según la distancia, como una ruta aérea o marítima. */
export function rutaCurva(desde: Punto, hasta: Punto): string {
  const distancia = Math.hypot(hasta.x - desde.x, hasta.y - desde.y);
  const control = {
    x: (desde.x + hasta.x) / 2,
    y: Math.min(desde.y, hasta.y) - Math.min(distancia * 0.28, 140),
  };
  return `M${desde.x.toFixed(1)} ${desde.y.toFixed(1)} Q${control.x.toFixed(1)} ${control.y.toFixed(1)} ${hasta.x.toFixed(1)} ${hasta.y.toFixed(1)}`;
}
