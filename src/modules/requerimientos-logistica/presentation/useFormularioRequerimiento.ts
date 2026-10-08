"use client";

import { useState } from "react";
import type { Producto } from "@/modules/catalogo-productos/domain/Producto";
import type { RegistroRequerimientoDto } from "../application/dto";
import type { DatosPdfRequerimiento } from "../application/GeneradorPdfRequerimiento";
import type { Area, Disponibilidad, Mes } from "../domain/valores";

export interface CabeceraRequerimiento {
  mes: Mes | "";
  area: Area | "";
  responsable: string;
  revisadoPor: string;
  firmaResponsable: string | null;
  firmaRevisor: string | null;
  observaciones: string;
}

export interface DetalleFormulario {
  producto: Producto;
  disponible: Disponibilidad;
}

const CABECERA_VACIA: CabeceraRequerimiento = {
  mes: "",
  area: "",
  responsable: "",
  revisadoPor: "",
  firmaResponsable: null,
  firmaRevisor: null,
  observaciones: "",
};

type ResultadoValidacion =
  | { valido: true; registro: RegistroRequerimientoDto; vistaPrevia: Omit<DatosPdfRequerimiento, "codigo" | "fecha" | "aprobacion"> }
  | { valido: false; errores: string[] };

export function useFormularioRequerimiento() {
  const [cabecera, setCabecera] = useState<CabeceraRequerimiento>(CABECERA_VACIA);
  const [detalles, setDetalles] = useState<DetalleFormulario[]>([]);
  /** Código del requerimiento del que se copió el formulario, si es un duplicado. */
  const [duplicadoDe, setDuplicadoDe] = useState<string | null>(null);

  const actualizarCabecera = <K extends keyof CabeceraRequerimiento>(campo: K, valor: CabeceraRequerimiento[K]) =>
    setCabecera((actual) => ({ ...actual, [campo]: valor }));

  const agregarDetalle = (detalle: DetalleFormulario) => setDetalles((actuales) => [...actuales, detalle]);

  const quitarDetalle = (codigo: string) =>
    setDetalles((actuales) => actuales.filter((detalle) => detalle.producto.codigo !== codigo));

  const reiniciar = () => {
    setCabecera(CABECERA_VACIA);
    setDetalles([]);
    setDuplicadoDe(null);
  };

  const cargarDuplicado = (codigoOrigen: string, nuevaCabecera: CabeceraRequerimiento, nuevosDetalles: DetalleFormulario[]) => {
    setCabecera(nuevaCabecera);
    setDetalles(nuevosDetalles);
    setDuplicadoDe(codigoOrigen);
  };

  const validar = (): ResultadoValidacion => {
    const errores: string[] = [];
    if (cabecera.mes === "") errores.push("Seleccione el MES.");
    if (cabecera.area === "") errores.push("Seleccione el ÁREA.");
    if (cabecera.responsable.trim() === "") errores.push("Ingrese el RESPONSABLE.");
    if (cabecera.revisadoPor.trim() === "") errores.push("Ingrese REVISADO POR.");
    if (detalles.length === 0) errores.push("Agregue al menos un producto.");
    if (errores.length > 0 || cabecera.mes === "" || cabecera.area === "") return { valido: false, errores };

    const texto = {
      mes: cabecera.mes,
      area: cabecera.area,
      responsable: cabecera.responsable.trim(),
      revisadoPor: cabecera.revisadoPor.trim(),
      firmaResponsable: cabecera.firmaResponsable,
      firmaRevisor: cabecera.firmaRevisor,
      observaciones: cabecera.observaciones.trim(),
    };
    return {
      valido: true,
      registro: {
        ...texto,
        detalles: detalles.map(({ producto, disponible }) => ({ codigo: producto.codigo, disponible })),
      },
      vistaPrevia: {
        ...texto,
        detalles: detalles.map(({ producto, disponible }, indice) => ({
          item: indice + 1,
          codigo: producto.codigo,
          producto: producto.nombre,
          stockActual: producto.stockActual,
          stockMinimo: producto.stockMinimo,
          disponible,
        })),
      },
    };
  };

  return {
    cabecera,
    detalles,
    duplicadoDe,
    actualizarCabecera,
    agregarDetalle,
    quitarDetalle,
    reiniciar,
    cargarDuplicado,
    validar,
  };
}
