import type { ReactNode } from "react";
import { MarcoAplicacion } from "@/modules/shared/presentation/layout/MarcoAplicacion";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return <MarcoAplicacion>{children}</MarcoAplicacion>;
}
