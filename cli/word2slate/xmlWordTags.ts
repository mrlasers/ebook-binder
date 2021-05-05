import { isText } from './xmlParser'
// const children = []

// children.reduce((parent, child) => {

// }, {
//   name: '',
//   attributes: {},
//   children: []
// })

// <w:r w:rsidRPr="00D75488"><w:rPr><w:i/><w:iCs/></w:rPr><w:t>italic</w:t>

export const t = (parent, child) => {
  const firstChild = child.children[0]
  if (!isText(firstChild)) {
    return parent
  }
  return {
    ...parent,
    children: [...parent.children, firstChild]
  }
}

export const rPr = (parent, child) => {}
