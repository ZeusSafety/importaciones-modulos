import type { ArchivoAdjuntoDto } from "@/modules/archivos/application/dto";
import { enviarFormulario, enviarJson, obtenerJson } from "@/modules/shared/infrastructure/http/clienteHttp";
import type {
  GuardarPreNegociacionDto,
  PreNegociacionDto,
  SiguienteNumeroPreNegociacionDto,
} from "../application/dto";

const BASE = "/api/pre-negociaciones";

export const apiPreNegociaciones = {
  listar: () => obtenerJson<PreNegociacionDto[]>(BASE),
  siguienteNumero: () => obtenerJson<SiguienteNumeroPreNegociacionDto>(`${BASE}/siguiente-numero`),
  registrar: (datos: GuardarPreNegociacionDto) => enviarJson<PreNegociacionDto>(BASE, "POST", datos),
  actualizar: (id: string, datos: GuardarPreNegociacionDto) =>
    enviarJson<PreNegociacionDto>(`${BASE}/${id}`, "PUT", datos),
  subirArchivo: (archivo: File, subidoPor: string) => {
    const formulario = new FormData();
    formulario.append("archivo", archivo);
    formulario.append("subidoPor", subidoPor);
    return enviarFormulario<ArchivoAdjuntoDto>("/api/archivos", formulario);
  },
  urlArchivo: (id: string, comoDescarga: boolean) => `/api/archivos/${id}${comoDescarga ? "?descarga=1" : ""}`,
};
