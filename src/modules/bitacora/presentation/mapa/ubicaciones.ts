import { esPaisImportacion, type PaisImportacion } from "@/modules/pre-negociaciones/domain/origenesImportacion";
import { proyectar, type Punto } from "./proyeccion";

interface UbicacionPais {
  /** Centro aproximado del país, donde se ancla su tarjeta. */
  readonly centro: readonly [latitud: number, longitud: number];
  /** Hacia dónde se abre la tarjeta para no taparse con los vecinos. */
  readonly lado: "arriba" | "abajo" | "izquierda" | "derecha" | "abajoDerecha";
  readonly puertos: Readonly<Record<string, readonly [latitud: number, longitud: number]>>;
}

const UBICACIONES: Record<PaisImportacion, UbicacionPais> = {
  CHINA: {
    centro: [33, 106],
    lado: "arriba",
    puertos: {
      DALIAN: [38.92, 121.64],
      GUANGZHOU: [23.13, 113.26],
      NINGBO: [29.87, 121.54],
      QINGDAO: [36.07, 120.38],
      SHANGHAI: [31.23, 121.47],
      SHENZHEN: [22.54, 114.06],
      TIANJIN: [39.08, 117.2],
      XIAMEN: [24.48, 118.09],
    },
  },
  INDIA: {
    centro: [22, 79],
    lado: "abajoDerecha",
    puertos: { CHENNAI: [13.08, 80.27], KOLKATA: [22.57, 88.36], MUNDRA: [22.84, 69.72], "NHAVA SHEVA": [18.95, 72.95] },
  },
  ALEMANIA: {
    centro: [51.2, 10.4],
    lado: "arriba",
    puertos: { BREMERHAVEN: [53.54, 8.58], HAMBURGO: [53.55, 9.99] },
  },
  "COREA DEL NORTE": {
    centro: [40.3, 127.3],
    lado: "arriba",
    puertos: { CHONGJIN: [41.8, 129.78], NAMPO: [38.74, 125.4], WONSAN: [39.15, 127.44] },
  },
  "COREA DEL SUR": {
    centro: [36.4, 127.9],
    lado: "abajo",
    puertos: { BUSAN: [35.1, 129.04], INCHEON: [37.46, 126.71] },
  },
  "ESTADOS UNIDOS": {
    centro: [39.8, -98.6],
    lado: "arriba",
    puertos: {
      HOUSTON: [29.76, -95.37],
      "LONG BEACH": [33.77, -118.19],
      "LOS ÁNGELES": [33.74, -118.27],
      MIAMI: [25.77, -80.19],
      "NUEVA YORK": [40.71, -74.0],
    },
  },
  JAPÓN: {
    centro: [36.2, 138.25],
    lado: "derecha",
    puertos: { KOBE: [34.69, 135.2], NAGOYA: [35.18, 136.91], OSAKA: [34.69, 135.5], TOKIO: [35.68, 139.69], YOKOHAMA: [35.44, 139.64] },
  },
};

export const DESTINO = { nombre: "CALLAO", pais: "PERÚ", punto: proyectar(-12.05, -77.15) } as const;

export interface UbicacionEnMapa {
  readonly centro: Punto;
  readonly lado: UbicacionPais["lado"];
}

/** `null` para países fuera del catálogo: se listan, pero no se ubican en el mapa. */
export function ubicacionDePais(pais: string): UbicacionEnMapa | null {
  if (!esPaisImportacion(pais)) return null;
  const { centro, lado } = UBICACIONES[pais];
  return { centro: proyectar(...centro), lado };
}

/** Un puerto desconocido se dibuja en el centro de su país. */
export function ubicacionDePuerto(pais: string, puerto: string): Punto | null {
  if (!esPaisImportacion(pais)) return null;
  const { centro, puertos } = UBICACIONES[pais];
  const coordenadas = Object.hasOwn(puertos, puerto) ? puertos[puerto] : centro;
  return proyectar(...coordenadas);
}
