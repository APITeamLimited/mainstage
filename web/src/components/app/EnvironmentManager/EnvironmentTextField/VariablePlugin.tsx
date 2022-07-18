/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { ReactPortal, useEffect, useState } from 'react'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $isRangeSelection,
  $isTextNode,
  $getSelection,
  LexicalEditor,
  RangeSelection,
  LexicalCommand,
  createCommand,
  $isRootNode,
  COMMAND_PRIORITY_EDITOR,
} from 'lexical'

import { VariableNode } from './VariableNode'
import { $createVariableNode } from './VariableNode'

//const VARIABLES_REGEX = /{(.*?)}/

type VariableMatch = {
  leadOffset: number
  matchingString: string
  replaceableString: string
}

type Resolution = {
  match: VariableMatch
  range: Range
}

const PUNCTUATION =
  '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_:;'
const NAME = '\\b[A-Z][^\\s' + PUNCTUATION + ']'

const DocumentVariablesRegex = {
  NAME,
  PUNCTUATION,
}

const CapitalizedNameVariablesRegex = new RegExp(
  '(^|[^#])((?:' + DocumentVariablesRegex.NAME + '{' + 1 + ',})$)'
)

const PUNC = DocumentVariablesRegex.PUNCTUATION

const TRIGGERS = ['@', '\\uff20'].join('')

// Chars we expect to see in a mention (non-space, non-punctuation).
//const VALID_CHARS = '[^' + TRIGGERS + PUNC + '\\s]'
const VALID_CHARS = '[^' + TRIGGERS + '\\s]'

// Non-standard series of chars. Each series must be preceded and followed by
// a valid char.
const VALID_JOINS =
  '(?:' +
  '\\.[ |$]|' + // E.g. "r. " in "Mr. Smith"
  ' |' + // E.g. " " in "Josh Duck"
  '[' +
  PUNC +
  ']|' + // E.g. "-' in "Salier-Hellendag"
  ')'

const LENGTH_LIMIT = 75

const AtSignVariablesRegex = new RegExp(
  '(^|\\s|\\()(' +
    '[' +
    TRIGGERS +
    ']' +
    '((?:' +
    VALID_CHARS +
    VALID_JOINS +
    '){0,' +
    LENGTH_LIMIT +
    '})' +
    ')$'
)

const BracedRegex = new RegExp(/{(.*?)}/)

// 50 is the longest alias length limit.
//const ALIAS_LENGTH_LIMIT = 50

// Regex used to match alias.
/*const AtSignVariablesRegexAliasRegex = new RegExp(
  '(^|\\s|\\()(' +
    '[' +
    TRIGGERS +
    ']' +
    '((?:' +
    VALID_CHARS +
    '){0,' +
    ALIAS_LENGTH_LIMIT +
    '})' +
    ')$'
)*/

// At most, 5 suggestions are shown in the popup.
const SUGGESTION_LIST_LENGTH_LIMIT = 5

function getTextUpToAnchor(selection: RangeSelection): string | null {
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

function getVariablesTextToSearch(editor: LexicalEditor): string | null {
  let text = null
  editor.getEditorState().read(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) {
      return
    }
    text = getTextUpToAnchor(selection)
  })
  return text
}

// Will need to remove
function checkForCapitalizedNameVariables(
  text: string,
  minMatchLength: number
): VariableMatch | null {
  const match = CapitalizedNameVariablesRegex.exec(text)

  if (match !== null) {
    if (braced) {
      const maybeLeadingWhitespace = ''
      const matchingString = match[1]
      const actualStringLength = matchingString.length + 1

      if (matchingString != null && actualStringLength >= minMatchLength) {
        return {
          leadOffset: match.index + maybeLeadingWhitespace.length,
          matchingString,
          replaceableString: matchingString,
        }
      }
    } else {
      // The strategy ignores leading whitespace but we need to know it's
      // length to add it to the leadOffset
      const maybeLeadingWhitespace = match[1]

      const matchingString = match[2]

      if (matchingString != null && matchingString.length >= minMatchLength) {
        return {
          leadOffset: match.index + maybeLeadingWhitespace.length,
          matchingString,
          replaceableString: matchingString,
        }
      }
    }
  }
  return null
}

const braced = true

function checkForAtSignVariables(
  text: string,
  minMatchLength: number
): VariableMatch | null {
  const match = braced
    ? BracedRegex.exec(text)
    : AtSignVariablesRegex.exec(text)

  if (match !== null) {
    const maybeLeadingWhitespace = ''
    const matchingString = match[0]

    if (matchingString.length >= minMatchLength) {
      return {
        leadOffset: match.index + maybeLeadingWhitespace.length,
        matchingString,
        replaceableString: match[0],
      }
    }
  }
  return null
}

