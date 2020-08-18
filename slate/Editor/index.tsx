import React, { useEffect, useCallback, useMemo, useState } from 'react'
import { createEditor, Transforms, Editor, Node, Text } from 'slate'
import { Slate, Editable, withReact, useSlate } from 'slate-react'
import { withHistory } from 'slate-history'
import EscapeHtml from 'escape-html'
import styled from 'styled-components'

import { renderElements } from './elements'
import { renderLeafs, toggleMark } from './leafs'
import { onKeyDown } from './onKeyDown'
import { withHtmlPaste } from './plugins'

const StyledEditable = styled(Editable)`
  border: 1px solid orange;
  padding: 1em;

  *:first-child {
    margin-top: 0;
  }

  *:last-child {
    margin-bottom: 0;
  }

  /* p {
    margin: 0;
  }

  p + p {
    margin-top: 0.5em;
  } */
`

const serialize = (node) => {
  if (Text.isText(node)) {
    let text = EscapeHtml(node.text)

    if (node.underline) {
      text = `<u>${text}</u>`
    }

    if (node.italic) {
      text = `<i>${text}</i>`
    }

    if (node.bold) {
      text = `<b>${text}</b>`
    }

    return text
  }

  const children = node.children.map((n) => serialize(n)).join('')

  switch (node.type) {
    default:
      return children
    case 'paragraph':
      return `<p>${children}</p>\n`
    case 'code':
      return `<pre><code>${children}</code></pre>`
  }
}

const deserialize = (string) => {
  return string.split('\n').map((line) => {
    return {
      children: [{ text: line }]
    }
  })
}

const CustomEditor = {
  isCodeBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === 'code'
    })

    return !!match
  },
  toggleCodeBlock(editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor)
    Transforms.setNodes(
      editor,
      { type: isActive ? 'null' : 'code' },
      { match: (n) => Editor.isBlock(editor, n) }
    )
  },
  isHeadingBlockActive(editor, level) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === 'heading' && n.level === level
    })

    return !!match
  },
  toggleHeadingBlock(editor, level = 1) {
    const isActive = CustomEditor.isHeadingBlockActive(editor, level)
    Transforms.setNodes(
      editor,
      { type: isActive ? 'null' : 'heading', level: isActive ? 'null' : level },
      { match: (n) => Editor.isBlock(editor, n) }
    )
  }
}

const CodeElement = (props) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  )
}

const DefaultElement = (props) => {
  return <p {...props.attributes}>{props.children}</p>
}

const Leaf = (props) => {
  return (
    <span
      {...props.attributes}
      style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal' }}
    >
      {props.children}
    </span>
  )
}

const Toolbar = () => {
  const editor = useSlate()

  const handleClick = (fun) => (e) => {
    e.preventDefault()
    fun(editor)
  }

  return (
    <div>
      <button
        onClick={(e) => {
          e.preventDefault()
          toggleMark(editor, 'bold')
        }}
      >
        B
      </button>
      <button
        onClick={(e) => {
          e.preventDefault()
          toggleMark(editor, 'italic')
        }}
      >
        I
      </button>
      <button
        onClick={(e) => {
          e.preventDefault()
          Transforms.insertFragment(editor, [
            { type: 'heading', level: 1, children: [{ text: 'Hello, World!' }] }
          ])
        }}
      >
        H1
      </button>
    </div>
  )
}

interface EditorProps {
  onChange: (value: Editor) => void
}

export default (props: EditorProps) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  const [value, setValue] = useState<Node[]>([
    {
      type: 'paragraph',
      children: [{ text: 'Hello, World!1' }]
    }
  ])

  const updateValue = (value) => {
    if (props.onChange) {
      props.onChange(value)
    }

    setValue(value)
  }

  return (
    <Slate editor={editor} value={value} onChange={updateValue}>
      <Toolbar />
      <StyledEditable
        renderElement={useCallback(renderElements, [])}
        renderLeaf={useCallback(renderLeafs, [])}
        onKeyDown={onKeyDown(editor)}
      />
      <pre style={{ padding: '1em', border: '1px solid' }}>
        <code>{serialize(editor)}</code>
      </pre>
      <pre style={{ padding: '1em', border: '1px solid' }}>
        <code>{JSON.stringify(editor, null, 2)}</code>
      </pre>
    </Slate>
  )
}
