"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, type FormEvent, type ReactNode } from "react";
import {
  HiCheck,
  HiOutlineBuildingOffice2,
  HiOutlineCalendarDays,
  HiOutlineCheckBadge,
  HiOutlineClock,
  HiOutlineCube,
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlineUserCircle,
} from "react-icons/hi2";
import { formatearFechaHora } from "@/modules/shared/domain/fechas";
import { mensajeDeError } from "@/modules/shared/infrastructure/http/clienteHttp";
import { Boton } from "@/modules/shared/presentation/ui/Boton";
import { Campo, EntradaTexto } from "@/modules/shared/presentation/ui/Formulario";
import { Modal } from "@/modules/shared/presentation/ui/Modal";
import { useNotificaciones } from "@/modules/shared/presentation/ui/Notificaciones";
import { BotonFirma } from "@/modules/shared/presentation/ui/BotonFirma";
import type { RequerimientoLogisticaDto } from "../application/dto";
import { apiRequerimientos } from "./apiRequerimientos";

const ID_FORMULARIO = "formulario-aprobar-requerimiento";
/** La animación de carga se ve al menos este tiempo para que no parpadee. */
const DURACION_MINIMA_CARGA = 900;
const DURACION_EXITO = 1300;

type Fase = "formulario" | "aprobando" | "aprobado";

const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

function DatoResumen({ icono, etiqueta, valor }: { icono: ReactNode; etiqueta: string; valor: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-superficie p-3 shadow-sm">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zeus-celeste text-lg text-zeus-tinta">{icono}</span>
      <div className="min-w-0">
        <p className="font-display text-[10px] font-semibold uppercase tracking-wide text-slate-500">{etiqueta}</p>
        <p className="truncate text-[13px] font-bold text-slate-800" title={valor}>
          {valor}
        </p>
      </div>
    </div>
  );
}

function CapaProgreso({ fase, codigo }: { fase: Exclude<Fase, "formulario">; codigo: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-2xl bg-superficie/90 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        {fase === "aprobando" ? (
          <motion.div key="cargando" exit={{ scale: 0.6, opacity: 0 }} className="relative h-20 w-20">
            <span className="absolute inset-0 rounded-full border-4 border-[#10b981]/15" />
            <motion.span
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#10b981] border-r-[#10b981]"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            />
            <motion.span
              className="absolute inset-0 flex items-center justify-center text-3xl text-[#059669]"
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ repeat: Infinity, duration: 1.1 }}
            >
              <HiOutlineCheckBadge />
            </motion.span>
          </motion.div>
        ) : (
          <motion.div
            key="exito"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 16 }}
            className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] text-4xl text-white shadow-lg shadow-emerald-500/40"
          >
            <motion.span
              className="absolute inset-0 rounded-full border-4 border-[#10b981]"
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 1.7, opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
            <HiCheck />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="text-center">
        <p className="font-display text-base font-bold text-slate-900">{fase === "aprobando" ? "Aprobando requerimiento…" : "¡Requerimiento aprobado!"}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {fase === "aprobando" ? `Registrando la aprobación de ${codigo}` : "El PDF ya incluye la aprobación."}
        </p>
      </div>
    </motion.div>
  );
}

interface PropsModalAprobar {
  requerimiento: RequerimientoLogisticaDto | null;
  alCerrar: () => void;
  alAprobar: (aprobado: RequerimientoLogisticaDto) => void;
}

