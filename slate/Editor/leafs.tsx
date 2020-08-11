import React from 'react'
import { Editor, Transforms, Text } from 'slate'

export const Leaf = (props) => {
  return (
    <span
      {...props.attributes}
      style={{
        fontWeight: props.leaf.bold ? 'bold' : 'normal',
        fontStyle: props.leaf.italic ? 'italic' : 'normal',
        textDecoration: props.leaf.underline ? 'underline' : 'none'
      }}
    >
      {props.children}
    </span>
  )
}

export type Mark = 'bold' | 'italic' | 'underline'

export const isMarkActive = (editor: Editor, mark: Mark): boolean => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n[mark] === true
  })

  return !!match
}

export const toggleMark = (editor: Editor, mark: Mark) => {
  const isActive = isMarkActive(editor, mark)
  Transforms.setNodes(
    editor,
    { [mark]: isActive ? null : true },
    { match: (n) => Text.isText(n), split: true }
  )
}

export const renderLeafs = (props) => {
  return <Leaf {...props} />
}
