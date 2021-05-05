import * as IO from '../../lib/fileio'

export const combine = (dir: string): Promise<string> => {
  return IO.filesInDir(dir, []).then(IO.readFile)
  return Promise.resolve('not implemented')
}
