import Util from 'util'

export class MyError extends Error {
  protected constructor(name: string, msg?: string) {
    super(msg)
    this.name = name
  }

  // [Util.inspect.custom](depth: number, options) {
  //   return `${this.name}${this.stack ? ` (stack)` : ''}: ${this.message}`
  // // }

  // static of(msg?: any) {
  //   return new MyError('MyError', String(msg))
  // }
}

export class FileReadError extends MyError {
  static of(msg?: any) {
    return new MyError('FileReadError', String(msg))
  }
}

export class JsonParseError extends MyError {
  static of(msg?: any) {
    return new JsonParseError('JsonParseError', String(msg))
  }
}

export class JsonValidationError extends MyError {
  static of(msg?: any) {
    return new JsonValidationError('JsonValidationError', String(msg))
  }
}

export class InputTypeError extends MyError {
  static of(msg?: any) {
    return new InputTypeError('InputTypeError', String(msg))
  }
}

export class OutputWriteError extends MyError {
  static of(msg?: any) {
    return new OutputWriteError('OutputWriteError', String(msg))
  }
}
