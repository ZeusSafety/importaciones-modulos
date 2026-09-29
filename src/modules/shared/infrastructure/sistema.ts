import "server-only";
import { randomUUID } from "node:crypto";
import type { GeneradorId, Reloj } from "../domain/puertos";

export class RelojSistema implements Reloj {
  ahora(): Date {
    return new Date();
  }
}

export class GeneradorIdCrypto implements GeneradorId {
  generar(): string {
    return randomUUID();
  }
}
