import Link from "next/link";
import {
  HiOutlineArrowRight,
  HiOutlineBookOpen,
  HiOutlineBuildingOffice2,
  HiOutlineChartPie,
  HiOutlineClipboardDocumentCheck,
  HiOutlineClipboardDocumentList,
  HiOutlineCube,
  HiOutlineDocumentCurrencyDollar,
  HiOutlineGlobeAmericas,
  HiOutlineInboxStack,
} from "react-icons/hi2";
import { formatearFecha } from "@/modules/shared/domain/fechas";
import {
  ESTADOS_PRE_NEGOCIACION,
  etiquetaPreNegociacion,
  TIPOS_CARGA,
  type EstadoPreNegociacion,
  type TipoCarga,
} from "@/modules/pre-negociaciones/domain/valores";
import { TONO_ESTADO_PRE_NEGOCIACION } from "@/modules/pre-negociaciones/presentation/tonosEstado";
import { GraficoColumnas } from "@/modules/shared/presentation/graficos/GraficoColumnas";
import { GraficoDona } from "@/modules/shared/presentation/graficos/GraficoDona";
import { GraficoMedidor } from "@/modules/shared/presentation/graficos/GraficoMedidor";
import type { ColorGrafico, SerieGrafico } from "@/modules/shared/presentation/graficos/paleta";
import { RUTAS } from "@/modules/shared/presentation/layout/navegacion";
import { Aparicion } from "@/modules/shared/presentation/ui/Aparicion";
import { Insignia } from "@/modules/shared/presentation/ui/Insignia";
import { ContenedorTabla, EstadoVacio, TarjetaSeccion } from "@/modules/shared/presentation/ui/Superficies";
import { ESTADOS_COTIZACION_REPORTE, type PanelPrincipalDto } from "../application/ObtenerPanelPrincipal";
import { BannerBitacora } from "./BannerBitacora";
import { LineaTiempoBitacora } from "./LineaTiempoBitacora";
import { MapaOrigenes } from "./mapa/MapaOrigenes";
import { ResumenDespachos } from "./ResumenDespachos";
import { TarjetaIndicador } from "./TarjetaIndicador";

const COLOR_ESTADO_DESPACHO: Record<EstadoPreNegociacion, ColorGrafico> = {
  "EN PROCESO": "naranja",
  "EN PAUSA": "violeta",
  COMPLETADO: "verde",
  ANULADO: "rojo",
};

const COLOR_TIPO_CARGA: Record<TipoCarga, ColorGrafico> = {
  "1 CONTENEDOR 40 HQ": "azul",
  "1 CONTENEDOR 40 NOR": "celeste",
  "1 CONTENEDOR 20 ST": "violeta",
  CONSOLIDADO: "dorado",
};

const ETIQUETA_CORTA_TIPO_CARGA: Record<TipoCarga, string> = {
  "1 CONTENEDOR 40 HQ": "40' HQ",
  "1 CONTENEDOR 40 NOR": "40' NOR",
  "1 CONTENEDOR 20 ST": "20' ST",
  CONSOLIDADO: "CONSOLIDADO",
};

const COLOR_COTIZACION: Record<(typeof ESTADOS_COTIZACION_REPORTE)[number], ColorGrafico> = {
  ACEPTADO: "verde",
  CANCELADO: "rojo",
  "POR DEFINIR": "gris",
};

function series<K extends string>(claves: readonly K[], conteos: Record<K, number>, colores: Record<K, ColorGrafico>): SerieGrafico[] {
  return claves.map((clave) => ({ etiqueta: clave, descripcion: clave, valor: conteos[clave], color: colores[clave] }));
}

