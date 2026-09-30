import "server-only";
import path from "node:path";

const RAIZ_ALMACENAMIENTO = path.join(process.cwd(), "storage");

export const rutasAlmacenamiento = {
  datos: path.join(RAIZ_ALMACENAMIENTO, "datos"),
  archivos: path.join(RAIZ_ALMACENAMIENTO, "archivos"),
  logoZeus: path.join(process.cwd(), "public", "images", "logo-zeus-safety-blanco.png"),
} as const;
