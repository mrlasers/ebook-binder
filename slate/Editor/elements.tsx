import React from 'react'

export const HeadingElement = (props) => {
  const { level } = props.element
  const Heading = `h${level}`
  return <Heading {...props.attributes}>{props.children}</Heading>
}

export const CodeElement = (props) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  )
}

export const DefaultElement = (props) => {
  return <p {...props.attributes}>{props.children}</p>
}

export const renderElements = (props) => {
  switch (props.element.type) {
    default:
      return <DefaultElement {...props} />
    case 'code':
      return <CodeElement {...props} />
    case 'heading':
      return <HeadingElement {...props} />
  }
}
