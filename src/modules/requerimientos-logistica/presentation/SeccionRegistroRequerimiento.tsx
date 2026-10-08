"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  HiOutlineArchiveBox,
  HiOutlineArrowTrendingDown,
  HiOutlineClipboardDocumentList,
  HiOutlineCube,
  HiOutlineDocumentDuplicate,
  HiOutlineDocumentText,
  HiOutlinePlus,
  HiOutlineQrCode,
  HiOutlineTrash,
  HiOutlineXMark,
} from "react-icons/hi2";
import type { Producto } from "@/modules/catalogo-productos/domain/Producto";
import { Boton } from "@/modules/shared/presentation/ui/Boton";
import { BotonFirma } from "@/modules/shared/presentation/ui/BotonFirma";
import { AreaTextoMayusculas, Campo, EntradaTexto, ValorSoloLectura } from "@/modules/shared/presentation/ui/Formulario";
import { Insignia } from "@/modules/shared/presentation/ui/Insignia";
import { useNotificaciones } from "@/modules/shared/presentation/ui/Notificaciones";
import { Selector } from "@/modules/shared/presentation/ui/Selector";
import { EstadoVacio, TarjetaSeccion } from "@/modules/shared/presentation/ui/Superficies";
import { AREAS, MESES, type Disponibilidad } from "../domain/valores";
import { BuscadorProducto } from "./BuscadorProducto";
import { SelectorDisponibilidad } from "./SelectorDisponibilidad";
import type { useFormularioRequerimiento } from "./useFormularioRequerimiento";

interface PropsSeccionRegistro {
  formulario: ReturnType<typeof useFormularioRequerimiento>;
  preparandoVistaPrevia: boolean;
  alSolicitarVistaPrevia: () => void;
}

