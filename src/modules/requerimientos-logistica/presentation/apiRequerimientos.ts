import type { Producto } from "@/modules/catalogo-productos/domain/Producto";
import { enviarJson, obtenerJson } from "@/modules/shared/infrastructure/http/clienteHttp";
import type {
  AprobacionRequerimientoDto,
  RegistroRequerimientoDto,
  RequerimientoLogisticaDto,
  SiguienteCodigoRequerimientoDto,
} from "../application/dto";

const BASE = "/api/requerimientos-logistica";

export const apiRequerimientos = {
  listar: () => obtenerJson<RequerimientoLogisticaDto[]>(BASE),
  siguienteCodigo: () => obtenerJson<SiguienteCodigoRequerimientoDto>(`${BASE}/siguiente-codigo`),
  registrar: (datos: RegistroRequerimientoDto) => enviarJson<RequerimientoLogisticaDto>(BASE, "POST", datos),
  aprobar: (id: string, datos: AprobacionRequerimientoDto) =>
    enviarJson<RequerimientoLogisticaDto>(`${BASE}/${id}/aprobacion`, "POST", datos),
  buscarProductos: (termino: string) =>
    obtenerJson<Producto[]>(`/api/productos?q=${encodeURIComponent(termino)}`),
  urlPdf: (id: string, comoDescarga: boolean) => `${BASE}/${id}/pdf${comoDescarga ? "?descarga=1" : ""}`,
};
