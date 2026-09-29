import "server-only";
import { ErrorNoEncontrado } from "@/modules/shared/domain/errores";
import { ColeccionJson } from "@/modules/shared/infrastructure/persistencia/ColeccionJson";
import {
  RequerimientoLogistica,
  type RequerimientoLogisticaPrimitivos,
} from "../domain/RequerimientoLogistica";
import { CodigoRequerimiento } from "../domain/CodigoRequerimiento";
import type { RepositorioRequerimientos } from "../domain/RepositorioRequerimientos";

export class RepositorioRequerimientosJson implements RepositorioRequerimientos {
  private readonly coleccion = new ColeccionJson<RequerimientoLogisticaPrimitivos>(
    "requerimientos-logistica",
  );

  async listar(): Promise<RequerimientoLogistica[]> {
    const registros = await this.coleccion.leerTodos();
    return registros.map((registro) => RequerimientoLogistica.desdePrimitivos(registro));
  }

  async buscarPorId(id: string): Promise<RequerimientoLogistica | undefined> {
    const registros = await this.coleccion.leerTodos();
    const encontrado = registros.find((registro) => registro.id === id);
    return encontrado && RequerimientoLogistica.desdePrimitivos(encontrado);
  }

  async secuenciasRegistradas(): Promise<number[]> {
    const registros = await this.coleccion.leerTodos();
    return registros.map((registro) => registro.secuencia);
  }

  async registrarConSiguienteSecuencia(
    crear: (secuencia: number) => RequerimientoLogistica,
  ): Promise<RequerimientoLogistica> {
    return this.coleccion.transaccion((registros) => {
      const { secuencia } = CodigoRequerimiento.siguienteA(registros.map((r) => r.secuencia));
      const requerimiento = crear(secuencia);
      return { elementos: [...registros, requerimiento.aPrimitivos()], resultado: requerimiento };
    });
  }

  async modificar(
    id: string,
    cambiar: (requerimiento: RequerimientoLogistica) => RequerimientoLogistica,
  ): Promise<RequerimientoLogistica> {
    return this.coleccion.transaccion((registros) => {
      const indice = registros.findIndex((registro) => registro.id === id);
      if (indice === -1) {
        throw new ErrorNoEncontrado("El requerimiento solicitado no existe.");
      }
      const modificado = cambiar(RequerimientoLogistica.desdePrimitivos(registros[indice]));
      const elementos = registros.map((registro, i) => (i === indice ? modificado.aPrimitivos() : registro));
      return { elementos, resultado: modificado };
    });
  }
}