export function ModalAprobarRequerimiento({ requerimiento, alCerrar, alAprobar }: PropsModalAprobar) {
  const notificar = useNotificaciones();
  const [aprobadoPor, setAprobadoPor] = useState("");
  const [firma, setFirma] = useState<string | null>(null);
  const [fase, setFase] = useState<Fase>("formulario");
  const ocupado = fase !== "formulario";

  const reiniciar = () => {
    setAprobadoPor("");
    setFirma(null);
    setFase("formulario");
  };

  const cerrar = () => {
    if (ocupado) return;
    reiniciar();
    alCerrar();
  };

  const aprobar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!requerimiento) return;
    if (aprobadoPor.trim() === "") {
      notificar({ tipo: "error", titulo: "Falta el aprobador", mensaje: "Ingrese quién aprueba el requerimiento." });
      return;
    }
    setFase("aprobando");
    try {
      const [aprobado] = await Promise.all([apiRequerimientos.aprobar(requerimiento.id, { aprobadoPor, firma }), esperar(DURACION_MINIMA_CARGA)]);
      setFase("aprobado");
      await esperar(DURACION_EXITO);
      notificar({
        tipo: "exito",
        titulo: "Requerimiento aprobado",
        mensaje: `${aprobado.codigo} fue aprobado correctamente. Su PDF ya incluye la aprobación.`,
      });
      reiniciar();
      alAprobar(aprobado);
    } catch (error) {
      setFase("formulario");
      notificar({ tipo: "error", titulo: "No se pudo aprobar", mensaje: mensajeDeError(error) });
    }
  };

  return (
    <Modal
      abierto={requerimiento !== null}
      alCerrar={cerrar}
      titulo={requerimiento ? `Aprobar ${requerimiento.codigo}` : "Aprobar requerimiento"}
      subtitulo="Al aprobar, el nombre (y la firma, si la agrega) se imprimen en APROBADO POR del PDF."
      icono={<HiOutlineCheckBadge />}
      tamano="grande"
      pie={
        <>
          <Boton variante="secundario" onClick={cerrar} disabled={ocupado}>
            Cancelar
          </Boton>
          <Boton variante="exito" type="submit" form={ID_FORMULARIO} icono={<HiOutlineCheckBadge />} cargando={ocupado}>
            {ocupado ? "Aprobando…" : "Aprobar requerimiento"}
          </Boton>
        </>
      }
    >
      {requerimiento && (
        <div className="relative">
          <AnimatePresence>{ocupado && <CapaProgreso fase={fase === "aprobado" ? "aprobado" : "aprobando"} codigo={requerimiento.codigo} />}</AnimatePresence>
          <form id={ID_FORMULARIO} onSubmit={aprobar} className="space-y-5">
            <section>
              <h3 className="mb-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Resumen del requerimiento</h3>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                <DatoResumen icono={<HiOutlineCalendarDays />} etiqueta="Mes" valor={requerimiento.mes} />
                <DatoResumen icono={<HiOutlineBuildingOffice2 />} etiqueta="Área" valor={requerimiento.area} />
                <DatoResumen icono={<HiOutlineCube />} etiqueta="Productos" valor={`${requerimiento.detalles.length} producto(s)`} />
                <DatoResumen icono={<HiOutlinePencilSquare />} etiqueta="Elaborado por" valor={requerimiento.responsable} />
                <DatoResumen icono={<HiOutlineEye />} etiqueta="Revisado por" valor={requerimiento.revisadoPor} />
                <DatoResumen icono={<HiOutlineClock />} etiqueta="Registrado" valor={formatearFechaHora(requerimiento.fechaRegistro)} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-superficie p-4 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-slate-800">
                <HiOutlineCheckBadge className="h-5 w-5 text-zeus-tinta" /> Aprobación
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Campo etiqueta="Aprobado por" ayuda="Una vez aprobado no se puede cambiar el aprobador.">
                  {(id) => (
                    <div className="relative [&>input]:pl-9">
                      <HiOutlineUserCircle className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-zeus-tinta/70" />
                      <EntradaTexto id={id} autoFocus mayusculas valor={aprobadoPor} alCambiar={setAprobadoPor} placeholder="NOMBRE DE QUIEN APRUEBA" disabled={ocupado} />
                    </div>
                  )}
                </Campo>
                <Campo etiqueta="Firma digital" ayuda="Opcional. Sin firma, en el PDF sale solo el nombre.">
                  {(id) => (
                    <BotonFirma id={id} cargo="Aprobado por" firmante={aprobadoPor} valor={firma} alCambiar={setFirma} deshabilitado={ocupado} nivelModal={1} />
                  )}
                </Campo>
              </div>
            </section>
          </form>
        </div>
      )}
    </Modal>
  );
}
