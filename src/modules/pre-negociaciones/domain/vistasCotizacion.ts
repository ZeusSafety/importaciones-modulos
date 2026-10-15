export const IDS_VISTA_COTIZACION = ["proveedores", "agencias-carga", "agencia-aduanas"] as const;
export type VistaCotizacion = (typeof IDS_VISTA_COTIZACION)[number];

export interface ConfiguracionVistaCotizacion {
  readonly id: VistaCotizacion;
  readonly menu: string;
  readonly titulo: string;
  readonly descripcion: string;
  /** Nombre del campo en singular, tal como se muestra en el formulario. */
  readonly contraparte: string;
  readonly contrapartePlural: string;
  readonly articulo: "el" | "la";
  readonly placeholder: string;
  readonly ruta: string;
}

export const VISTAS_COTIZACION: readonly ConfiguracionVistaCotizacion[] = [
  {
    id: "proveedores",
    menu: "Proveedores",
    titulo: "Cotizaciones Proveedores",
    descripcion: "Cotizaciones con proveedores: tipo de carga, contactos, archivos y estados.",
    contraparte: "Proveedor",
    contrapartePlural: "Proveedores",
    articulo: "el",
    placeholder: "NOMBRE DEL PROVEEDOR",
    ruta: "/pre-negociacion/cotizaciones/proveedores",
  },
  {
    id: "agencias-carga",
    menu: "Agencias de Carga",
    titulo: "Cotizaciones Agencias de Carga",
    descripcion: "Cotizaciones con agencias de carga: tipo de carga, contactos, archivos y estados.",
    contraparte: "Agencia de carga",
    contrapartePlural: "Agencias de carga",
    articulo: "la",
    placeholder: "NOMBRE DE LA AGENCIA DE CARGA",
    ruta: "/pre-negociacion/cotizaciones/agencias-de-carga",
  },
  {
    id: "agencia-aduanas",
    menu: "Agencia de Aduanas",
    titulo: "Cotizaciones Agencia de Aduanas",
    descripcion: "Cotizaciones con agencias de aduanas: tipo de carga, contactos, archivos y estados.",
    contraparte: "Agencia de aduanas",
    contrapartePlural: "Agencias de aduanas",
    articulo: "la",
    placeholder: "NOMBRE DE LA AGENCIA DE ADUANAS",
    ruta: "/pre-negociacion/cotizaciones/agencia-de-aduanas",
  },
];

const POR_ID = new Map(VISTAS_COTIZACION.map((vista) => [vista.id, vista]));

export function esVistaCotizacion(valor: unknown): valor is VistaCotizacion {
  return typeof valor === "string" && POR_ID.has(valor as VistaCotizacion);
}

/** Los registros anteriores a estas vistas pertenecen a Proveedores. */
export function vistaDe(registro: { readonly vista?: VistaCotizacion }): VistaCotizacion {
  return esVistaCotizacion(registro.vista) ? registro.vista : "proveedores";
}

export function configuracionVista(vista: VistaCotizacion | undefined): ConfiguracionVistaCotizacion {
  return POR_ID.get(vistaDe({ vista })) ?? VISTAS_COTIZACION[0];
}
