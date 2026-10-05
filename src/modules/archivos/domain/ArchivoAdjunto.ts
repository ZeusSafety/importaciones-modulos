import { ErrorValidacion } from "@/modules/shared/domain/errores";
import { textoMayusculasRequerido } from "@/modules/shared/domain/texto";

export const TAMANO_MAXIMO_BYTES = 15 * 1024 * 1024;

export const TIPOS_PERMITIDOS: Readonly<Record<string, string>> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
};

export const ACEPTAR_TIPOS_PERMITIDOS = Object.keys(TIPOS_PERMITIDOS).join(",");

const TIPO_POR_EXTENSION: Readonly<Record<string, string>> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

/** Algunos navegadores dejan el tipo vacío; en ese caso se deduce por la extensión del nombre. */
export function resolverTipoMime(nombre: string, tipoInformado: string): string {
  if (tipoInformado) return tipoInformado;
  const extension = nombre.split(".").pop()?.toLowerCase() ?? "";
  return TIPO_POR_EXTENSION[extension] ?? "";
}

export interface ArchivoAdjunto {
  readonly id: string;
  readonly nombre: string;
  readonly tipoMime: string;
  readonly tamanoBytes: number;
  readonly subidoEn: string;
  readonly subidoPor: string;
  readonly nombreAlmacenado: string;
}

export function crearArchivoAdjunto(datos: {
  id: string;
  nombre: string;
  tipoMime: string;
  tamanoBytes: number;
  subidoEn: string;
  subidoPor: string;
}): ArchivoAdjunto {
  const extension = TIPOS_PERMITIDOS[datos.tipoMime];
  if (!extension) {
    throw new ErrorValidacion(
      `El tipo de archivo "${datos.tipoMime}" no está permitido. Suba imágenes, PDF, Word o Excel.`,
    );
  }
  if (datos.tamanoBytes === 0) {
    throw new ErrorValidacion(`El archivo "${datos.nombre}" está vacío.`);
  }
  if (datos.tamanoBytes > TAMANO_MAXIMO_BYTES) {
    throw new ErrorValidacion(`El archivo "${datos.nombre}" supera el máximo de 15 MB.`);
  }
  return {
    ...datos,
    subidoPor: textoMayusculasRequerido("SUBIDO POR", datos.subidoPor),
    nombreAlmacenado: `${datos.id}${extension}`,
  };
}
