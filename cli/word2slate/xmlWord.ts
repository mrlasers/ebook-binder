import { parse, XmlNode, Text, Element, isText } from './xmlParser'

// export const processT = (parent: Element) => (t: Element) => {
//   if (t.children.length === 1 && t.children[0].text) {

//   }
// }

const xml = '<xml><hello><world>!</world><goodnight>?</goodnight></hello></xml>'

const tags = {
  hello: {
    allowedChildren: ['world']
  }
}

const isAllowed = (parent: XmlNode) => (child: XmlNode) => {
  if (isText(parent)) {
    return false
  }

  const tag = tags[parent?.name]
  if (!tag) {
    return false
  }
  if (!tag.allowedChildren) {
    return true
  }
  if (tag.allowedChildren.includes(child?.name)) {
    return true
  }
  return false
}

const xmlToSlate = (xml: XmlNode, parent: XmlNode | null = null) => {
  return xml.children.map((child) => {
    return {
      // children: child.children.map((c) => c?.name || 'unnamed')
      children: child.children.filter(isAllowed(child)).map((c) => c.name)
    }
  })
}

parse(xml).then(xmlToSlate).then(console.log)