export function PanelPrincipal({ panel }: { panel: PanelPrincipalDto }) {
  const { totales } = panel;
  const seriesDespachos = series(ESTADOS_PRE_NEGOCIACION, panel.preNegociacionesPorEstado, COLOR_ESTADO_DESPACHO);
  const seriesTipoCarga = series(TIPOS_CARGA, panel.preNegociacionesPorTipoCarga, COLOR_TIPO_CARGA).map((serie, indice) => ({
    ...serie,
    etiqueta: ETIQUETA_CORTA_TIPO_CARGA[TIPOS_CARGA[indice]],
  }));
  const seriesCotizaciones = series(ESTADOS_COTIZACION_REPORTE, panel.cotizacionesPorEstado, COLOR_COTIZACION);
  const aceptadas = seriesCotizaciones[ESTADOS_COTIZACION_REPORTE.indexOf("ACEPTADO")];
  const porDefinir = seriesCotizaciones[ESTADOS_COTIZACION_REPORTE.indexOf("POR DEFINIR")];
  const cotizacionesPorProveedor = totales.proveedores === 0 ? "0.0" : (totales.cotizaciones / totales.proveedores).toFixed(1);

  return (
    <div className="space-y-6">
      <Aparicion orden={0}>
        <BannerBitacora />
      </Aparicion>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Aparicion orden={1}>
          <TarjetaIndicador
            acento="azul"
            icono={<HiOutlineClipboardDocumentList />}
            etiqueta="Pre-negociaciones"
            descripcion="Despachos por estado"
            valor={totales.preNegociaciones}
            unidad={totales.preNegociaciones === 1 ? "despacho" : "despachos"}
            ruta={RUTAS.tablero}
            pie={{ tipo: "distribucion", series: seriesDespachos }}
          />
        </Aparicion>
        <Aparicion orden={2}>
          <TarjetaIndicador
            acento="verde"
            icono={<HiOutlineDocumentCurrencyDollar />}
            etiqueta="Negociaciones"
            descripcion="Cotizaciones por resultado"
            valor={totales.cotizaciones}
            unidad={totales.cotizaciones === 1 ? "cotización" : "cotizaciones"}
            ruta={RUTAS.cotizaciones}
            pie={{ tipo: "distribucion", series: seriesCotizaciones }}
          />
        </Aparicion>
        <Aparicion orden={3}>
          <TarjetaIndicador
            acento="dorado"
            icono={<HiOutlineBuildingOffice2 />}
            etiqueta="Proveedores cotizados"
            descripcion="Proveedores distintos"
            valor={totales.proveedores}
            unidad={totales.proveedores === 1 ? "proveedor" : "proveedores"}
            ruta={RUTAS.cotizaciones}
            pie={{ tipo: "dato", etiqueta: "Promedio", valor: cotizacionesPorProveedor, detalle: "negociaciones por proveedor" }}
          />
        </Aparicion>
        <Aparicion orden={4}>
          <TarjetaIndicador
            acento="violeta"
            icono={<HiOutlineClipboardDocumentCheck />}
            etiqueta="Requerimientos importación"
            descripcion="Formatos de logística"
            valor={totales.requerimientos}
            unidad={totales.requerimientos === 1 ? "requerimiento" : "requerimientos"}
            ruta={RUTAS.requerimientosLogistica}
            pie={{ tipo: "dato", etiqueta: "Formato", valor: "REG_LOG", detalle: "requerimiento de logística" }}
          />
        </Aparicion>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Aparicion orden={5}>
          <TarjetaSeccion altoCompleto icono={<HiOutlineChartPie />} titulo="Estado de despachos" subtitulo="Pre-negociaciones por estado">
            <GraficoDona series={seriesDespachos} etiquetaTotal="Despachos" />
            <ResumenDespachos conteos={panel.preNegociacionesPorEstado} />
          </TarjetaSeccion>
        </Aparicion>
        <Aparicion orden={6}>
          <TarjetaSeccion altoCompleto icono={<HiOutlineCube />} titulo="Tipo de carga" subtitulo="Distribución de contenedores">
            <GraficoColumnas series={seriesTipoCarga} />
          </TarjetaSeccion>
        </Aparicion>
        <Aparicion orden={7}>
          <TarjetaSeccion
            altoCompleto
            icono={<HiOutlineInboxStack />}
            titulo="Negociaciones"
            subtitulo="Tasa de aceptación por proveedor"
            acciones={
              porDefinir.valor > 0 && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-display text-[11px] font-semibold text-slate-600">
                  {porDefinir.valor} por definir
                </span>
              )
            }
          >
            <GraficoMedidor series={seriesCotizaciones} destacada={aceptadas} etiquetaDestacada="Tasa de aceptación" />
          </TarjetaSeccion>
        </Aparicion>
      </div>

      <Aparicion orden={8}>
        <TarjetaSeccion
          icono={<HiOutlineGlobeAmericas />}
          titulo="Orígenes de importación"
          subtitulo="Pre-negociaciones por país y puerto de embarque"
        >
          <MapaOrigenes origenes={panel.origenes} />
        </TarjetaSeccion>
      </Aparicion>

      <div className="grid gap-6 xl:grid-cols-5">
        <Aparicion orden={9} className="xl:col-span-3">
          <TarjetaSeccion
            altoCompleto
            icono={<HiOutlineDocumentCurrencyDollar />}
            titulo="Últimas pre-negociaciones"
            subtitulo="Actualizadas recientemente"
            acciones={
              <Link href={RUTAS.cotizaciones} className="inline-flex items-center gap-1 text-xs font-semibold text-zeus-tinta hover:underline">
                Ver todas <HiOutlineArrowRight />
              </Link>
            }
          >
            {panel.ultimasPreNegociaciones.length === 0 ? (
              <EstadoVacio icono={<HiOutlineDocumentCurrencyDollar />} titulo="Sin pre-negociaciones" descripcion="Registre la primera desde el módulo Negociación." />
            ) : (
              <ContenedorTabla>
                <div className="overflow-x-auto">
                  <table className="tabla-zeus w-full text-left text-sm">
                    <thead>
                      <tr>
                        <th className="px-4 py-3">Pre-negociación</th>
                        <th className="px-4 py-3">Tipo carga</th>
                        <th className="px-4 py-3">Actualizado</th>
                        <th className="px-4 py-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {panel.ultimasPreNegociaciones.map((p) => (
                        <tr key={p.id} className="hover:bg-zeus-celeste/40">
                          <td className="px-4 py-3 font-display font-semibold text-zeus-tinta">{etiquetaPreNegociacion(p.numero)}</td>
                          <td className="px-4 py-3 text-slate-700">{p.tipoCarga}</td>
                          <td className="px-4 py-3 text-slate-500">{formatearFecha(p.actualizadoEn)}</td>
                          <td className="px-4 py-3">
                            <Insignia tono={TONO_ESTADO_PRE_NEGOCIACION[p.estado]} texto={p.estado} resaltada />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ContenedorTabla>
            )}
          </TarjetaSeccion>
        </Aparicion>

        <Aparicion orden={10} className="xl:col-span-2">
          <TarjetaSeccion
            altoCompleto
            icono={<HiOutlineBookOpen />}
            titulo="Bitácora"
            subtitulo="Actividad reciente del sistema"
            acciones={
              <span className="rounded-full bg-zeus-celeste px-2.5 py-1 font-display text-[11px] font-semibold text-zeus-tinta">
                {panel.eventosRecientes.length} eventos
              </span>
            }
          >
            {panel.eventosRecientes.length === 0 ? (
              <EstadoVacio icono={<HiOutlineBookOpen />} titulo="Sin actividad" descripcion="Las operaciones registradas aparecerán aquí." />
            ) : (
              <LineaTiempoBitacora eventos={panel.eventosRecientes} />
            )}
          </TarjetaSeccion>
        </Aparicion>
      </div>
    </div>
  );
}
