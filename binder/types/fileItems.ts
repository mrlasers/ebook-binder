export interface ItemBase {
  _tag: string
}

export type ManifestFileItem = string | { filename: string }

export interface Item extends ItemBase {
  _tag: string
  filename: string
}

export interface ItemXhtml extends Item {
  _tag: 'XHTML'
  landmark?: string
}

export interface ItemImage extends Item {
  _tag: 'IMAGE'
  title: string
}

export interface ItemUnknown extends Item {
  _tag: 'UNKNOWN'
  source: any
}

export type ItemFile = ItemXhtml | ItemImage | ItemUnknown

export type FileMetadata = {}

const xhtml: ItemXhtml = {
  _tag: 'XHTML',
  landmark: 'string',
  filename: 'helloWorld.xhtml'
}

function x(item: ItemFile) {
  if (item._tag === 'XHTML') {
    const y = item
    return item.landmark
  }
  return item
}

x(xhtml)
