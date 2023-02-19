import { ReactPortal, useEffect, useState } from 'react'

import type { MatchResult } from '@apiteam/env-regex'
import type { LexicalCommand, LexicalEditor, RangeSelection } from 'lexical'

import type { LexicalAddons, LexicalModule } from './module'
import { $createVariableNode, VariableNodeType } from './VariableNode'

type Resolution = {
  match: MatchResult
  range: Range
}

const getTextUpToAnchor = (selection: RangeSelection): string | null => {
  const anchor = selection.anchor
  if (anchor.type !== 'text') {
    return null
  }
  const anchorNode = anchor.getNode()
  // We should not be attempting to extract mentions out of nodes
  // that are already being used for other core things. This is
  // especially true for token nodes, which can't be mutated at all.
  if (!anchorNode.isSimpleText()) {
    return null
  }
  const anchorOffset = anchor.offset
  return anchorNode.getTextContent().slice(0, anchorOffset)
}

const getVariablesTextToSearch = (
  editor: LexicalEditor,
  lexical: LexicalModule
): string | null => {
  let text = null

  editor.getEditorState().read(() => {
    const selection = lexical.$getSelection()
    if (!lexical.$isRangeSelection(selection)) {
      return
    }
    text = getTextUpToAnchor(selection)
  })

  return text
}

function isSelectionOnEntityBoundary(
  editor: LexicalEditor,
  offset: number,
  lexical: LexicalModule
): boolean {
  if (offset !== 0) {
    return false
  }
  return editor.getEditorState().read(() => {
    const selection = lexical.$getSelection()
    if (lexical.$isRangeSelection(selection)) {
      const anchor = selection.anchor
      const anchorNode = anchor.getNode()
      const prevSibling = anchorNode.getPreviousSibling()
      return lexical.$isTextNode(prevSibling) && prevSibling.isTextEntity()
    }
    return false
  })
}

function tryToPositionRange(match: MatchResult, range: Range): boolean {
  const domSelection = window.getSelection()
  if (domSelection === null || !domSelection.isCollapsed) {
    return false
  }
  const anchorNode = domSelection.anchorNode
  const startOffset = match.start
  const endOffset = domSelection.anchorOffset
  try {
    if (anchorNode) {
      range.setStart(anchorNode, startOffset)
      range.setEnd(anchorNode, endOffset)
    }
  } catch (error) {
    return false
  }

  return true
}

const useVariables = (
  editor: LexicalEditor,
  lexical: LexicalModule,
  VariableNodeClass: VariableNodeType
): ReactPortal | null => {
  const [resolutions, setResolutions] = useState<Resolution[]>([])

  // Register plugin
  useEffect(() => {
    if (!lexical) return

    if (!editor.hasNodes([VariableNodeClass])) {
      throw new Error('VariablesPlugin: VariableNode not registered on editor')
    }

    const INSERT_VARIABLE_COMMAND: LexicalCommand<string> =
      lexical.createCommand()

    return editor.registerCommand<string>(
      INSERT_VARIABLE_COMMAND,
      (payload) => {
        const selection = lexical.$getSelection()

        if (lexical.$isRangeSelection(selection)) {
          const name = payload
          const variableNode = $createVariableNode(name, VariableNodeClass)

          if (lexical.$isRootNode(selection.anchor.getNode())) {
            selection.insertParagraph()
          }

          selection.insertNodes([variableNode])
        }

        return true
      },
      lexical.COMMAND_PRIORITY_EDITOR
    )
  }, [VariableNodeClass, editor, lexical])

  // Listen for variable matches
  useEffect(() => {
    let activeRange: Range | null = document.createRange()
    let previousText: string | null = null

    const updateListener = async () => {
      const range = activeRange
      const text = getVariablesTextToSearch(editor, lexical)

      if (text === previousText || range === null) {
        return
      }
      previousText = text

      if (text === null) {
        return
      }
      const matches = await import('@apiteam/env-regex').then(
        (m) => m.matchAllEnvVariables(text) as MatchResult[]
      )

      const newResolutions = [] as Resolution[]

      matches.forEach((match) => {
        if (!isSelectionOnEntityBoundary(editor, match.start, lexical)) {
          const isRangePositioned = tryToPositionRange(match, range)
          if (isRangePositioned !== null) {
            newResolutions.push({
              match,
              range,
            })
          }
        }
      })
      setResolutions(newResolutions)
    }

    const removeUpdateListener = editor.registerUpdateListener(updateListener)

    return () => {
      activeRange = null
      removeUpdateListener()
    }
  }, [editor, lexical])

  /*const closeTypeahead = useCallback(() => {
    setResolution(null)
  }, [])*/

  //console.log('useVariables', resolution)

  createVariableNodes(
    editor,
    resolutions.map((r) => r.match),
    lexical,
    VariableNodeClass
  )

  return null /*resolution === null || editor === null
    ? null
    : createPortal(
        <VariablesTypeahead
          close={closeTypeahead}
          resolution={resolution}
          editor={editor}
        />,
        document.body
      )*/
}

const createVariableNodes = (
  editor: LexicalEditor,
  matches: MatchResult[],
  lexical: LexicalModule,
  VariableNodeClass: VariableNodeType
): void => {
  editor.update(() => {
    const selection = lexical.$getSelection()
    if (!lexical.$isRangeSelection(selection) || !selection.isCollapsed()) {
      return
    }

    const anchor = selection.anchor
    if (anchor.type !== 'text') {
      return
    }
    const anchorNode = anchor.getNode()

    // We should not be attempting to extract mentions out of nodes
    // that are already being used for other core things. This is
    // especially true for token nodes, which can't be mutated at all.
    if (!anchorNode.isSimpleText()) return

    const offsets = [] as number[]

    matches.forEach((match) => {
      if (!offsets.includes(match.start)) {
        offsets.push(match.start)
      }
      if (!offsets.includes(match.start + match.text.length)) {
        offsets.push(match.start + match.text.length)
      }
    })

    const splitNodes = anchorNode.splitText(...offsets)

    matches.forEach((match) => {
      const node = splitNodes.find((node) => node.__text === match.text)

      if (!node || match.text === '{{}}') {
        return
      }

      const variableNode = $createVariableNode(match.text, VariableNodeClass)
      node.replace(variableNode)
    })
  })
}

export const VariablesPlugin = ({
  lexical,
  lexicalAddons,
  VariableNodeClass,
}: {
  lexical: LexicalModule
  lexicalAddons: LexicalAddons
  VariableNodeClass: VariableNodeType
}): ReactPortal | null => {
  const [editor] = lexicalAddons.useLexicalComposerContext()

  return useVariables(editor, lexical, VariableNodeClass)
}
