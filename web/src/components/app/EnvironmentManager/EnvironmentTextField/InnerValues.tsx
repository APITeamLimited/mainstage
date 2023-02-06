import { useEffect } from 'react'

import type { EditorState, LexicalNode } from 'lexical'

import { EnvironmentTextFieldProps } from './EnvironmentTextField'
import type { LexicalAddons, LexicalModule } from './module'
import { VariableNodeType } from './VariableNode'
import { VariablesPlugin } from './VariablePlugin'

const convertToText = (
  editorState: EditorState,
  lexical: LexicalModule
): string => {
  return editorState.read(() => {
    const root = lexical.$getRoot()
    if (root.getChildrenSize() > 0) {
      const firstRootChildren = root.getChildren()

      // Get children of first child
      return firstRootChildren
        .map((child) => {
          const grandChildren = child.getChildren()
          return grandChildren
            .map((grandChild: LexicalNode) => {
              if (grandChild.__type === 'text') {
                return grandChild.getTextContent()
              } else if (grandChild.__type === 'variable') {
                return grandChild.__variable as string
              } else {
                throw `Unsupported node type: ${grandChild.__type}`
              }
            })
            .join('')
        })
        .join('')
    }
    return ''
  })
}

export const InnerValues = ({
  onChange = () => {},
  namespace,
  contentEditableStyles = {},
  lexical,
  lexicalAddons,
  VariableNodeClass,
  valueUpdate,
}: {
  onChange: EnvironmentTextFieldProps['onChange']
  namespace: EnvironmentTextFieldProps['namespace']
  contentEditableStyles: EnvironmentTextFieldProps['contentEditableStyles']
  lexical: LexicalModule
  lexicalAddons: LexicalAddons
  VariableNodeClass: VariableNodeType
}) => {
  const [editor] = lexicalAddons.useLexicalComposerContext()

  useEffect(() => {
    // Delete any line break ndoes
    editor.registerNodeTransform(lexical.ParagraphNode, (paragraphNode) => {
      paragraphNode.getChildren().forEach((childNode) => {
        if (childNode.getType() === 'linebreak') {
          childNode.remove()
        }
      })
    })
  }, [editor, lexical])

  const handeChange = (editorState: EditorState) => {
    onChange(convertToText(editorState, lexical), namespace)
  }

  return (
    <>
      <lexicalAddons.PlainTextPlugin
        contentEditable={
          <lexicalAddons.ContentEditable
            spellCheck={false}
            style={{
              animationDirection: '0.01s',
              animationName: 'mui-auto-fill-cancel',
              appearance: 'auto',
              backgroundAttachment: 'scroll',
              fontFamily: 'Manrope, sans-serif',
              textAlign: 'start',
              textIndent: '0px',
              textRendering: 'auto',
              textShadow: 'none',
              textTransform: 'none',
              display: 'flex',
              fontSize: '1rem',
              fontStretch: '100%',
              fontStyle: 'normal',
              //lineHeight: '23px',
              letterSpacing: 'normal',
              alignItems: 'center',
              justifyContent: 'flex-start',
              //outlineColor: theme.palette.primary.main,
              //outlineOffset: '-1px',
              //overflowWrap: 'anywhere',
              outlineStyle: 'none',
              height: '32px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'hidden',
              width: '100%',
              maxWidth: '100%',
              ...contentEditableStyles,
            }}
            key={namespace}
          />
        }
        placeholder={''}
      />
      {/*
      To enable history, need to stop being mixed up between components
      */}
      <lexicalAddons.HistoryPlugin />
      <VariablesPlugin
        lexical={lexical}
        lexicalAddons={lexicalAddons}
        VariableNodeClass={VariableNodeClass}
      />
      <lexicalAddons.ClearEditorPlugin />
      <lexicalAddons.OnChangePlugin onChange={handeChange} />
    </>
  )
}
