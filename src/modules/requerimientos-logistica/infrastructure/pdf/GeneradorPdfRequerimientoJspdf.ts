import "server-only";
import { readFile } from "node:fs/promises";
import type { Bytes } from "@/modules/shared/domain/puertos";
import { rutasAlmacenamiento } from "@/modules/shared/infrastructure/persistencia/rutasAlmacenamiento";
import type {
  DatosPdfRequerimiento,
  GeneradorPdfRequerimiento,
} from "../../application/GeneradorPdfRequerimiento";
import { construirPdfRequerimiento } from "./plantillaRequerimientoPdf";

export class GeneradorPdfRequerimientoJspdf implements GeneradorPdfRequerimiento {
  private logo: Promise<string> | undefined;

  async generar(datos: DatosPdfRequerimiento): Promise<Bytes> {
    const documento = construirPdfRequerimiento(datos, await this.cargarLogo());
    return new Uint8Array(documento.output("arraybuffer"));
  }

  private cargarLogo(): Promise<string> {
    this.logo ??= readFile(rutasAlmacenamiento.logoZeus).then(
      (contenido) => `data:image/png;base64,${contenido.toString("base64")}`,
    );
    return this.logo;
  }
}
