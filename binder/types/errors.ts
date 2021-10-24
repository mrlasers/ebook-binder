export class FileError extends Error {
  public _tag: string

  private constructor(msg: string) {
    super(msg)
    this._tag = 'FileError'
  }

  public static of(message: string): FileError {
    return new FileError(message)
  }
}
