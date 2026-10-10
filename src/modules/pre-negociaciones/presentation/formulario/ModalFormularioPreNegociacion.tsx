"use client";

import { useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineDocumentCurrencyDollar,
  HiOutlineDocumentDuplicate,
  HiOutlineFlag,
  HiOutlineInboxStack,
  HiOutlinePlus,
} from "react-icons/hi2";
import { ErrorHttp, esAlmacenamientoNoDisponible, mensajeDeError } from "@/modules/shared/infrastructure/http/clienteHttp";
import { leerBlobLocal } from "@/modules/shared/presentation/respaldoNavegador";
import { Boton } from "@/modules/shared/presentation/ui/Boton";
import { Campo, EntradaTexto, ValorSoloLectura } from "@/modules/shared/presentation/ui/Formulario";
import { Modal } from "@/modules/shared/presentation/ui/Modal";
import { useNotificaciones } from "@/modules/shared/presentation/ui/Notificaciones";
import { Selector } from "@/modules/shared/presentation/ui/Selector";
import { fechaHoraLocalAIso } from "@/modules/shared/domain/fechas";
import type { PreNegociacionDto } from "../../application/dto";
import { esPaisImportacion, puertosDe } from "../../domain/origenesImportacion";
import { PreNegociacion, type DatosPreNegociacion } from "../../domain/PreNegociacion";
import { ESTADOS_PRE_NEGOCIACION, etiquetaPreNegociacion, TIPOS_CARGA } from "../../domain/valores";
import { apiPreNegociaciones, esPreNegociacionLocal, guardarPreNegociacionLocal } from "../apiPreNegociaciones";
import { SelectorPais } from "../SelectorPais";
import { TONO_ESTADO_PRE_NEGOCIACION } from "../tonosEstado";
import { CarruselNegociaciones } from "./CarruselNegociaciones";
import { convertirAGuardar, formularioDesde, formularioDuplicado, formularioVacio, type CampoTextoCabecera } from "./modeloFormulario";
import { useFormularioPreNegociacion } from "./useFormularioPreNegociacion";

export type ModoFormulario =
  | { readonly tipo: "registro"; readonly apertura: number; readonly numero: number }
  /** Registro nuevo que parte de una copia editable de `origen`. */
  | { readonly tipo: "duplicado"; readonly apertura: number; readonly numero: number; readonly origen: PreNegociacionDto }
  | { readonly tipo: "edicion"; readonly apertura: number; readonly preNegociacion: PreNegociacionDto };

/** Modo para un registro nuevo; con `origen` arranca como copia editable. */
export function modoNuevoRegistro(numero: number, origen?: PreNegociacionDto): ModoFormulario {
  const apertura = Date.now();
  return origen ? { tipo: "duplicado", apertura, numero, origen } : { tipo: "registro", apertura, numero };
}

function formularioInicial(modo: ModoFormulario) {
  if (modo.tipo === "registro") return formularioVacio();
  if (modo.tipo === "duplicado") return formularioDuplicado(modo.origen);
  return formularioDesde(modo.preNegociacion);
}

interface PropsModalFormulario {
  modo: ModoFormulario | null;
  /** Países ingresados en registros previos que no están en el catálogo. */
  paisesAdicionales: readonly string[];
  alCerrar: () => void;
  alGuardar: (preNegociacion: PreNegociacionDto) => void;
}

/** Conserva el último modo abierto para que el contenido siga visible durante la animación de salida. */
export function ModalFormularioPreNegociacion({ modo, paisesAdicionales, alCerrar, alGuardar }: PropsModalFormulario) {
  const [modoVisible, setModoVisible] = useState(modo);
  if (modo !== null && modo !== modoVisible) setModoVisible(modo);

  if (modoVisible === null) return null;
  return (
    <FormularioPreNegociacion
      key={modoVisible.apertura}
      modo={modoVisible}
      abierto={modo !== null}
      paisesAdicionales={paisesAdicionales}
      alCerrar={alCerrar}
      alGuardar={alGuardar}
    />
  );
}

interface PropsFormulario {
  modo: ModoFormulario;
  abierto: boolean;
  paisesAdicionales: readonly string[];
  alCerrar: () => void;
  alGuardar: (preNegociacion: PreNegociacionDto) => void;
}

