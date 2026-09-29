/** Aritmética de días `YYYY-MM-DD` sin zona horaria: se opera en UTC para que no haya saltos de día. */

export interface MesVisible {
  readonly anio: number;
  /** 1 a 12. */
  readonly mes: number;
}

export const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"] as const;
export const DIAS_SEMANA = ["L", "M", "X", "J", "V", "S", "D"] as const;

const dosDigitos = (valor: number) => String(valor).padStart(2, "0");

export function fechaDe(anio: number, mes: number, dia: number): string {
  return `${anio}-${dosDigitos(mes)}-${dosDigitos(dia)}`;
}

export function mesDe(fecha: string): MesVisible {
  return { anio: Number(fecha.slice(0, 4)), mes: Number(fecha.slice(5, 7)) };
}

export function desplazarMes({ anio, mes }: MesVisible, delta: number): MesVisible {
  const indice = anio * 12 + (mes - 1) + delta;
  return { anio: Math.floor(indice / 12), mes: (indice % 12) + 1 };
}

export function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Celdas del mes empezando en lunes; `null` rellena los huecos. */
export function celdasDelMes({ anio, mes }: MesVisible): (string | null)[] {
  const totalDias = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
  const huecoInicial = (new Date(Date.UTC(anio, mes - 1, 1)).getUTCDay() + 6) % 7;
  const dias = Array.from({ length: totalDias }, (_, i) => fechaDe(anio, mes, i + 1));
  const celdas = [...Array<null>(huecoInicial).fill(null), ...dias];
  return [...celdas, ...Array<null>((7 - (celdas.length % 7)) % 7).fill(null)];
}

/** `dd/mm/aaaa` */
export function fechaCorta(fecha: string): string {
  return `${fecha.slice(8, 10)}/${fecha.slice(5, 7)}/${fecha.slice(0, 4)}`;
}
