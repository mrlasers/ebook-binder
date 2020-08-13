/*

{
  attributes: {},
  runs: []
}

*/

// Run Content types
// export type RunContent = T | Br

// export interface T {
//   text: string
// }

// export interface Br {
//   attributes: {
//     type?: 'column' | 'page' | 'textWrapping'
//     clear?: 'all' | 'left' | 'right' | 'none'
//   }
// }

// // Run type
// export interface Run {
//   properties: {
//     bold?: boolean
//     caps?: boolean
//   }
//   text: string
// }

/* run node structure
{
  type: 'node',
  name: 'r',
  attributes: {},
  children: [
    {
      type: 'node',
      name: 'rPr',
      attributions: {},
      children: []
    }, 
    {
      type: 'text',
      text: 'Hello, World!'
    }
  ]
}

// document run node
{
  type: 'run',
  properties: {},
  content: [
    'Hello, World!'
  ]
}
*/

export interface RCText {
  type: 'text'
  value: string
}

export interface RCBreak {
  type: 'br'
  value: boolean
}

export class Run {
  value: {
    properties: { [key: string]: any }
    content: []
  }

  constructor(value) {
    this.value = value
  }

  getValue() {
    return this.value
  }

  getText() {
    return this.value.content
      .map((c) => (typeof c === 'string' ? c : ''))
      .join('')
  }

  static of(node) {
    const value = node.children.reduce(
      (acc, child, idx) => {
        switch (child.type) {
          default:
            return acc
          case 'node':
            console.log(`found node ${child.name} at index ${idx}`)
            if (child.name === 'rPr') {
              // ignore run properties if not first child
              if (idx !== 0 || !child.children.length) {
                return acc
              }

              // need to handle properties here
              return acc
            }
          case 'text':
            return {
              ...acc,
              content: [...acc.content, child.text]
            }
        }
      },
      {
        type: 'run',
        properties: {},
        content: []
      }
    )

    return new Run(value)
  }
}

function runOf(value) {
  const { properties = {}, content = [] } = value
  return {
    getValue: () => value,
    getText: () => content.map((c) => (typeof c === 'string' ? c : '')).join('')
  }
}

export function createRun(node) {
  const value = node.children.reduce(
    (acc, child, idx) => {
      switch (child.type) {
        default:
          return acc
        case 'node':
          console.log(`found node ${child.name} at index ${idx}`)
          if (child.name === 'rPr') {
            // ignore run properties if not first child
            if (idx !== 0 || !child.children.length) {
              return acc
            }

            // need to handle properties here
            return acc
          }
        case 'text':
          return {
            ...acc,
            content: [...acc.content, child.text]
          }
      }
    },
    {
      type: 'run',
      properties: {},
      content: []
    }
  )

  return runOf(value)
}
