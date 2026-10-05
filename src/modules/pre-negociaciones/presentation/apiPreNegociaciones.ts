import { aArchivoAdjuntoDto } from "@/modules/archivos/application/dto";
import type { ArchivoAdjuntoDto } from "@/modules/archivos/application/dto";
import { crearArchivoAdjunto, resolverTipoMime } from "@/modules/archivos/domain/ArchivoAdjunto";
import { enviarFormulario, enviarJson, esAlmacenamientoNoDisponible, obtenerJson } from "@/modules/shared/infrastructure/http/clienteHttp";
import { combinarPorId, guardarBlobLocal, guardarEnColeccion, leerColeccion } from "@/modules/shared/presentation/respaldoNavegador";
import type {
  GuardarPreNegociacionDto,
  PreNegociacionDto,
  SiguienteNumeroPreNegociacionDto,
} from "../application/dto";

const BASE = "/api/pre-negociaciones";
const COLECCION_LOCAL = "pre-negociaciones";

export function guardarPreNegociacionLocal(preNegociacion: PreNegociacionDto): void {
  guardarEnColeccion(COLECCION_LOCAL, preNegociacion);
}

export function esPreNegociacionLocal(id: string): boolean {
  return leerColeccion<PreNegociacionDto>(COLECCION_LOCAL).some((preNegociacion) => preNegociacion.id === id);
}

async function subirArchivoLocal(archivo: File, subidoPor: string): Promise<ArchivoAdjuntoDto> {
  const creado = crearArchivoAdjunto({
    id: crypto.randomUUID(),
    nombre: archivo.name,
    tipoMime: resolverTipoMime(archivo.name, archivo.type),
    tamanoBytes: archivo.size,
    subidoEn: new Date().toISOString(),
    subidoPor,
  });
  await guardarBlobLocal(creado.id, archivo);
  return aArchivoAdjuntoDto(creado);
}

export const apiPreNegociaciones = {
  listar: async () => {
    const remotas = await obtenerJson<PreNegociacionDto[]>(BASE);
    return combinarPorId(remotas, leerColeccion<PreNegociacionDto>(COLECCION_LOCAL));
  },
  siguienteNumero: async () => {
    const remoto = await obtenerJson<SiguienteNumeroPreNegociacionDto>(`${BASE}/siguiente-numero`);
    const numeros = leerColeccion<PreNegociacionDto>(COLECCION_LOCAL).map((preNegociacion) => preNegociacion.numero);
    return { numero: Math.max(remoto.numero, Math.max(0, ...numeros) + 1) };
  },
  registrar: (datos: GuardarPreNegociacionDto) => enviarJson<PreNegociacionDto>(BASE, "POST", datos),
  actualizar: (id: string, datos: GuardarPreNegociacionDto) =>
    enviarJson<PreNegociacionDto>(`${BASE}/${id}`, "PUT", datos),
  subirArchivo: async (archivo: File, subidoPor: string) => {
    const formulario = new FormData();
    formulario.append("archivo", archivo);
    formulario.append("subidoPor", subidoPor);
    try {
      return await enviarFormulario<ArchivoAdjuntoDto>("/api/archivos", formulario);
    } catch (error) {
      if (!esAlmacenamientoNoDisponible(error)) throw error;
      return subirArchivoLocal(archivo, subidoPor);
    }
  },
  urlArchivo: (id: string, comoDescarga: boolean) => `/api/archivos/${id}${comoDescarga ? "?descarga=1" : ""}`,
};
