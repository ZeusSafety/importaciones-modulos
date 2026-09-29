"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { HiCheck, HiChevronDown, HiChevronLeft, HiChevronRight, HiOutlineGlobeAlt, HiOutlineMagnifyingGlass, HiOutlinePlus } from "react-icons/hi2";
import { aMayusculas, normalizarBusqueda } from "@/modules/shared/domain/texto";
import { useDesplegable } from "@/modules/shared/presentation/hooks/useDesplegable";
import { useMontado } from "@/modules/shared/presentation/hooks/useMontado";
import { esPaisImportacion, esPaisPrincipal, OTROS_PAISES, PAISES_PRINCIPALES } from "../domain/origenesImportacion";
import { BanderaPais } from "./BanderaPais";

type Vista = "principales" | "otros";

interface OpcionTodos {
  readonly texto: string;
  readonly alElegir: () => void;
}

interface PropsSelectorPais {
  id: string;
  valor: string;
  alCambiar: (pais: string) => void;
  marcador: string;
  /** Países fuera del catálogo ya usados en registros; se listan dentro de «OTROS». */
  paisesAdicionales: readonly string[];
  /** Permite escribir en «OTROS» un país que aún no existe y agregarlo. */
  permitirNuevo: boolean;
  /** Añade una opción para quitar el país (usada en filtros); se muestra cuando `valor` está vacío. */
  opcionTodos?: OpcionTodos;
}

function IconoMundo() {
  return (
    <span className="flex h-4 w-6 shrink-0 items-center justify-center rounded-[3px] bg-zeus-celeste text-zeus-tinta">
      <HiOutlineGlobeAlt className="h-3.5 w-3.5" />
    </span>
  );
}

