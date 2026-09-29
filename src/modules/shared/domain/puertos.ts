export type Bytes = Uint8Array<ArrayBuffer>;

export interface Reloj {
  ahora(): Date;
}

export interface GeneradorId {
  generar(): string;
}
