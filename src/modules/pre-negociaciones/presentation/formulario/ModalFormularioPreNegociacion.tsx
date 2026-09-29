"use client";

import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineDocumentCurrencyDollar,
  HiOutlineFlag,
  HiOutlineInboxStack,
  HiOutlinePlus,
} from "react-icons/hi2";
import { mensajeDeError } from "@/modules/shared/infrastructure/http/clienteHttp";
import { Boton } from "@/modules/shared/presentation/ui/Boton";
import { Campo, EntradaTexto, ValorSoloLectura } from "@/modules/shared/presentation/ui/Formulario";
import { Modal } from "@/modules/shared/presentation/ui/Modal";
import { useNotificaciones } from "@/modules/shared/presentation/ui/Notificaciones";
import { Selector } from "@/modules/shared/presentation/ui/Selector";
import type { PreNegociacionDto } from "../../application/dto";
import { esPaisImportacion, puertosDe } from "../../domain/origenesImportacion";
import { ESTADOS_PRE_NEGOCIACION, etiquetaPreNegociacion, TIPOS_CARGA } from "../../domain/valores";
import { apiPreNegociaciones } from "../apiPreNegociaciones";
import { SelectorPais } from "../SelectorPais";
import { TONO_ESTADO_PRE_NEGOCIACION } from "../tonosEstado";
import { convertirAGuardar, formularioDesde, formularioVacio, type CampoTextoCabecera } from "./modeloFormulario";
import { TarjetaCotizacion } from "./TarjetaCotizacion";
import { useFormularioPreNegociacion } from "./useFormularioPreNegociacion";

export type ModoFormulario =
  | { readonly tipo: "registro"; readonly apertura: number; readonly numero: number }
  | { readonly tipo: "edicion"; readonly apertura: number; readonly preNegociacion: PreNegociacionDto };

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
  const { formulario, despachar } = useFormularioPreNegociacion(() =>
    modo.tipo === "registro" ? formularioVacio() : formularioDesde(modo.preNegociacion),
  );
  const [guardando, setGuardando] = useState(false);

  const numero = modo.tipo === "registro" ? modo.numero : modo.preNegociacion.numero;
  const etiqueta = etiquetaPreNegociacion(numero);

  const texto = (campo: CampoTextoCabecera) => ({
    valor: formulario[campo],
    alCambiar: (valor: string) => despachar({ tipo: "texto", campo, valor }),
  });

  const guardar = async () => {
    const conversion = convertirAGuardar(formulario);
    if (!conversion.valido) {
      notificar({ tipo: "error", titulo: "Revise el formulario", mensaje: conversion.errores.join(" ") });
      return;
    }
    setGuardando(true);
    try {
      const guardada =
        modo.tipo === "registro"
          ? await apiPreNegociaciones.registrar(conversion.datos)
          : await apiPreNegociaciones.actualizar(modo.preNegociacion.id, conversion.datos);
      notificar({
        tipo: "exito",
        titulo: modo.tipo === "registro" ? "Pre-negociación registrada" : "Cambios guardados",
        mensaje: `${etiquetaPreNegociacion(guardada.numero)} se guardó correctamente.`,
      });
      alGuardar(guardada);
    } catch (error) {
      notificar({ tipo: "error", titulo: "No se pudo guardar", mensaje: mensajeDeError(error) });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      titulo={modo.tipo === "registro" ? "Registrar pre-negociación" : `Editar ${etiqueta}`}
      subtitulo="Complete los datos generales, añada las cotizaciones de cada proveedor y guarde."
      icono={<HiOutlineDocumentCurrencyDollar />}
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
              Añadir cotización
            </Boton>
          </div>

          {formulario.cotizaciones.length === 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
              <HiOutlineInboxStack className="h-6 w-6 text-slate-400" />
              Aún no hay cotizaciones. Pulse «Añadir cotización» para registrar un proveedor y sus contactos.
            </div>
          )}

          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {formulario.cotizaciones.map((cotizacion, indice) => (
                <TarjetaCotizacion
                  key={cotizacion.id}
                  cotizacion={cotizacion}
                  numero={indice + 1}
                  registradoPor={formulario.registradoPor}
                  despachar={despachar}
                />
              ))}
            </AnimatePresence>
          </div>
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
