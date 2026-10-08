"use client";

import { useRef, useState } from "react";
import type { Producto } from "@/modules/catalogo-productos/domain/Producto";
import { FaFileExcel, FaFilePdf } from "react-icons/fa6";
import { HiOutlineArrowDownTray, HiOutlineCheckCircle, HiOutlineClipboardDocumentCheck } from "react-icons/hi2";
import { esAlmacenamientoNoDisponible, mensajeDeError } from "@/modules/shared/infrastructure/http/clienteHttp";
import { descargarArchivo, descargarBlob, descargarUrl } from "@/modules/shared/presentation/descargarArchivo";
import { EXPORTADORES_TABLA, type FormatoExportacion } from "@/modules/shared/presentation/exportacion/exportadoresTabla";
import { useConsulta } from "@/modules/shared/presentation/hooks/useConsulta";
import { Aparicion } from "@/modules/shared/presentation/ui/Aparicion";
import { Boton } from "@/modules/shared/presentation/ui/Boton";
import { BotonDescarga } from "@/modules/shared/presentation/ui/BotonDescarga";
import { ModalVisorPdf } from "@/modules/shared/presentation/ui/ModalVisorPdf";
import { useNotificaciones } from "@/modules/shared/presentation/ui/Notificaciones";
import { ResultadoConsulta } from "@/modules/shared/presentation/ui/ResultadoConsulta";
import { EncabezadoPagina } from "@/modules/shared/presentation/ui/Superficies";
import type { DatosPdfRequerimiento } from "../application/GeneradorPdfRequerimiento";
import type { RegistroRequerimientoDto, RequerimientoLogisticaDto } from "../application/dto";
import { AREAS, MESES, type Area, type Mes } from "../domain/valores";
import { RequerimientoLogistica, type DetalleRequerimiento } from "../domain/RequerimientoLogistica";
import { apiRequerimientos, esRequerimientoLocal, guardarRequerimientoLocal } from "./apiRequerimientos";
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
  datos: DatosPdfRequerimiento;
}

function requerimientoDesdeVista(datos: DatosPdfRequerimiento): RequerimientoLogisticaDto {
  const secuencia = Number(datos.codigo.replace(/\D/g, ""));
  return RequerimientoLogistica.registrar(
    {
      mes: datos.mes,
      area: datos.area as Area,
      responsable: datos.responsable,
      revisadoPor: datos.revisadoPor,
      firmaResponsable: datos.firmaResponsable,
      firmaRevisor: datos.firmaRevisor,
      observaciones: datos.observaciones,
      detalles: datos.detalles.map(({ codigo, producto, stockActual, stockMinimo, disponible }) => ({
        codigo,
        producto,
        stockActual,
        stockMinimo,
        disponible,
      })),
    },
    { id: crypto.randomUUID(), secuencia, fechaRegistro: datos.fecha },
  ).aPrimitivos();
}

function mesSiguiente(mes: Mes): Mes {
  return MESES[(MESES.indexOf(mes) + 1) % MESES.length];
}

/** Stock vigente del catálogo; si el producto ya no aparece, se conserva el del requerimiento original. */
async function productoActualizado(detalle: DetalleRequerimiento): Promise<Producto> {
  const respaldo: Producto = {
    codigo: detalle.codigo,
    nombre: detalle.producto,
    stockActual: detalle.stockActual,
    stockMinimo: detalle.stockMinimo,
  };
  try {
    const encontrados = await apiRequerimientos.buscarProductos(detalle.codigo);
    return encontrados.find((producto) => producto.codigo === detalle.codigo) ?? respaldo;
  } catch {
    return respaldo;
  }
}

