import { Editor } from 'slate'
import { toggleMark } from './leafs'

export const onKeyDown = (editor: Editor) => (event) => {
  if (!event.ctrlKey) {
    return
  }

  switch (event.key) {
    // case '`':
    //   event.preventDefault()
    //   return CustomEditor.toggleCodeBlock(editor)
    case 'i':
      event.preventDefault()
      return toggleMark(editor, 'italic')
    case 'b':
      event.preventDefault()
      return toggleMark(editor, 'bold')
    case 'u':
      event.preventDefault()
      return toggleMark(editor, 'underline')
    // case '1':
    // case '2':
    // case '3':
    // case '4':
    // case '5':
    // case '6':
    //   event.preventDefault()
    //   return CustomEditor.toggleHeadingBlock(editor, Number(event.key))
  }
}
