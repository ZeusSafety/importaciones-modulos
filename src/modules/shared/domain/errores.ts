export class ErrorDominio extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = new.target.name;
  }
}

export class ErrorValidacion extends ErrorDominio {}

export class ErrorNoEncontrado extends ErrorDominio {}

export class ErrorConflicto extends ErrorDominio {}
