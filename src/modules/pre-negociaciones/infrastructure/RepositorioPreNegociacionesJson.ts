import "server-only";
import { ErrorNoEncontrado } from "@/modules/shared/domain/errores";
import { ColeccionJson } from "@/modules/shared/infrastructure/persistencia/ColeccionJson";
import { PreNegociacion, type PreNegociacionPrimitivos } from "../domain/PreNegociacion";
import type { RepositorioPreNegociaciones } from "../domain/RepositorioPreNegociaciones";

export class RepositorioPreNegociacionesJson implements RepositorioPreNegociaciones {
  private readonly coleccion = new ColeccionJson<PreNegociacionPrimitivos>("pre-negociaciones");

  async listar(): Promise<PreNegociacion[]> {
    const registros = await this.coleccion.leerTodos();
    return registros.map((registro) => PreNegociacion.desdePrimitivos(registro));
  }

  async buscarPorId(id: string): Promise<PreNegociacion | undefined> {
    const registros = await this.coleccion.leerTodos();
    const encontrado = registros.find((registro) => registro.id === id);
    return encontrado && PreNegociacion.desdePrimitivos(encontrado);
  }

  async numerosRegistrados(): Promise<number[]> {
    const registros = await this.coleccion.leerTodos();
    return registros.map((registro) => registro.numero);
  }

  async registrarConSiguienteNumero(crear: (numero: number) => PreNegociacion): Promise<PreNegociacion> {
    return this.coleccion.transaccion((registros) => {
      const preNegociacion = crear(PreNegociacion.siguienteNumero(registros.map((r) => r.numero)));
      return { elementos: [...registros, preNegociacion.aPrimitivos()], resultado: preNegociacion };
    });
  }

  async actualizar(preNegociacion: PreNegociacion): Promise<void> {
    await this.coleccion.transaccion((registros) => {
      if (!registros.some((registro) => registro.id === preNegociacion.id)) {
        throw new ErrorNoEncontrado("La pre-negociación que intenta actualizar no existe.");
      }
      return {
        elementos: registros.map((registro) =>
          registro.id === preNegociacion.id ? preNegociacion.aPrimitivos() : registro,
        ),
        resultado: undefined,
      };
    });
  }
}
