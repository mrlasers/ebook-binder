export class FileOpenError extends Error {
  public _tag: string

  private constructor(filename: string) {
    super(`${filename} could not be opened`)
    this._tag = 'FileOpenError'
  }

  public static of(filename: string): FileOpenError {
    return new FileOpenError(filename)
  }
}

export class FileWriteError extends Error {
  public _tag: string

  private constructor(filename: string) {
    super(`${filename} could not be written`)
    this._tag = 'FileWriteError'
  }

  public static of(filename: string): FileWriteError {
    return new FileWriteError(filename)
  }
}

export class JsonReadError extends Error {
  public _tag: string

  private constructor(err: string) {
    super(err)
    this._tag = 'JsonError'
  }
  public static of(err: any): JsonReadError {
    return new JsonReadError(`${err}`)
  }
}

export type FileError = FileOpenError | JsonReadError | FileWriteError

let jsonError: FileError = JsonReadError.of('oops')
let fileError = FileWriteError.of('nope')
jsonError = fileError
