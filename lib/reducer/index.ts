// const INPUT = Symbol(69)
// const RESULT = Symbol(420)

const input = {
  name: 'document',
  children: [
    {
      name: 'body',
      children: [
        { name: 'p' },
        {
          name: 'sectPr',
          children: [
            {
              name: 'type',
              attributes: {
                val: 'nextPage'
              },
              children: []
            }
          ]
        }
      ]
    }
  ]
}

export function addAttrAsName(target, source, attr, asName?) {
  if (!source?.attributes[attr]) {
    return target
  }

  return {
    ...target,
    attributes: {
      ...target.attributes,
      [asName || source.name]: source.attributes[attr]
    }
  }
}

export function reducePropertyChildren(attrs, node) {
  return node.children.reduce((acc, cur, idx) => {
    console.log(idx, cur.name)
    switch (cur.name) {
      default:
        return attrs
      case 'jc':
        return addAttrAsName(acc, cur, 'val')
      case 'pStyle':
        return addAttrAsName(acc, cur, 'val', 'style')
    }
  }, attrs)
}

// const parent = {
//   type: 'paragraph',
//   attributes: {},
//   children: []
// }
// const properties = {
//   children: [
//     {
//       name: 'pStyle',
//       attributes: {
//         val: 'Normal'
//       }
//     },
//     {
//       name: 'jc',
//       attributes: {
//         val: 'center'
//       }
//     }
//   ]
// }

// console.log(nodeToAttr(parent, properties))

// const input = {
//   children: [
//     {
//       name: 'p',
//       children: [
//         { name: 'bold' },
//         { name: 'boo', value: 'yah!' },
//         { text: 'Hello, World!' },
//         { name: 'stone', value: 'cold' }
//       ]
//     },
//     {
//       name: 'sectPr'
//     },
//     {
//       name: 'p',
//       children: [
//         {
//           name: 'pPr',
//           children: [
//             {
//               name: 'pStyle',
//               attributes: { val: 'Normal' }
//             }
//           ]
//         }
//       ]
//     }
//   ]
// }

// function addChild(parent, child) {
//   return {
//     ...parent,
//     children: [...parent.children, child]
//   }
// }

// function addAttr(parent, attr, value) {
//   const attributes = parent.attributes || {}
//   return {
//     ...parent,
//     attributes: { ...parent.attributes, [attr]: value }
//   }
// }

// function reduceNode(node) {
//   function reduce(acc, cur, idx) {
//     switch (cur.name) {
//       case 'p':
//         // console.log(cur.children)
//         return addChild(acc, cur.children.reduce(reduce, { type: 'paragraph' }))
//       case 'sectPr':
//       case 'pPr':
//         return { ...acc, ...cur.children.reduce(reduce, {}) }
//       case 'pStyle':
//         return addAttr(acc, 'style', cur.attributes.val)
//       case 'bold':
//         return addAttr(acc, 'bold', true)
//     }
//     return acc
//   }

//   // return reduce({ children: [] }, node.children[0], 0)
//   return node.children.reduce(reduce, { children: [] })
//   // return node.children.reduce(reduce, {
//   //   type: 'paragraph',
//   //   // [INPUT]: input,
//   //   [RESULT]: { type: 'paragraph' }
//   // })
// }

// function reduceDocument(node) {
//   function reduce(acc, cur, idx?) {
//     // console.log(idx + ':', acc.sections.slice(0, acc.sections.length - 1))
//     switch (cur.name) {
//       case 'p': {
//         console.log(idx + ':', acc.sections)
//         const rest = acc.sections.slice(0, acc.sections.length - 1)
//         const last = acc.sections[acc.sections.length - 1]
//         return {
//           ...acc,
//           sections: [
//             ...rest,
//             {
//               ...last,
//               children: [...last.children, { type: 'paragraph' }]
//             }
//           ]
//         }
//       }
//       case 'sectPr': {
//         const rest = acc.sections.slice(0, acc.sections.length - 1)
//         const last = acc.sections[acc.sections.length - 1]
//         return {
//           ...acc,
//           sections: [
//             ...rest,
//             {
//               ...last,
//               attributes: {}
//             },
//             { children: [] }
//           ]
//         }
//       }
//     }

//     return acc
//   }

//   return node.children.reduce(reduce, { sections: [{ children: [] }] })
// }

// // const result =
// const result = JSON.stringify(reduceDocument(input), null, 2)
// console.log('result:', result)

// // function reduceChildrenToAttr(node) {
// //   function reduce(acc, n) {
// //     if (n.text) {
// //       acc[RESULT] = {
// //         ...acc[RESULT],
// //         attributes: {
// //           ...acc[RESULT].attributes,
// //           [n.text]: 'boo'
// //         }
// //       }
// //     }
// //     return acc
// //   }

// //   return node.children.reduce(reduce, {
// //     [RESULT]: { type: 'paragraph', attributes: {} }
// //   })[RESULT]
// // }

// // console.log(
// //   reduceChildrenToAttr({
// //     name: 'p',
// //     children: [{ text: 'Hello' }, { text: 'World' }]
// //   })
// // )

// // export function reduceNode(node) {
// //   function reduce(acc, n) {
// //     const parent =
// //       typeof acc[RESULT] === 'undefined'
// //         ? {
// //             ...acc,
// //             [RESULT]: acc
// //           }
// //         : acc

// //     if (n.text) {
// //       return {
// //         ...parent
// //       }
// //     }

// //     return parent
// //   }

// //   return node.children.reduce(reduce, {})[RESULT]
// // }

// // const input = {
// //   children: [
// //     {
// //       text: 'Hello, World!'
// //     },
// //     {
// //       text: 'Goodnight, Moon.'
// //     }
// //   ]
// // }

// // const result = reduceNode(input)
// // // console.log(JSON.stringify(result, null, 2))
// // console.log('\n------\nRESULT:', result)
