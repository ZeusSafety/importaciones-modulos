"use client";

import { useState } from "react";
import { HiOutlineDocumentCurrencyDollar, HiOutlineViewColumns } from "react-icons/hi2";
import { mensajeDeError } from "@/modules/shared/infrastructure/http/clienteHttp";
import { useConsulta } from "@/modules/shared/presentation/hooks/useConsulta";
import { Aparicion } from "@/modules/shared/presentation/ui/Aparicion";
import { Modal } from "@/modules/shared/presentation/ui/Modal";
import { useNotificaciones } from "@/modules/shared/presentation/ui/Notificaciones";
import { ResultadoConsulta } from "@/modules/shared/presentation/ui/ResultadoConsulta";
import { EncabezadoPagina } from "@/modules/shared/presentation/ui/Superficies";
import type { PreNegociacionDto } from "../../application/dto";
import { paisesFueraDelCatalogo } from "../../domain/origenesImportacion";
import { ESTADOS_PRE_NEGOCIACION, etiquetaPreNegociacion, type EstadoPreNegociacion } from "../../domain/valores";
import { apiPreNegociaciones } from "../apiPreNegociaciones";
import { ModalFormularioPreNegociacion, modoNuevoRegistro, type ModoFormulario } from "../formulario/ModalFormularioPreNegociacion";
import { DetallePreNegociacion } from "../listado/DetallePreNegociacion";
import { aplicarFiltros, FILTROS_INICIALES, type FiltrosPreNegociaciones } from "../listado/filtrosPreNegociaciones";
import { PanelFiltrosPreNegociaciones } from "../listado/PanelFiltrosPreNegociaciones";
import { ColumnaKanban } from "./ColumnaKanban";
import { COLUMNAS_TABLERO } from "./columnasTablero";
import { TarjetaTablero } from "./TarjetaTablero";

