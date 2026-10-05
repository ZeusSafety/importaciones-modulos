import type { Producto } from "@/modules/catalogo-productos/domain/Producto";
import { enviarJson, obtenerJson } from "@/modules/shared/infrastructure/http/clienteHttp";
import { combinarPorId, leerColeccion, guardarEnColeccion } from "@/modules/shared/presentation/respaldoNavegador";
import type {
  AprobacionRequerimientoDto,
  RegistroRequerimientoDto,
  RequerimientoLogisticaDto,
  SiguienteCodigoRequerimientoDto,
} from "../application/dto";
import { RequerimientoLogistica } from "../domain/RequerimientoLogistica";

const BASE = "/api/requerimientos-logistica";
const COLECCION_LOCAL = "requerimientos-logistica";

export function guardarRequerimientoLocal(requerimiento: RequerimientoLogisticaDto): void {
  guardarEnColeccion(COLECCION_LOCAL, requerimiento);
}

export function esRequerimientoLocal(id: string): boolean {
  return leerColeccion<RequerimientoLogisticaDto>(COLECCION_LOCAL).some((requerimiento) => requerimiento.id === id);
}

function siguienteSecuenciaLocal(): number {
  const secuencias = leerColeccion<RequerimientoLogisticaDto>(COLECCION_LOCAL).map((requerimiento) => requerimiento.secuencia);
  return Math.max(0, ...secuencias) + 1;
}

export const apiRequerimientos = {
  listar: async () => {
    const remotos = await obtenerJson<RequerimientoLogisticaDto[]>(BASE);
    return combinarPorId(remotos, leerColeccion<RequerimientoLogisticaDto>(COLECCION_LOCAL));
  },
  siguienteCodigo: async () => {
    const remoto = await obtenerJson<SiguienteCodigoRequerimientoDto>(`${BASE}/siguiente-codigo`);
    const secuenciaRemota = Number(remoto.codigo.replace(/\D/g, "")) || 1;
    const secuencia = Math.max(secuenciaRemota, siguienteSecuenciaLocal());
    return { codigo: `REG_LOG ${String(secuencia).padStart(2, "0")}` };
  },
  registrar: (datos: RegistroRequerimientoDto) => enviarJson<RequerimientoLogisticaDto>(BASE, "POST", datos),
  aprobar: async (id: string, datos: AprobacionRequerimientoDto) => {
    const local = leerColeccion<RequerimientoLogisticaDto>(COLECCION_LOCAL).find((requerimiento) => requerimiento.id === id);
    if (local) {
      const aprobado = RequerimientoLogistica.desdePrimitivos(local)
        .aprobar(datos.aprobadoPor, datos.firma, new Date().toISOString())
        .aPrimitivos();
      guardarRequerimientoLocal(aprobado);
      return aprobado;
    }
    return enviarJson<RequerimientoLogisticaDto>(`${BASE}/${id}/aprobacion`, "POST", datos);
  },
  buscarProductos: (termino: string) =>
    obtenerJson<Producto[]>(`/api/productos?q=${encodeURIComponent(termino)}`),
  urlPdf: (id: string, comoDescarga: boolean) => `${BASE}/${id}/pdf${comoDescarga ? "?descarga=1" : ""}`,
};
