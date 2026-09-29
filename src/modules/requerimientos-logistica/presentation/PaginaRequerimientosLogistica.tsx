"use client";

import { useState } from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa6";
import { HiOutlineArrowDownTray, HiOutlineCheckCircle, HiOutlineClipboardDocumentCheck } from "react-icons/hi2";
import { mensajeDeError } from "@/modules/shared/infrastructure/http/clienteHttp";
import { descargarArchivo, descargarUrl } from "@/modules/shared/presentation/descargarArchivo";
import { EXPORTADORES_TABLA, type FormatoExportacion } from "@/modules/shared/presentation/exportacion/exportadoresTabla";
import { useConsulta } from "@/modules/shared/presentation/hooks/useConsulta";
import { Aparicion } from "@/modules/shared/presentation/ui/Aparicion";
import { Boton } from "@/modules/shared/presentation/ui/Boton";
import { BotonDescarga } from "@/modules/shared/presentation/ui/BotonDescarga";
import { ModalVisorPdf } from "@/modules/shared/presentation/ui/ModalVisorPdf";
import { useNotificaciones } from "@/modules/shared/presentation/ui/Notificaciones";
import { ResultadoConsulta } from "@/modules/shared/presentation/ui/ResultadoConsulta";
import { EncabezadoPagina } from "@/modules/shared/presentation/ui/Superficies";
import type { RegistroRequerimientoDto, RequerimientoLogisticaDto } from "../application/dto";
import { apiRequerimientos } from "./apiRequerimientos";
import { ModalAprobarRequerimiento } from "./ModalAprobarRequerimiento";
import { reporteRequerimientos } from "./reporteRequerimientos";
import { SeccionRegistroRequerimiento } from "./SeccionRegistroRequerimiento";
import { SeccionRequerimientosRegistrados } from "./SeccionRequerimientosRegistrados";
import { useFormularioRequerimiento } from "./useFormularioRequerimiento";
import { generarUrlVistaPrevia } from "./vistaPreviaPdf";

interface VistaPrevia {
  codigo: string;
  url: string;
  registro: RegistroRequerimientoDto;
}

