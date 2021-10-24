export class MyError {
  _tag: string
  msg: string

  protected constructor(tag: string, msg: any) {
    // super(`${msg}`)
    this._tag = tag
    this.msg = JSON.stringify(msg)
  }

  static of(msg: any) {
    return new MyError('ERROR', msg)
  }
}

export class WriteError extends MyError {
  private constructor(msg: any) {
    super('FILE_WRITE_ERROR', msg)
  }

  static of(msg: any) {
    return new WriteError(msg)
  }
}

export class UnhandleManifestNode extends MyError {
  private constructor(msg: any) {
    super('UNHANDLED_MANIFEST_NODE', msg)
  }

  static of(msg: any) {
    return new UnhandleManifestNode(msg)
  }
}
