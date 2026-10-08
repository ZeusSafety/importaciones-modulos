"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa6";
import { HiOutlineDocumentCurrencyDollar, HiOutlineListBullet, HiOutlinePlus } from "react-icons/hi2";
import { mensajeDeError } from "@/modules/shared/infrastructure/http/clienteHttp";
import { EXPORTADORES_TABLA, type FormatoExportacion } from "@/modules/shared/presentation/exportacion/exportadoresTabla";
import { useConsulta } from "@/modules/shared/presentation/hooks/useConsulta";
import { Aparicion } from "@/modules/shared/presentation/ui/Aparicion";
import { Boton } from "@/modules/shared/presentation/ui/Boton";
import { BotonDescarga } from "@/modules/shared/presentation/ui/BotonDescarga";
import { useNotificaciones } from "@/modules/shared/presentation/ui/Notificaciones";
import { ResultadoConsulta } from "@/modules/shared/presentation/ui/ResultadoConsulta";
import { EncabezadoPagina } from "@/modules/shared/presentation/ui/Superficies";
import type { PreNegociacionDto } from "../application/dto";
import { paisesFueraDelCatalogo } from "../domain/origenesImportacion";
import { apiPreNegociaciones } from "./apiPreNegociaciones";
import { reportePreNegociaciones } from "./exportacion/reportePreNegociaciones";
import { ModalFormularioPreNegociacion, modoNuevoRegistro, type ModoFormulario } from "./formulario/ModalFormularioPreNegociacion";
import { aplicarFiltros, FILTROS_INICIALES, type FiltrosPreNegociaciones } from "./listado/filtrosPreNegociaciones";
import { PanelFiltrosPreNegociaciones } from "./listado/PanelFiltrosPreNegociaciones";
import { TablaPreNegociaciones } from "./listado/TablaPreNegociaciones";
import { VistaMaestroDetalle } from "./listado/VistaMaestroDetalle";

export function PaginaCotizaciones() {
  const notificar = useNotificaciones();
  const { estado, recargar } = useConsulta(apiPreNegociaciones.listar);
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null);
  const [enTabla, setEnTabla] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosPreNegociaciones>(FILTROS_INICIALES);
  const [modo, setModo] = useState<ModoFormulario | null>(null);
  const [abriendoRegistro, setAbriendoRegistro] = useState(false);
  const [duplicando, setDuplicando] = useState(false);

  const filtradas = estado.tipo === "listo" ? aplicarFiltros(estado.datos, filtros) : [];
  const paisesAdicionales = estado.tipo === "listo" ? paisesFueraDelCatalogo(estado.datos.map((p) => p.pais)) : [];

  /** Con `origen`, el formulario se abre como copia editable de esa pre-negociación. */
  const abrirRegistro = async (origen?: PreNegociacionDto) => {
    const marcar = origen ? setDuplicando : setAbriendoRegistro;
    marcar(true);
    try {
      const { numero } = await apiPreNegociaciones.siguienteNumero();
      setModo(modoNuevoRegistro(numero, origen));
    } catch (error) {
      notificar({ tipo: "error", titulo: "No se pudo abrir el registro", mensaje: mensajeDeError(error) });
    } finally {
      marcar(false);
    }
  };

  const exportar = async (formato: FormatoExportacion) => {
    await EXPORTADORES_TABLA[formato](reportePreNegociaciones(filtradas));
    notificar({ tipo: "exito", titulo: "Exportación lista", mensaje: `Se exportaron ${filtradas.length} pre-negociación(es).` });
  };

  const alFallarExportacion = (error: unknown) =>
    notificar({ tipo: "error", titulo: "No se pudo exportar", mensaje: mensajeDeError(error) });

  const seleccionar = (preNegociacion: PreNegociacionDto) => {
    setSeleccionadaId(preNegociacion.id);
    setEnTabla(false);
  };

  const alGuardar = async (guardada: PreNegociacionDto) => {
    setModo(null);
    setSeleccionadaId(guardada.id);
    setEnTabla(false);
    await recargar();
  };

  const sinRegistros = filtradas.length === 0;

  return (
    <div className="space-y-6">
      <Aparicion orden={0}>
        <EncabezadoPagina
          icono={<HiOutlineDocumentCurrencyDollar />}
          titulo="Negociación"
          descripcion="Negociaciones con proveedores: tipo de carga, contactos, archivos y estados."
          acciones={
            <>
              <BotonDescarga
                variante="excel"
                icono={<FaFileExcel className="h-4 w-4" />}
                texto="Exportar a Excel"
                textoProceso="Exportando…"
                disabled={sinRegistros}
                alDescargar={() => exportar("excel")}
                alFallar={alFallarExportacion}
              />
              <BotonDescarga
                variante="pdf"
                icono={<FaFilePdf className="h-4 w-4" />}
                texto="Exportar a PDF"
                textoProceso="Exportando…"
                disabled={sinRegistros}
                alDescargar={() => exportar("pdf")}
                alFallar={alFallarExportacion}
              />
            </>
          }
        />
      </Aparicion>

      <ResultadoConsulta estado={estado} textoCargando="Cargando pre-negociaciones…" alReintentar={recargar}>
        {(preNegociaciones) => {
          const seleccionada = enTabla ? undefined : (filtradas.find((p) => p.id === seleccionadaId) ?? filtradas[0]);
          return (
            <div className="space-y-6">
              <Aparicion orden={1}>
                <PanelFiltrosPreNegociaciones filtros={filtros} alCambiar={setFiltros} paisesAdicionales={paisesAdicionales} />
              </Aparicion>

              <Aparicion orden={2}>
                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-superficie shadow-sm">
                  <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zeus-celeste text-zeus-tinta">
                        <HiOutlineListBullet className="h-[18px] w-[18px]" />
                      </span>
                      <div>
                        <h2 className="font-display text-[15px] font-semibold text-slate-900">Pre-negociaciones</h2>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                          {filtradas.length === preNegociaciones.length ? filtradas.length : `${filtradas.length} de ${preNegociaciones.length}`} registro(s)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Boton variante="primario" icono={<HiOutlinePlus />} cargando={abriendoRegistro} onClick={() => void abrirRegistro()}>
                        Registrar
                      </Boton>
                    </div>
                  </header>

                  <AnimatePresence mode="wait" initial={false}>
                    {seleccionada ? (
                      <motion.div key="detalle" exit={{ opacity: 0, transition: { duration: 0.16 } }}>
                        <VistaMaestroDetalle
                          preNegociaciones={filtradas}
                          seleccionada={seleccionada}
                          listaVisible
                          alSeleccionar={seleccionar}
                          alEditar={(p) => setModo({ tipo: "edicion", apertura: Date.now(), preNegociacion: p })}
                          alDuplicar={(p) => void abrirRegistro(p)}
                          duplicando={duplicando}
                          alVolver={() => setEnTabla(true)}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="tabla"
                        className="p-4 sm:p-5"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
                        exit={{ opacity: 0, transition: { duration: 0.16 } }}
                      >
                        <TablaPreNegociaciones preNegociaciones={filtradas} alSeleccionar={seleccionar} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>
              </Aparicion>
            </div>
          );
        }}
      </ResultadoConsulta>

      <ModalFormularioPreNegociacion modo={modo} paisesAdicionales={paisesAdicionales} alCerrar={() => setModo(null)} alGuardar={alGuardar} />
    </div>
  );
}
