const logAndDropLefts =
  (log: Logger = console.log) =>
  <T>(es: E.Either<MyError, T>[]): T[] =>
    pipe(
      es,
      A.filter((x) => !!x),
      A.separate,
      ({ left, right }) => {
        left.forEach((err) => log(err.msg))

        return right
      }
    )
