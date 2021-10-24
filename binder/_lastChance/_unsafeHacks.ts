import { v4 as Uuid } from 'uuid'
import { Metadata } from './exporter'

export const dirtyUnsafeMetadata: Metadata = {
  pubId: Uuid(),
  title:
    'A Practical Reference for Transgender and Gender-Noncomforming Adults',
  author: 'Linda Gromko, MD',
  publisher: 'Bainbridge Books'
}