export function PaginaRequerimientosLogistica() {
  const notificar = useNotificaciones();
  const formulario = useFormularioRequerimiento();
  const { estado, recargar } = useConsulta(apiRequerimientos.listar);

  const [preparandoVistaPrevia, setPreparandoVistaPrevia] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState<VistaPrevia | null>(null);
  const [registrando, setRegistrando] = useState(false);
  const [visualizado, setVisualizado] = useState<RequerimientoLogisticaDto | null>(null);
  const [urlVisualizado, setUrlVisualizado] = useState<string | null>(null);
  const [porAprobar, setPorAprobar] = useState<RequerimientoLogisticaDto | null>(null);
  const [duplicandoId, setDuplicandoId] = useState<string | null>(null);
  const seccionRegistro = useRef<HTMLDivElement>(null);

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
      const datos: DatosPdfRequerimiento = {
        ...validacion.vistaPrevia,
        codigo,
        fecha: new Date().toISOString(),
        aprobacion: null,
      };
      const url = await generarUrlVistaPrevia(datos);
      setVistaPrevia({ codigo, url, registro: validacion.registro, datos });
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

  const verRequerimiento = async (requerimiento: RequerimientoLogisticaDto) => {
    setVisualizado(requerimiento);
    setUrlVisualizado(null);
    if (!esRequerimientoLocal(requerimiento.id)) {
      setUrlVisualizado(apiRequerimientos.urlPdf(requerimiento.id, false));
      return;
    }
    const url = await generarUrlVistaPrevia({
      codigo: requerimiento.codigo,
      fecha: requerimiento.fechaRegistro,
      mes: requerimiento.mes,
      area: requerimiento.area,
      responsable: requerimiento.responsable,
      revisadoPor: requerimiento.revisadoPor,
      firmaResponsable: requerimiento.firmaResponsable,
      firmaRevisor: requerimiento.firmaRevisor,
      observaciones: requerimiento.observaciones,
      detalles: requerimiento.detalles,
      aprobacion: requerimiento.aprobacion,
    });
    setUrlVisualizado(url);
  };

  const cerrarVisualizado = () => {
    if (urlVisualizado?.startsWith("blob:")) URL.revokeObjectURL(urlVisualizado);
    setVisualizado(null);
    setUrlVisualizado(null);
  };

  const duplicar = async (origen: RequerimientoLogisticaDto) => {
    setDuplicandoId(origen.id);
    try {
      const productos = await Promise.all(origen.detalles.map(productoActualizado));
      const mes = mesSiguiente(origen.mes);
      formulario.cargarDuplicado(
        origen.codigo,
        {
          mes,
          area: (AREAS as readonly string[]).includes(origen.area) ? (origen.area as Area) : "",
          responsable: origen.responsable,
          revisadoPor: origen.revisadoPor,
          firmaResponsable: null,
          firmaRevisor: null,
          observaciones: origen.observaciones,
        },
        productos.map((producto, indice) => ({ producto, disponible: origen.detalles[indice].disponible })),
      );
      seccionRegistro.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      notificar({
        tipo: "exito",
        titulo: `${origen.codigo} duplicado`,
        mensaje: `Se copiaron ${productos.length} producto(s) para ${mes}. Revise y edite antes de registrar.`,
      });
    } finally {
      setDuplicandoId(null);
    }
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
      if (esAlmacenamientoNoDisponible(error)) {
        const requerimiento = requerimientoDesdeVista(vistaPrevia.datos);
        guardarRequerimientoLocal(requerimiento);
        await descargarUrl(vistaPrevia.url, `${vistaPrevia.codigo}.pdf`);
        notificar({
          tipo: "exito",
          titulo: "Requerimiento registrado",
          mensaje: `Se registró ${requerimiento.codigo} en este navegador y se descargó su PDF. El servidor publicado no puede guardar archivos, así que la lista queda en este equipo.`,
        });
        cerrarVistaPrevia();
        formulario.reiniciar();
        await recargar();
        return;
      }
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
          titulo="Requerimientos Importación"
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
        <div ref={seccionRegistro} className="scroll-mt-24">
          <SeccionRegistroRequerimiento
            formulario={formulario}
            preparandoVistaPrevia={preparandoVistaPrevia}
            alSolicitarVistaPrevia={solicitarVistaPrevia}
          />
        </div>
      </Aparicion>

      <Aparicion orden={2}>
        <ResultadoConsulta estado={estado} textoCargando="Cargando requerimientos…" alReintentar={recargar}>
          {(requerimientos) => (
            <SeccionRequerimientosRegistrados
              requerimientos={requerimientos}
              alVer={(requerimiento) => void verRequerimiento(requerimiento)}
              alAprobar={setPorAprobar}
              alDuplicar={(requerimiento) => void duplicar(requerimiento)}
              duplicandoId={duplicandoId}
            />
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
        alCerrar={cerrarVisualizado}
        titulo={visualizado ? `${visualizado.codigo}.pdf` : "Requerimiento"}
        subtitulo={visualizado ? `Responsable: ${visualizado.responsable} · Área: ${visualizado.area}` : ""}
        url={urlVisualizado}
        pie={
          visualizado && (
            <BotonDescarga
              variante="primario"
              icono={<HiOutlineArrowDownTray className="h-4 w-4" />}
              texto="Descargar PDF"
              textoProceso="Descargando…"
              alDescargar={async () => {
                if (esRequerimientoLocal(visualizado.id)) {
                  if (!urlVisualizado) return;
                  const respuesta = await fetch(urlVisualizado);
                  descargarBlob(await respuesta.blob(), `${visualizado.codigo}.pdf`);
                  return;
                }
                await descargarUrl(apiRequerimientos.urlPdf(visualizado.id, true), `${visualizado.codigo}.pdf`);
              }}
              alFallar={(error) => notificar({ tipo: "error", titulo: "No se pudo descargar", mensaje: mensajeDeError(error) })}
            />
          )
        }
      />
    </div>
  );
}
