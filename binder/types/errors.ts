export class MyError extends Error {
  protected constructor(name: string, msg: string) {
    super(msg)
  }

  static of(msg: any) {
    return new MyError('MyError', String(msg))
  }
}

// export class AnyError extends MyError {
//   obj: any

//   protected constructor(obj: any) {
//     super(String(obj))
//     this.obj = obj
//   }

//   static of(obj: any) {
//     return new AnyError(obj)
//   }
// }