function Opcion({ activa, alElegir, children }: { activa: boolean; alElegir: () => void; children: ReactNode }) {
  return (
    <li role="option" aria-selected={activa}>
      <button
        type="button"
        onClick={alElegir}
        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${
          activa ? "bg-zeus-azul font-semibold text-white" : "text-slate-700 hover:bg-zeus-celeste hover:text-zeus-tinta"
        }`}
      >
        {children}
        {activa && <HiCheck className="ml-auto h-4 w-4 shrink-0 text-zeus-dorado" />}
      </button>
    </li>
  );
}

const DESPLAZAMIENTO_VISTA = 24;

export function SelectorPais({ id, valor, alCambiar, marcador, paisesAdicionales, permitirNuevo, opcionTodos }: PropsSelectorPais) {
  const montado = useMontado();
  const desplegable = useDesplegable<HTMLButtonElement>({ alturaMaxima: 340, alturaMinimaHaciaAbajo: 260 });
  const { disparador, panel, posicion, abierto, cerrar } = desplegable;
  const [vista, setVista] = useState<Vista>("principales");
  const [busqueda, setBusqueda] = useState("");

  const otros = [...OTROS_PAISES, ...paisesAdicionales.filter((pais) => !esPaisImportacion(pais))];
  const valorEsOtro = valor !== "" && !esPaisPrincipal(valor);
  const buscado = normalizarBusqueda(busqueda);
  const otrosVisibles = otros.filter((pais) => normalizarBusqueda(pais).includes(buscado));
  const nuevo = busqueda.trim();
  const puedeAgregar =
    permitirNuevo && nuevo !== "" && ![...PAISES_PRINCIPALES, ...otros].some((pais) => normalizarBusqueda(pais) === normalizarBusqueda(nuevo));

  const abrir = () => {
    setVista(valorEsOtro ? "otros" : "principales");
    setBusqueda("");
    desplegable.abrir();
  };

  const alPresionarEnBusqueda = (evento: KeyboardEvent<HTMLInputElement>) => {
    if (evento.key !== "Enter") return;
    evento.preventDefault();
    if (otrosVisibles.length === 1) elegir(otrosVisibles[0]);
    else if (puedeAgregar) elegir(nuevo);
  };

  const elegir = (pais: string) => {
    alCambiar(pais);
    cerrar(true);
  };

  const elegirTodos = (opcion: OpcionTodos) => {
    opcion.alElegir();
    cerrar(true);
  };

  return (
    <>
      <button
        ref={disparador}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={abierto}
        onClick={() => (abierto ? cerrar(true) : abrir())}
        className={`flex h-10 w-full items-center justify-between gap-2 rounded-lg border bg-superficie px-3 text-left text-sm shadow-sm outline-none transition ${
          abierto ? "border-zeus-azul ring-4 ring-zeus-azul/10" : "border-slate-300 hover:border-zeus-azul/50 focus-visible:border-zeus-azul focus-visible:ring-4 focus-visible:ring-zeus-azul/10"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {valor !== "" ? (
            <>
              <BanderaPais pais={valor} />
              <span className="truncate font-medium text-slate-900">{valor}</span>
            </>
          ) : opcionTodos ? (
            <>
              <IconoMundo />
              <span className="truncate font-medium text-slate-900">{opcionTodos.texto}</span>
            </>
          ) : (
            <span className="truncate text-slate-400">{marcador}</span>
          )}
        </span>
        <HiChevronDown className={`h-4 w-4 shrink-0 text-zeus-tinta transition-transform duration-200 ${abierto ? "rotate-180" : ""}`} />
      </button>

      {montado &&
        createPortal(
          <AnimatePresence>
            {posicion && (
              <motion.div
                ref={panel}
                initial={{ opacity: 0, y: posicion.haciaArriba ? 6 : -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } }}
                exit={{ opacity: 0, y: posicion.haciaArriba ? 4 : -4, scale: 0.98, transition: { duration: 0.12 } }}
                style={{
                  left: posicion.left,
                  width: posicion.width,
                  top: posicion.top,
                  bottom: posicion.bottom,
                  maxHeight: posicion.alturaMaxima,
                  transformOrigin: posicion.haciaArriba ? "bottom" : "top",
                }}
                className="fixed z-[90] flex min-w-56 flex-col overflow-hidden rounded-xl border border-slate-200 bg-superficie shadow-[0_12px_32px_rgba(0,45,90,0.16)]"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {vista === "principales" ? (
                    <motion.ul
                      key="principales"
                      role="listbox"
                      initial={{ opacity: 0, x: -DESPLAZAMIENTO_VISTA }}
                      animate={{ opacity: 1, x: 0, transition: { duration: 0.18 } }}
                      exit={{ opacity: 0, x: -DESPLAZAMIENTO_VISTA, transition: { duration: 0.12 } }}
                      className="scroll-zeus overflow-y-auto p-1.5"
                    >
                      {opcionTodos && (
                        <Opcion activa={valor === ""} alElegir={() => elegirTodos(opcionTodos)}>
                          <IconoMundo />
                          {opcionTodos.texto}
                        </Opcion>
                      )}
                      {PAISES_PRINCIPALES.map((pais) => (
                        <Opcion key={pais} activa={pais === valor} alElegir={() => elegir(pais)}>
                          <BanderaPais pais={pais} />
                          {pais}
                        </Opcion>
                      ))}
                      <li className="my-1 border-t border-slate-100" aria-hidden />
                      <li>
                        <button
                          type="button"
                          onClick={() => setVista("otros")}
                          className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-colors hover:bg-zeus-celeste hover:text-zeus-tinta ${
                            valorEsOtro ? "font-semibold text-zeus-tinta" : "text-slate-700"
                          }`}
                        >
                          {valorEsOtro ? <BanderaPais pais={valor} /> : <IconoMundo />}
                          <span className="flex-1">OTROS{valorEsOtro && ` · ${valor}`}</span>
                          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">{otros.length}</span>
                          <HiChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </li>
                    </motion.ul>
                  ) : (
                    <motion.div
                      key="otros"
                      initial={{ opacity: 0, x: DESPLAZAMIENTO_VISTA }}
                      animate={{ opacity: 1, x: 0, transition: { duration: 0.18 } }}
                      exit={{ opacity: 0, x: DESPLAZAMIENTO_VISTA, transition: { duration: 0.12 } }}
                      className="flex min-h-0 flex-col"
                    >
                      <div className="flex items-center gap-2 border-b border-slate-100 p-2">
                        <button
                          type="button"
                          onClick={() => setVista("principales")}
                          aria-label="Volver a los países principales"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zeus-tinta transition hover:bg-zeus-celeste"
                        >
                          <HiChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="relative flex-1">
                          <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            autoFocus
                            value={busqueda}
                            onChange={(evento) => setBusqueda(aMayusculas(evento.target.value))}
                            onKeyDown={alPresionarEnBusqueda}
                            placeholder={permitirNuevo ? "BUSQUE O ESCRIBA UN PAÍS…" : "BUSCAR PAÍS…"}
                            aria-label={permitirNuevo ? "Buscar o escribir otro país" : "Buscar otro país"}
                            className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 pl-8 pr-2 text-xs uppercase outline-none focus:border-zeus-azul/50 focus:bg-superficie"
                          />
                        </div>
                      </div>
                      <ul role="listbox" className="scroll-zeus overflow-y-auto p-1.5">
                        {otrosVisibles.length === 0 && !puedeAgregar && (
                          <li className="px-3 py-2.5 text-center text-xs text-slate-400">Sin coincidencias</li>
                        )}
                        {otrosVisibles.map((pais) => (
                          <Opcion key={pais} activa={pais === valor} alElegir={() => elegir(pais)}>
                            <BanderaPais pais={pais} />
                            {pais}
                          </Opcion>
                        ))}
                        {puedeAgregar && (
                          <motion.li initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className={otrosVisibles.length > 0 ? "mt-1 border-t border-slate-100 pt-1" : ""}>
                            <button
                              type="button"
                              onClick={() => elegir(nuevo)}
                              className="flex w-full items-center gap-2.5 rounded-lg border border-dashed border-zeus-azul/30 bg-zeus-celeste/50 px-3 py-2 text-left text-[13px] text-zeus-tinta transition hover:border-zeus-azul/60 hover:bg-zeus-celeste"
                            >
                              <HiOutlinePlus className="h-4 w-4 shrink-0" />
                              <span className="min-w-0 flex-1 truncate">
                                Agregar <b className="font-semibold">«{nuevo}»</b>
                              </span>
                              <kbd className="rounded border border-zeus-azul/20 px-1 text-[10px] font-semibold">Enter</kbd>
                            </button>
                          </motion.li>
                        )}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
