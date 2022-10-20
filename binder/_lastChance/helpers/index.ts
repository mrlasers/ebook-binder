import Path from 'path'

export const stripExt = (filename: string) =>
  Path.basename(filename, Path.extname(filename))

export const toLinuxPath = (path: string) => path.replace(/\\/g, '/')