export function SeccionRegistroRequerimiento({ formulario, preparandoVistaPrevia, alSolicitarVistaPrevia }: PropsSeccionRegistro) {
  const notificar = useNotificaciones();
  const { cabecera, detalles, duplicadoDe, actualizarCabecera, agregarDetalle, quitarDetalle, reiniciar } = formulario;
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [disponible, setDisponible] = useState<Disponibilidad | "">("");
  const [versionBuscador, setVersionBuscador] = useState(0);

  const codigosAgregados = new Set(detalles.map((detalle) => detalle.producto.codigo));
  const puedeAgregar = productoSeleccionado !== null && disponible !== "";
  const stockBajo = productoSeleccionado !== null && productoSeleccionado.stockActual < productoSeleccionado.stockMinimo;

  const agregar = () => {
    if (productoSeleccionado === null || disponible === "") return;
    agregarDetalle({ producto: productoSeleccionado, disponible });
    notificar({
      tipo: "exito",
      titulo: "Producto agregado",
      mensaje: `${productoSeleccionado.nombre} se agregó correctamente al requerimiento.`,
    });
    setProductoSeleccionado(null);
    setDisponible("");
    setVersionBuscador((version) => version + 1);
  };

  return (
    <TarjetaSeccion
      icono={<HiOutlineClipboardDocumentList />}
      titulo="Registro de requerimientos"
      subtitulo="Control mensual de stock"
    >
      <AnimatePresence initial={false}>
        {duplicadoDe !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mb-5 flex flex-wrap items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white shadow-md shadow-violet-500/30">
                <HiOutlineDocumentDuplicate className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1 text-xs leading-relaxed text-slate-600">
                <p className="font-display text-sm font-semibold text-slate-900">Copia de {duplicadoDe}</p>
                Se copiaron la cabecera y los productos con el stock actual del catálogo; el mes pasó al siguiente y las firmas
                quedan vacías. Edite lo que necesite antes de registrar; el original no se modifica.
              </div>
              <Boton variante="fantasma" tamano="chico" icono={<HiOutlineXMark />} onClick={reiniciar}>
                Descartar copia
              </Boton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Campo etiqueta="Mes">
          {(id) => (
            <Selector id={id} valor={cabecera.mes} opciones={MESES} marcador="Seleccione el mes" alCambiar={(mes) => actualizarCabecera("mes", mes)} />
          )}
        </Campo>
        <Campo etiqueta="Área">
          {(id) => (
            <Selector id={id} valor={cabecera.area} opciones={AREAS} marcador="Seleccione el área" alCambiar={(area) => actualizarCabecera("area", area)} />
          )}
        </Campo>
        <Campo etiqueta="Responsable">
          {(id) => <EntradaTexto id={id} mayusculas valor={cabecera.responsable} alCambiar={(v) => actualizarCabecera("responsable", v)} placeholder="NOMBRE DEL RESPONSABLE" />}
        </Campo>
        <Campo etiqueta="Revisado por">
          {(id) => <EntradaTexto id={id} mayusculas valor={cabecera.revisadoPor} alCambiar={(v) => actualizarCabecera("revisadoPor", v)} placeholder="NOMBRE DEL REVISOR" />}
        </Campo>
        <Campo etiqueta="Observaciones / comentarios" className="md:col-span-2">
          {(id) => (
            <AreaTextoMayusculas id={id} filas={2} redimensionable valor={cabecera.observaciones} alCambiar={(v) => actualizarCabecera("observaciones", v)} placeholder="OBSERVACIONES O COMENTARIOS DEL REQUERIMIENTO" />
          )}
        </Campo>
        <Campo etiqueta="Firma del responsable" ayuda="Opcional. Sin firma, en el PDF sale solo el nombre.">
          {(id) => (
            <BotonFirma
              id={id}
              cargo="Elaborado por"
              firmante={cabecera.responsable}
              valor={cabecera.firmaResponsable}
              alCambiar={(firma) => actualizarCabecera("firmaResponsable", firma)}
            />
          )}
        </Campo>
        <Campo etiqueta="Firma del revisor" ayuda="Opcional. Sin firma, en el PDF sale solo el nombre.">
          {(id) => (
            <BotonFirma
              id={id}
              cargo="Revisado por"
              firmante={cabecera.revisadoPor}
              valor={cabecera.firmaRevisor}
              alCambiar={(firma) => actualizarCabecera("firmaRevisor", firma)}
            />
          )}
        </Campo>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-zeus-azul/25 bg-zeus-celeste/30 p-4">
        <div className="mb-3 flex items-center gap-2">
          <HiOutlineCube className="h-5 w-5 text-zeus-tinta" />
          <h3 className="font-display text-sm font-semibold text-slate-800">Detalle de productos</h3>
        </div>
        <div className="grid items-end gap-3 md:grid-cols-6 xl:grid-cols-12">
          <Campo etiqueta="Producto" className="md:col-span-6 xl:col-span-4">
            {(id) => (
              <BuscadorProducto key={versionBuscador} id={id} codigosAgregados={codigosAgregados} alSeleccionar={setProductoSeleccionado} />
            )}
          </Campo>
          <Campo etiqueta="Código" className="md:col-span-2 xl:col-span-2">
            {(id) => <ValorSoloLectura id={id} icono={<HiOutlineQrCode />} valor={productoSeleccionado ? productoSeleccionado.codigo : "—"} />}
          </Campo>
          <Campo etiqueta="Stock actual" className="md:col-span-2 xl:col-span-1">
            {(id) => (
              <ValorSoloLectura
                id={id}
                icono={<HiOutlineArchiveBox />}
                alerta={stockBajo}
                valor={productoSeleccionado ? String(productoSeleccionado.stockActual) : "—"}
              />
            )}
          </Campo>
          <Campo etiqueta="Stock mínimo" className="md:col-span-2 xl:col-span-1">
            {(id) => (
              <ValorSoloLectura id={id} icono={<HiOutlineArrowTrendingDown />} valor={productoSeleccionado ? String(productoSeleccionado.stockMinimo) : "—"} />
            )}
          </Campo>
          <Campo etiqueta="Disponible" className="md:col-span-3 xl:col-span-2">
            {(id) => <SelectorDisponibilidad id={id} valor={disponible} alCambiar={setDisponible} />}
          </Campo>
          <div className="md:col-span-3 xl:col-span-2">
            <Boton variante="primario" icono={<HiOutlinePlus />} disabled={!puedeAgregar} onClick={agregar} anchoCompleto>
              Agregar
            </Boton>
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="tabla-zeus w-full text-left text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3 text-center">Item</th>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3 text-center">Stock actual</th>
                <th className="px-4 py-3 text-center">Stock mínimo</th>
                <th className="px-4 py-3 text-center">Disponible</th>
                <th className="px-4 py-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence initial={false}>
                {detalles.map((detalle, indice) => (
                  <motion.tr
                    key={detalle.producto.codigo}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.22 }}
                    className="hover:bg-zeus-celeste/40"
                  >
                    <td className="px-4 py-2.5 text-center font-semibold text-slate-500">{indice + 1}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-700">{detalle.producto.codigo}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{detalle.producto.nombre}</td>
                    <td
                      className={`px-4 py-2.5 text-center tabular-nums ${detalle.producto.stockActual < detalle.producto.stockMinimo ? "font-semibold text-red-600" : "text-slate-700"}`}
                    >
                      {detalle.producto.stockActual}
                    </td>
                    <td className="px-4 py-2.5 text-center tabular-nums text-slate-700">{detalle.producto.stockMinimo}</td>
                    <td className="px-4 py-2.5 text-center">
                      <Insignia tono={detalle.disponible === "SI" ? "exito" : "peligro"} texto={detalle.disponible} />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        type="button"
                        aria-label={`Quitar ${detalle.producto.nombre}`}
                        onClick={() => quitarDetalle(detalle.producto.codigo)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {detalles.length === 0 && (
          <EstadoVacio icono={<HiOutlineCube />} titulo="Aún no hay productos" descripcion="Busque un producto, indique su disponibilidad y pulse Agregar." />
        )}
      </div>

      <div className="mt-5 flex justify-end">
        <Boton variante="primario" icono={<HiOutlineDocumentText />} cargando={preparandoVistaPrevia} onClick={alSolicitarVistaPrevia}>
          Registrar requerimiento
        </Boton>
      </div>
    </TarjetaSeccion>
  );
}
