import type { ReactNode } from "react";
import { CentroNotificaciones } from "@/modules/bitacora/presentation/notificaciones/CentroNotificaciones";
import { MarcoAplicacion } from "@/modules/shared/presentation/layout/MarcoAplicacion";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return <MarcoAplicacion accionesCabecera={<CentroNotificaciones />}>{children}</MarcoAplicacion>;
}
