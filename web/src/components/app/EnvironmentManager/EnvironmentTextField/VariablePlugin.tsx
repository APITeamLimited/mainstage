import { ReactPortal, useEffect, useState } from 'react'

import type { LexicalCommand, LexicalEditor, RangeSelection } from 'lexical'

import type { LexicalAddons, LexicalModule } from './module'
import {
  $createVariableNode,
  VariableNodeClass,
  VariableNodeType,
} from './VariableNode'

type VariableMatch = {
  leadOffset: number
  matchingString: string
  replaceableString: string
}

type Resolution = {
  match: VariableMatch
  range: Range
}

export const BRACED_REGEX = /{{(([^}][^}]?|[^}]}?)*)}}/g

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

// Checks input text for @value matches
export function getPossibleVariableMatch(text: string): VariableMatch[] {
  // Will need to change this bit to match custom regex
  const matches = Array.from(text.matchAll(BRACED_REGEX))

  const filteredMatches = matches.filter(
    (match) => match.index !== undefined && match[1].length > 0
  ) as (RegExpMatchArray & { index: number })[]

  return filteredMatches.map((match) => ({
    leadOffset: match.index,
    matchingString: match[0],
    replaceableString: match[0],
  }))
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

function tryToPositionRange(match: VariableMatch, range: Range): boolean {
  const domSelection = window.getSelection()
  if (domSelection === null || !domSelection.isCollapsed) {
    return false
  }
  const anchorNode = domSelection.anchorNode
  const startOffset = match.leadOffset
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

    const updateListener = () => {
      const range = activeRange
      const text = getVariablesTextToSearch(editor, lexical)

      if (text === previousText || range === null) {
        return
      }
      previousText = text

      if (text === null) {
        return
      }
      const matches = getPossibleVariableMatch(text)

      const newResolutions = [] as Resolution[]

      matches.forEach((match) => {
        if (!isSelectionOnEntityBoundary(editor, match.leadOffset, lexical)) {
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
  matches: VariableMatch[],
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
      if (!offsets.includes(match.leadOffset)) {
        offsets.push(match.leadOffset)
      }
      if (!offsets.includes(match.leadOffset + match.matchingString.length)) {
        offsets.push(match.leadOffset + match.matchingString.length)
      }
    })

    const splitNodes = anchorNode.splitText(...offsets)

    matches.forEach((match) => {
      const node = splitNodes.find(
        (node) => node.__text === match.matchingString
      )

      if (!node) return

      const variableNode = $createVariableNode(
        match.matchingString,
        VariableNodeClass
      )
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