function FormularioPreNegociacion({ modo, abierto, paisesAdicionales, alCerrar, alGuardar }: PropsFormulario) {
  const notificar = useNotificaciones();
  const { formulario, despachar } = useFormularioPreNegociacion(() => formularioInicial(modo));
  const [guardando, setGuardando] = useState(false);

  const esNueva = modo.tipo !== "edicion";
  const numero = modo.tipo === "edicion" ? modo.preNegociacion.numero : modo.numero;
  const etiqueta = etiquetaPreNegociacion(numero);
  const tituloExito = esNueva ? "Pre-negociación registrada" : "Cambios guardados";

  const texto = (campo: CampoTextoCabecera) => ({
    valor: formulario[campo],
    alCambiar: (valor: string) => despachar({ tipo: "texto", campo, valor }),
  });

  const guardarEnNavegador = () => {
    if (formulario.tipoCarga === "") return null;
    const datos: DatosPreNegociacion = {
      tipoCarga: formulario.tipoCarga,
      productos: formulario.productos,
      pais: formulario.pais,
      puerto: formulario.puerto,
      registradoPor: formulario.registradoPor,
      estado: formulario.estado,
      cotizaciones: formulario.cotizaciones.map((cotizacion) => ({
        id: cotizacion.id,
        proveedor: cotizacion.proveedor,
        productos: cotizacion.productos,
        estado: cotizacion.estado === "" ? null : cotizacion.estado,
        contactos: cotizacion.contactos.map((contacto) => ({
          id: contacto.id,
          observaciones: contacto.observaciones,
          archivos: [...contacto.archivos],
          ...(contacto.fecha.tipo === "editable" ? { fechaHora: fechaHoraLocalAIso(contacto.fecha.valorLocal) } : {}),
        })),
      })),
    };
    const ahora = new Date().toISOString();
    const guardada =
      modo.tipo === "edicion"
        ? PreNegociacion.desdePrimitivos(modo.preNegociacion).actualizar(datos, ahora)
        : PreNegociacion.registrar(datos, { id: crypto.randomUUID(), numero: modo.numero, ahora });
    const primitivos = guardada.aPrimitivos();
    guardarPreNegociacionLocal(primitivos);
    return primitivos;
  };

  const guardar = async () => {
    const conversion = convertirAGuardar(formulario);
    if (!conversion.valido) {
      notificar({ tipo: "error", titulo: "Revise el formulario", mensaje: conversion.errores.join(" ") });
      return;
    }
    setGuardando(true);
    try {
      const idsArchivo = formulario.cotizaciones.flatMap((cotizacion) =>
        cotizacion.contactos.flatMap((contacto) => contacto.archivos.map((archivo) => archivo.id)),
      );
      const hayArchivoSoloEnNavegador = (await Promise.all(idsArchivo.map((id) => leerBlobLocal(id)))).some(Boolean);
      const edicionSoloLocal = modo.tipo === "edicion" && esPreNegociacionLocal(modo.preNegociacion.id);
      if (hayArchivoSoloEnNavegador || edicionSoloLocal) {
        const guardada = guardarEnNavegador();
        if (!guardada) return;
        notificar({
          tipo: "exito",
          titulo: tituloExito,
          mensaje: `${etiquetaPreNegociacion(guardada.numero)} quedó en este navegador. El servidor publicado no puede guardar archivos.`,
        });
        alGuardar(guardada);
        return;
      }
      const guardada =
        modo.tipo === "edicion"
          ? await apiPreNegociaciones.actualizar(modo.preNegociacion.id, conversion.datos)
          : await apiPreNegociaciones.registrar(conversion.datos);
      notificar({
        tipo: "exito",
        titulo: tituloExito,
        mensaje: `${etiquetaPreNegociacion(guardada.numero)} se guardó correctamente.`,
      });
      alGuardar(guardada);
    } catch (error) {
      const archivoInexistente = error instanceof ErrorHttp && error.message.includes("Uno de los archivos adjuntos no existe");
      if (esAlmacenamientoNoDisponible(error) || archivoInexistente) {
        try {
          const guardada = guardarEnNavegador();
          if (guardada) {
            notificar({
              tipo: "exito",
              titulo: tituloExito,
              mensaje: `${etiquetaPreNegociacion(guardada.numero)} quedó en este navegador. El servidor publicado no puede guardar archivos.`,
            });
            alGuardar(guardada);
            return;
          }
        } catch (falloLocal) {
          notificar({ tipo: "error", titulo: "No se pudo guardar", mensaje: mensajeDeError(falloLocal) });
          return;
        }
      }
      notificar({ tipo: "error", titulo: "No se pudo guardar", mensaje: mensajeDeError(error) });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      titulo={
        modo.tipo === "registro"
          ? "Registrar pre-negociación"
          : modo.tipo === "duplicado"
            ? `Duplicar ${etiquetaPreNegociacion(modo.origen.numero)}`
            : `Editar ${etiqueta}`
      }
      subtitulo="Complete los datos generales, añada la cotización de cada proveedor y guarde."
      icono={modo.tipo === "duplicado" ? <HiOutlineDocumentDuplicate /> : <HiOutlineDocumentCurrencyDollar />}
      tamano="completo"
      pie={
        <>
          <Boton variante="secundario" onClick={alCerrar} disabled={guardando}>
            Cancelar
          </Boton>
          <Boton variante="primario" icono={<HiOutlineCheckCircle />} cargando={guardando} onClick={guardar}>
            Guardar todo
          </Boton>
        </>
      }
    >
      <div className="space-y-6">
        {modo.tipo === "duplicado" && (
          <div className="flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white shadow-md shadow-violet-500/30">
              <HiOutlineDocumentDuplicate className="h-5 w-5" />
            </span>
            <div className="text-xs leading-relaxed text-slate-600">
              <p className="font-display text-sm font-semibold text-slate-900">
                Copia de {etiquetaPreNegociacion(modo.origen.numero)} · se guardará como {etiqueta}
              </p>
              Se copiaron los datos generales y los proveedores. El estado, los resultados, los contactos y los archivos empiezan
              de cero. Cambie lo que necesite antes de guardar; la original no se modifica.
            </div>
          </div>
        )}

        <section>
          <h3 className="mb-3 font-display text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Datos de la pre-negociación</h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Campo etiqueta="Pre-negociación">{(id) => <ValorSoloLectura id={id} valor={etiqueta} />}</Campo>
            <Campo etiqueta="Tipo carga">
              {(id) => (
                <Selector
                  id={id}
                  valor={formulario.tipoCarga}
                  opciones={TIPOS_CARGA}
                  marcador="Seleccione el tipo de carga"
                  alCambiar={(valor) => despachar({ tipo: "tipoCarga", valor })}
                />
              )}
            </Campo>
            <Campo etiqueta="Productos">
              {(id) => <EntradaTexto id={id} mayusculas placeholder="PRODUCTOS A IMPORTAR" {...texto("productos")} />}
            </Campo>
            <Campo etiqueta="País">
              {(id) => (
                <SelectorPais
                  id={id}
                  valor={formulario.pais}
                  paisesAdicionales={paisesAdicionales}
                  permitirNuevo
                  marcador="Seleccione el país de origen"
                  alCambiar={(valor) => despachar({ tipo: "pais", valor })}
                />
              )}
            </Campo>
            <Campo etiqueta="Puerto" ayuda={formulario.pais === "" ? "Primero seleccione el país." : undefined}>
              {(id) =>
                formulario.pais === "" || esPaisImportacion(formulario.pais) ? (
                  <Selector
                    id={id}
                    valor={formulario.puerto}
                    opciones={formulario.pais === "" ? [] : puertosDe(formulario.pais)}
                    marcador={formulario.pais === "" ? "Seleccione primero el país" : `Puertos de ${formulario.pais}`}
                    disabled={formulario.pais === ""}
                    alCambiar={(valor) => despachar({ tipo: "puerto", valor })}
                  />
                ) : (
                  <EntradaTexto
                    id={id}
                    mayusculas
                    valor={formulario.puerto}
                    alCambiar={(valor) => despachar({ tipo: "puerto", valor })}
                    placeholder={`PUERTO DE ${formulario.pais}`}
                  />
                )
              }
            </Campo>
            <Campo etiqueta="Registrado por" ayuda="También identifica a quien sube los archivos.">
              {(id) => <EntradaTexto id={id} mayusculas placeholder="NOMBRE DE QUIEN REGISTRA" {...texto("registradoPor")} />}
            </Campo>
          </div>
        </section>

        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              Cotizaciones ({formulario.cotizaciones.length})
            </h3>
            <Boton variante="advertencia" tamano="chico" icono={<HiOutlinePlus />} onClick={() => despachar({ tipo: "agregarCotizacion" })}>
              Añadir cotizaciones
            </Boton>
          </div>

          {formulario.cotizaciones.length === 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
              <HiOutlineInboxStack className="h-6 w-6 text-slate-400" />
              Aún no hay cotizaciones. Pulse «Añadir cotizaciones» para registrar un proveedor y sus contactos.
            </div>
          )}

          {formulario.cotizaciones.length > 0 && (
            <CarruselNegociaciones
              cotizaciones={formulario.cotizaciones}
              registradoPor={formulario.registradoPor}
              despachar={despachar}
            />
          )}
        </section>

        <section className="rounded-2xl border border-zeus-azul/15 bg-zeus-celeste/40 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zeus-azul text-white">
                <HiOutlineFlag className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-sm font-semibold text-slate-900">Estado de la pre-negociación</p>
                <p className="text-xs text-slate-500">Se inicia en proceso; cámbielo a completado o anulado cuando corresponda.</p>
              </div>
            </div>
            <div className="w-full sm:w-56">
              <Selector
                id="estado-pre-negociacion"
                valor={formulario.estado}
                opciones={ESTADOS_PRE_NEGOCIACION}
                tonos={TONO_ESTADO_PRE_NEGOCIACION}
                marcador="Seleccione el estado"
                alCambiar={(valor) => despachar({ tipo: "estado", valor })}
              />
            </div>
          </div>
        </section>
      </div>
    </Modal>
  );
}
