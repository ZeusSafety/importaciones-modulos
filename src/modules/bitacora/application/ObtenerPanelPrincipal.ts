import type { RepositorioPreNegociaciones } from "@/modules/pre-negociaciones/domain/RepositorioPreNegociaciones";
import {
  ESTADOS_PRE_NEGOCIACION,
  TIPOS_CARGA,
  type EstadoPreNegociacion,
  type TipoCarga,
} from "@/modules/pre-negociaciones/domain/valores";
import type { PreNegociacionDto } from "@/modules/pre-negociaciones/application/dto";
import type { RepositorioRequerimientos } from "@/modules/requerimientos-logistica/domain/RepositorioRequerimientos";
import type { EventoBitacora } from "../domain/EventoBitacora";
import type { RepositorioBitacora } from "../domain/RepositorioBitacora";

export const ESTADOS_COTIZACION_REPORTE = ["ACEPTADO", "CANCELADO", "POR DEFINIR"] as const;
type EstadoCotizacionReporte = (typeof ESTADOS_COTIZACION_REPORTE)[number];

export interface PanelPrincipalDto {
  readonly totales: {
    readonly preNegociaciones: number;
    readonly cotizaciones: number;
    readonly proveedores: number;
    readonly requerimientos: number;
  };
  readonly preNegociacionesPorEstado: Record<EstadoPreNegociacion, number>;
  readonly preNegociacionesPorTipoCarga: Record<TipoCarga, number>;
  readonly cotizacionesPorEstado: Record<EstadoCotizacionReporte, number>;
  readonly ultimasPreNegociaciones: PreNegociacionDto[];
  readonly eventosRecientes: EventoBitacora[];
}

const LIMITE_EVENTOS = 12;
const LIMITE_ULTIMAS = 5;

function contarPor<K extends string>(claves: readonly K[], valores: K[]): Record<K, number> {
  const conteo = Object.fromEntries(claves.map((clave) => [clave, 0])) as Record<K, number>;
  for (const valor of valores) conteo[valor] += 1;
  return conteo;
}

export class ObtenerPanelPrincipal {
  constructor(
    private readonly preNegociaciones: RepositorioPreNegociaciones,
    private readonly requerimientos: RepositorioRequerimientos,
    private readonly bitacora: RepositorioBitacora,
  ) {}

  async ejecutar(): Promise<PanelPrincipalDto> {
    const [preNegociaciones, requerimientos, eventosRecientes] = await Promise.all([
      this.preNegociaciones.listar(),
      this.requerimientos.listar(),
      this.bitacora.listarRecientes(LIMITE_EVENTOS),
    ]);
    const registros = preNegociaciones.map((p) => p.aPrimitivos());
    const cotizaciones = registros.flatMap((p) => p.cotizaciones);

    return {
      totales: {
        preNegociaciones: registros.length,
        cotizaciones: cotizaciones.length,
        proveedores: new Set(cotizaciones.map((c) => c.proveedor)).size,
        requerimientos: requerimientos.length,
      },
      preNegociacionesPorEstado: contarPor(
        ESTADOS_PRE_NEGOCIACION,
        registros.map((p) => p.estado),
      ),
      preNegociacionesPorTipoCarga: contarPor(
        TIPOS_CARGA,
        registros.map((p) => p.tipoCarga),
      ),
      cotizacionesPorEstado: contarPor(
        ESTADOS_COTIZACION_REPORTE,
        cotizaciones.map((c) => (c.estado === null ? "POR DEFINIR" : c.estado)),
      ),
      ultimasPreNegociaciones: [...registros]
        .sort((a, b) => b.actualizadoEn.localeCompare(a.actualizadoEn))
        .slice(0, LIMITE_ULTIMAS),
      eventosRecientes,
    };
  }
}