export function PaginaTablero() {
  const notificar = useNotificaciones();
  const { estado, recargar } = useConsulta(apiPreNegociaciones.listar);
  /** Cambios ya aplicados en pantalla mientras el listado no se vuelve a pedir. */
  const [cambios, setCambios] = useState<ReadonlyMap<string, PreNegociacionDto>>(new Map());
  const [moviendo, setMoviendo] = useState<ReadonlySet<string>>(new Set());
  const [arrastrandoId, setArrastrandoId] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosPreNegociaciones>(FILTROS_INICIALES);
  const [abiertaId, setAbiertaId] = useState<string | null>(null);
  const [modo, setModo] = useState<ModoFormulario | null>(null);
  const [duplicando, setDuplicando] = useState(false);

  const todas = estado.tipo === "listo" ? estado.datos.map((p) => cambios.get(p.id) ?? p) : [];
  const visibles = aplicarFiltros(todas, filtros);
  const abierta = todas.find((p) => p.id === abiertaId);
  const paisesAdicionales = paisesFueraDelCatalogo(todas.map((p) => p.pais));

  const aplicar = (preNegociacion: PreNegociacionDto) => setCambios((previos) => new Map(previos).set(preNegociacion.id, preNegociacion));
  const marcarMoviendo = (id: string, activo: boolean) =>
    setMoviendo((previos) => {
      const siguientes = new Set(previos);
      if (activo) siguientes.add(id);
      else siguientes.delete(id);
      return siguientes;
    });

  const mover = async (id: string, destino: EstadoPreNegociacion) => {
    const original = todas.find((p) => p.id === id);
    if (!original || original.estado === destino || moviendo.has(id)) return;

    aplicar({ ...original, estado: destino });
    marcarMoviendo(id, true);
    try {
      aplicar(await apiPreNegociaciones.cambiarEstado(original, destino));
      notificar({
        tipo: "exito",
        titulo: "Estado actualizado",
        mensaje: `${etiquetaPreNegociacion(original.numero)} pasó a ${COLUMNAS_TABLERO[destino].titulo.toLowerCase()}.`,
      });
    } catch (error) {
      aplicar(original);
      notificar({ tipo: "error", titulo: "No se pudo mover la tarjeta", mensaje: mensajeDeError(error) });
    } finally {
      marcarMoviendo(id, false);
    }
  };

  const recargarTablero = async () => {
    await recargar();
    setCambios(new Map());
  };

  const duplicar = async (origen: PreNegociacionDto) => {
    setDuplicando(true);
    try {
      const { numero } = await apiPreNegociaciones.siguienteNumero();
      setModo(modoNuevoRegistro(numero, origen));
    } catch (error) {
      notificar({ tipo: "error", titulo: "No se pudo duplicar", mensaje: mensajeDeError(error) });
    } finally {
      setDuplicando(false);
    }
  };

  const alGuardar = async (guardada: PreNegociacionDto) => {
    setModo(null);
    await recargarTablero();
    setAbiertaId(guardada.id);
  };

  return (
    <div className="space-y-6">
      <Aparicion orden={0}>
        <EncabezadoPagina
          icono={<HiOutlineViewColumns />}
          titulo="Tablero Kanban"
          descripcion="Arrastre las pre-negociaciones entre columnas para cambiar su estado."
        />
      </Aparicion>

      <ResultadoConsulta estado={estado} textoCargando="Cargando tablero…" alReintentar={recargarTablero}>
        {() => (
          <div className="space-y-4">
            <Aparicion orden={1}>
              <PanelFiltrosPreNegociaciones filtros={filtros} alCambiar={setFiltros} paisesAdicionales={paisesAdicionales} sinEstado />
            </Aparicion>

            <Aparicion orden={2}>
              <div className="scroll-zeus flex snap-x gap-4 overflow-x-auto pb-2 xl:overflow-visible">
                {ESTADOS_PRE_NEGOCIACION.map((columna) => {
                  const tarjetas = visibles
                    .filter((p) => p.estado === columna)
                    .sort((a, b) => b.actualizadoEn.localeCompare(a.actualizadoEn));
                  return (
                    <ColumnaKanban
                      key={columna}
                      estado={columna}
                      cantidad={tarjetas.length}
                      arrastrando={arrastrandoId !== null}
                      alSoltar={(id) => void mover(id, columna)}
                    >
                      {tarjetas.map((p) => (
                        <TarjetaTablero
                          key={p.id}
                          preNegociacion={p}
                          moviendo={moviendo.has(p.id)}
                          alAbrir={() => setAbiertaId(p.id)}
                          alMover={(destino) => void mover(p.id, destino)}
                          alDuplicar={() => void duplicar(p)}
                          alIniciarArrastre={() => setArrastrandoId(p.id)}
                          alTerminarArrastre={() => setArrastrandoId(null)}
                        />
                      ))}
                    </ColumnaKanban>
                  );
                })}
              </div>
            </Aparicion>
          </div>
        )}
      </ResultadoConsulta>

      <Modal
        abierto={abierta !== undefined && modo === null}
        alCerrar={() => setAbiertaId(null)}
        titulo={abierta ? etiquetaPreNegociacion(abierta.numero) : ""}
        subtitulo={abierta?.tipoCarga}
        icono={<HiOutlineDocumentCurrencyDollar />}
        tamano="completo"
      >
        {abierta && (
          <div className="-mx-5 -my-5 sm:-mx-6">
            <DetallePreNegociacion
              preNegociacion={abierta}
              alEditar={() => setModo({ tipo: "edicion", apertura: Date.now(), preNegociacion: abierta })}
              alDuplicar={() => void duplicar(abierta)}
              duplicando={duplicando}
            />
          </div>
        )}
      </Modal>

      <ModalFormularioPreNegociacion modo={modo} paisesAdicionales={paisesAdicionales} alCerrar={() => setModo(null)} alGuardar={alGuardar} />
    </div>
  );
}