// Checks input text for @value matches
function getPossibleVariableMatch(text: string): VariableMatch | null {
  // Will need to change this bit to match custom regex
  const match = checkForAtSignVariables(text, 2)
  return match === null ? checkForCapitalizedNameVariables(text, 3) : match
}

function isSelectionOnEntityBoundary(
  editor: LexicalEditor,
  offset: number
): boolean {
  if (offset !== 0) {
    return false
  }
  return editor.getEditorState().read(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const anchor = selection.anchor
      const anchorNode = anchor.getNode()
      const prevSibling = anchorNode.getPreviousSibling()
      return $isTextNode(prevSibling) && prevSibling.isTextEntity()
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

function getVariableOffset(
  documentText: string,
  entryText: string,
  offset: number
): number {
  let triggerOffset = offset
  for (let ii = triggerOffset; ii <= entryText.length; ii++) {
    if (documentText.substr(-ii) === entryText.substr(0, ii)) {
      triggerOffset = ii
    }
  }

  return triggerOffset
}

function createVariableNode(
  editor: LexicalEditor,
  entryText: string,
  match: VariableMatch
): void {
  editor.update(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
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
    if (!anchorNode.isSimpleText()) {
      return
    }
    const selectionOffset = anchor.offset
    const textContent = anchorNode.getTextContent().slice(0, selectionOffset)
    const characterOffset = match.replaceableString.length

    // Given a known offset for the mention match, look backward in the
    // text to see if there's a longer match to replace.
    const mentionOffset = getVariableOffset(
      textContent,
      entryText,
      characterOffset
    )
    const startOffset = selectionOffset - mentionOffset
    if (startOffset < 0) {
      return
    }

    let nodeToReplace
    if (startOffset === 0) {
      ;[nodeToReplace] = anchorNode.splitText(selectionOffset)
    } else {
      ;[, nodeToReplace] = anchorNode.splitText(startOffset, selectionOffset)
    }

    if ($isRangeSelection(selection)) {
      const variableNode = $createVariableNode(entryText)
      console.log('newnam', variableNode)

      nodeToReplace.replace(variableNode)
      return true
    }
  })
}

export const INSERT_VARIABLE_COMMAND: LexicalCommand<string> = createCommand()

function useVariables(editor: LexicalEditor): ReactPortal | null {
  const [resolution, setResolution] = useState<Resolution | null>(null)

  useEffect(() => {
    if (!editor.hasNodes([VariableNode])) {
      throw new Error('VariablesPlugin: VariableNode not registered on editor')
    }

    return editor.registerCommand<string>(
      INSERT_VARIABLE_COMMAND,
      (payload) => {
        const selection = $getSelection()

        if ($isRangeSelection(selection)) {
          const name = payload
          const variableNode = $createVariableNode(name)

          if ($isRootNode(selection.anchor.getNode())) {
            selection.insertParagraph()
          }

          selection.insertNodes([variableNode])
        }

        return true
      },
      COMMAND_PRIORITY_EDITOR
    )
  }, [editor])

  useEffect(() => {
    let activeRange: Range | null = document.createRange()
    let previousText: string | null = null

    const updateListener = () => {
      const range = activeRange
      const text = getVariablesTextToSearch(editor)

      if (text === previousText || range === null) {
        return
      }
      previousText = text

      if (text === null) {
        return
      }
      const match = getPossibleVariableMatch(text)
      if (
        match !== null &&
        !isSelectionOnEntityBoundary(editor, match.leadOffset)
      ) {
        const isRangePositioned = tryToPositionRange(match, range)
        if (isRangePositioned !== null) {
          /*startTransition(() =>
            setResolution({
              match,
              range,
            })
          )*/
          setResolution({
            match,
            range,
          })
          return
        }
      }
      //startTransition(() => setResolution(null))
      setResolution(null)
    }

    const removeUpdateListener = editor.registerUpdateListener(updateListener)

    return () => {
      activeRange = null
      removeUpdateListener()
    }
  }, [editor])

  /*const closeTypeahead = useCallback(() => {
    setResolution(null)
  }, [])*/

  //console.log('useVariables', resolution)

  if (resolution?.match.matchingString) {
    console.log('ting tong', resolution.match)
    createVariableNode(
      editor,
      resolution?.match.matchingString,
      resolution?.match
    )
  }

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

export default function VariablesPlugin(): ReactPortal | null {
  const [editor] = useLexicalComposerContext()
  return useVariables(editor)
}
