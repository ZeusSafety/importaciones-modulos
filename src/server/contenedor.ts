import "server-only";
import { ObtenerArchivo, SubirArchivo } from "@/modules/archivos/application/CasosUsoArchivos";
import {
  AlmacenArchivosLocal,
  RepositorioArchivosJson,
} from "@/modules/archivos/infrastructure/AdaptadoresArchivosLocales";
import { ObtenerPanelPrincipal } from "@/modules/bitacora/application/ObtenerPanelPrincipal";
import { RegistradorBitacora } from "@/modules/bitacora/application/RegistradorBitacora";
import { RepositorioBitacoraJson } from "@/modules/bitacora/infrastructure/RepositorioBitacoraJson";
import { BuscarProductos } from "@/modules/catalogo-productos/application/BuscarProductos";
import { RepositorioProductosJson } from "@/modules/catalogo-productos/infrastructure/RepositorioProductosJson";
import {
  ActualizarPreNegociacion,
  ListarPreNegociaciones,
  ObtenerSiguienteNumeroPreNegociacion,
  RegistrarPreNegociacion,
} from "@/modules/pre-negociaciones/application/CasosUsoPreNegociaciones";
import { RepositorioPreNegociacionesJson } from "@/modules/pre-negociaciones/infrastructure/RepositorioPreNegociacionesJson";
import { AprobarRequerimientoLogistica } from "@/modules/requerimientos-logistica/application/AprobarRequerimientoLogistica";
import {
  GenerarPdfRequerimiento,
  ListarRequerimientosLogistica,
  ObtenerSiguienteCodigoRequerimiento,
} from "@/modules/requerimientos-logistica/application/ConsultasRequerimientos";
import { RegistrarRequerimientoLogistica } from "@/modules/requerimientos-logistica/application/RegistrarRequerimientoLogistica";
import { GeneradorPdfRequerimientoJspdf } from "@/modules/requerimientos-logistica/infrastructure/pdf/GeneradorPdfRequerimientoJspdf";
import { RepositorioRequerimientosJson } from "@/modules/requerimientos-logistica/infrastructure/RepositorioRequerimientosJson";
import { GeneradorIdCrypto, RelojSistema } from "@/modules/shared/infrastructure/sistema";

/** Raíz de composición: único lugar donde se conectan casos de uso con sus adaptadores. */
function crearContenedor() {
  const reloj = new RelojSistema();
  const generadorId = new GeneradorIdCrypto();

  const repositorioBitacora = new RepositorioBitacoraJson();
  const repositorioProductos = new RepositorioProductosJson();
  const repositorioRequerimientos = new RepositorioRequerimientosJson();
  const repositorioPreNegociaciones = new RepositorioPreNegociacionesJson();
  const repositorioArchivos = new RepositorioArchivosJson();
  const almacenArchivos = new AlmacenArchivosLocal();

  const bitacora = new RegistradorBitacora(repositorioBitacora, reloj, generadorId);

  return {
    panelPrincipal: {
      obtener: new ObtenerPanelPrincipal(repositorioPreNegociaciones, repositorioRequerimientos, repositorioBitacora),
    },
    productos: {
      buscar: new BuscarProductos(repositorioProductos),
    },
    requerimientos: {
      registrar: new RegistrarRequerimientoLogistica(
        repositorioRequerimientos,
        repositorioProductos,
        bitacora,
        reloj,
        generadorId,
      ),
      listar: new ListarRequerimientosLogistica(repositorioRequerimientos),
      siguienteCodigo: new ObtenerSiguienteCodigoRequerimiento(repositorioRequerimientos),
      aprobar: new AprobarRequerimientoLogistica(repositorioRequerimientos, bitacora, reloj),
      generarPdf: new GenerarPdfRequerimiento(repositorioRequerimientos, new GeneradorPdfRequerimientoJspdf()),
    },
    preNegociaciones: {
      registrar: new RegistrarPreNegociacion(
        repositorioPreNegociaciones,
        repositorioArchivos,
        bitacora,
        reloj,
        generadorId,
      ),
      actualizar: new ActualizarPreNegociacion(repositorioPreNegociaciones, repositorioArchivos, bitacora, reloj),
      listar: new ListarPreNegociaciones(repositorioPreNegociaciones),
      siguienteNumero: new ObtenerSiguienteNumeroPreNegociacion(repositorioPreNegociaciones),
    },
    archivos: {
      subir: new SubirArchivo(repositorioArchivos, almacenArchivos, reloj, generadorId),
      obtener: new ObtenerArchivo(repositorioArchivos, almacenArchivos),
    },
  };
}

export const contenedor = crearContenedor();
