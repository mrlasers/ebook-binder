import sharp from 'sharp'

import { Err } from '../types'

export const readAndCompressImage = (path: string, options?: any) => {
  return sharp(path)
    .resize({
      withoutEnlargement: true,
      width: 900
    })
    .jpeg()
    .toBuffer()
    .catch((err) => Err.MyError.of(err))
}
