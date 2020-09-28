import * as Word from './nodeReducers'

// test

type Config = {
  relationships: object
  [key: string]: any
}

export const _processChildren = (config: Config) => {
  const processChildren = (
    nodes: Word.WordNode[],
    node: Word.WordNode
  ): Word.WordNode[] => {
    // console.log('processChildren.node:', node)
    if (!Word.isWordElement(node)) {
      return [...nodes, node]
    }

    switch (node.type) {
      default:
        return [
          ...nodes,
          {
            ...node,
            children: node.children.reduce(processChildren, [])
          }
        ]
      case 'image': {
        const newNode = !config?.relationships
          ? node
          : {
              ...node,
              properties: {
                ...node.properties,
                file:
                  config?.relationships?.[node.properties.id as number].target
                    .file
                // ...(config?.relationships?.[node.properties.id as number]
                //   ? config.relationships?.[node.properties.id as number]
                //   : {})
              }
            }

        return [...nodes, newNode]
      }
      case 'list': {
        const rest = nodes.slice(0, nodes.length - 1)
        const last = nodes.slice(nodes.length - 1)[0]
        const listItem = {
          type: 'list-item',
          properties: {},
          children: node.children
        }

        if (
          Word.isWordElement(last) &&
          last.properties.numId === node.properties.numId
        ) {
          return [
            ...rest,
            {
              ...last,
              children: [...last.children, listItem]
            }
          ]
        }

        return [
          ...nodes,
          {
            ...node,
            children: [listItem]
          }
        ]
      }
    }
  }

  return processChildren
}

export const process = (
  node: Word.WordNode,
  config?: Config
): Word.WordNode => {
  if (Word.isWordText(node) || Word.isWordError(node) || !node.children) {
    // console.log('not a word element')
    return node
  }

  return {
    ...node,
    children: node.children.reduce<Word.WordNode[]>(
      _processChildren(config),
      []
    )
  }
}
