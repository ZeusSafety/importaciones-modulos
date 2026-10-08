// Genera la malla de puntos de tierra del mapa de orígenes (Bitácora y Reportes).
// Uso: node scripts/generar-mapa-mundi.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoContains } from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const topologia = JSON.parse(readFileSync(require.resolve("world-atlas/land-50m.json"), "utf8"));
const tierra = feature(topologia, topologia.objects.land);

// Debe coincidir con la proyección de src/modules/bitacora/presentation/mapa/proyeccion.ts.
const ANCHO = 1000;
const LONGITUD_IZQUIERDA = -25;
const LATITUD_NORTE = 80;
const LATITUD_SUR = -56;
const ALTO = ((LATITUD_NORTE - LATITUD_SUR) / 360) * ANCHO;
const PASO = 6.4;
const PASO_FILA = PASO * 0.866;

const segmentos = [];
let fila = 0;
for (let y = PASO_FILA / 2; y < ALTO; y += PASO_FILA, fila += 1) {
  const desfase = fila % 2 === 0 ? 0 : PASO / 2;
  for (let x = PASO / 2 + desfase; x < ANCHO; x += PASO) {
    const longitud = ((LONGITUD_IZQUIERDA + (x / ANCHO) * 360 + 180) % 360) - 180;
    const latitud = LATITUD_NORTE - (y / ALTO) * (LATITUD_NORTE - LATITUD_SUR);
    if (geoContains(tierra, [longitud, latitud])) segmentos.push(`M${x.toFixed(1)} ${y.toFixed(1)}h0`);
  }
}

const destino = new URL("../src/modules/bitacora/presentation/mapa/tierra.generado.ts", import.meta.url);
writeFileSync(
  destino,
  `// Archivo generado por scripts/generar-mapa-mundi.mjs. No editar a mano.\n` +
    `export const TOTAL_PUNTOS_TIERRA = ${segmentos.length};\n` +
    `export const RUTA_TIERRA =\n  "${segmentos.join("")}";\n`,
);
console.log(`Puntos de tierra: ${segmentos.length}`);