export function PaginaRequerimientosLogistica() {
  const notificar = useNotificaciones();
  const formulario = useFormularioRequerimiento();
  const { estado, recargar } = useConsulta(apiRequerimientos.listar);

  const [preparandoVistaPrevia, setPreparandoVistaPrevia] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState<VistaPrevia | null>(null);
  const [registrando, setRegistrando] = useState(false);
  const [visualizado, setVisualizado] = useState<RequerimientoLogisticaDto | null>(null);
  const [porAprobar, setPorAprobar] = useState<RequerimientoLogisticaDto | null>(null);

  const registrados = estado.tipo === "listo" ? estado.datos : [];

  const exportar = async (formato: FormatoExportacion) => {
    await EXPORTADORES_TABLA[formato](reporteRequerimientos(registrados));
    notificar({ tipo: "exito", titulo: "Exportación lista", mensaje: `Se exportaron ${registrados.length} requerimiento(s).` });
  };

  const alFallarExportacion = (error: unknown) =>
    notificar({ tipo: "error", titulo: "No se pudo exportar", mensaje: mensajeDeError(error) });

  const solicitarVistaPrevia = async () => {
    const validacion = formulario.validar();
    if (!validacion.valido) {
      notificar({ tipo: "error", titulo: "Complete el requerimiento", mensaje: validacion.errores.join(" ") });
      return;
    }
    setPreparandoVistaPrevia(true);
    try {
      const { codigo } = await apiRequerimientos.siguienteCodigo();
      const url = await generarUrlVistaPrevia({
        ...validacion.vistaPrevia,
        codigo,
        fecha: new Date().toISOString(),
        aprobacion: null,
      });
      setVistaPrevia({ codigo, url, registro: validacion.registro });
    } catch (error) {
      notificar({ tipo: "error", titulo: "No se pudo generar la vista previa", mensaje: mensajeDeError(error) });
    } finally {
      setPreparandoVistaPrevia(false);
    }
  };

  const cerrarVistaPrevia = () => {
    if (vistaPrevia) URL.revokeObjectURL(vistaPrevia.url);
    setVistaPrevia(null);
  };

  const registrar = async () => {
    if (!vistaPrevia) return;
    setRegistrando(true);
    try {
      const requerimiento = await apiRequerimientos.registrar(vistaPrevia.registro);
      descargarArchivo(apiRequerimientos.urlPdf(requerimiento.id, true));
      notificar({
        tipo: "exito",
        titulo: "Requerimiento registrado",
        mensaje: `Se registró ${requerimiento.codigo} y se descargó su PDF.`,
      });
      cerrarVistaPrevia();
      formulario.reiniciar();
      await recargar();
    } catch (error) {
      notificar({ tipo: "error", titulo: "No se pudo registrar", mensaje: mensajeDeError(error) });
    } finally {
      setRegistrando(false);
    }
  };

  return (
    <div className="space-y-6">
      <Aparicion orden={0}>
        <EncabezadoPagina
          icono={<HiOutlineClipboardDocumentCheck />}
          titulo="Requerimientos Logística"
          descripcion="Registre el control mensual de stock y genere el formato REG_LOG en PDF."
          acciones={
            <>
              <BotonDescarga
                variante="excel"
                icono={<FaFileExcel className="h-4 w-4" />}
                texto="Exportar a Excel"
                textoProceso="Exportando…"
                disabled={registrados.length === 0}
                alDescargar={() => exportar("excel")}
                alFallar={alFallarExportacion}
              />
              <BotonDescarga
                variante="pdf"
                icono={<FaFilePdf className="h-4 w-4" />}
                texto="Exportar a PDF"
                textoProceso="Exportando…"
                disabled={registrados.length === 0}
                alDescargar={() => exportar("pdf")}
                alFallar={alFallarExportacion}
              />
            </>
          }
        />
      </Aparicion>

      <Aparicion orden={1}>
        <SeccionRegistroRequerimiento
          formulario={formulario}
          preparandoVistaPrevia={preparandoVistaPrevia}
          alSolicitarVistaPrevia={solicitarVistaPrevia}
        />
      </Aparicion>

      <Aparicion orden={2}>
        <ResultadoConsulta estado={estado} textoCargando="Cargando requerimientos…" alReintentar={recargar}>
          {(requerimientos) => (
            <SeccionRequerimientosRegistrados requerimientos={requerimientos} alVer={setVisualizado} alAprobar={setPorAprobar} />
          )}
        </ResultadoConsulta>
      </Aparicion>

      <ModalAprobarRequerimiento
        requerimiento={porAprobar}
        alCerrar={() => setPorAprobar(null)}
        alAprobar={async () => {
          setPorAprobar(null);
          await recargar();
        }}
      />

      <ModalVisorPdf
        abierto={vistaPrevia !== null}
        alCerrar={cerrarVistaPrevia}
        titulo={vistaPrevia ? `Vista previa · ${vistaPrevia.codigo}` : "Vista previa"}
        subtitulo="Verifique los datos antes de registrar. El PDF se descargará automáticamente."
        url={vistaPrevia ? vistaPrevia.url : null}
        pie={
          <>
            <Boton variante="secundario" onClick={cerrarVistaPrevia} disabled={registrando}>
              Seguir editando
            </Boton>
            <Boton variante="exito" icono={<HiOutlineCheckCircle />} cargando={registrando} onClick={registrar}>
              Registrar y descargar PDF
            </Boton>
          </>
        }
      />

      <ModalVisorPdf
        abierto={visualizado !== null}
        alCerrar={() => setVisualizado(null)}
        titulo={visualizado ? `${visualizado.codigo}.pdf` : "Requerimiento"}
        subtitulo={visualizado ? `Responsable: ${visualizado.responsable} · Área: ${visualizado.area}` : ""}
        url={visualizado ? apiRequerimientos.urlPdf(visualizado.id, false) : null}
        pie={
          visualizado && (
            <BotonDescarga
              variante="primario"
              icono={<HiOutlineArrowDownTray className="h-4 w-4" />}
              texto="Descargar PDF"
              textoProceso="Descargando…"
              alDescargar={() => descargarUrl(apiRequerimientos.urlPdf(visualizado.id, true), `${visualizado.codigo}.pdf`)}
              alFallar={(error) => notificar({ tipo: "error", titulo: "No se pudo descargar", mensaje: mensajeDeError(error) })}
            />
          )
        }
      />
    </div>
  );
}
