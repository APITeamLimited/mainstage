/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useEffect } from 'react'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalTextEntity } from '@lexical/react/useLexicalTextEntity'
import type { TextNode } from 'lexical'

import { $createKeywordNode, KeywordNode } from './KeywordNode'

const KEYWORDS_REGEX = /{(.*?)}/

export default function KeywordsPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([KeywordNode])) {
      throw new Error('KeywordsPlugin: KeywordNode not registered on editor')
    }
  }, [editor])

  const createKeywordNode = useCallback((textNode: TextNode): KeywordNode => {
    return $createKeywordNode(textNode.getTextContent())
  }, [])

  const getKeywordMatch = useCallback((text: string) => {
    const matchArr = KEYWORDS_REGEX.exec(text)

    if (matchArr === null) {
      return null
    }

    console.log('Match', matchArr)

    const hashtagLength = matchArr[2].length
    const startOffset = matchArr.index + matchArr[1].length
    const endOffset = startOffset + hashtagLength
    return {
      end: endOffset,
      start: startOffset,
    }
  }, [])

  useLexicalTextEntity<KeywordNode>(
    getKeywordMatch,
    KeywordNode,
    createKeywordNode
  )

  return null
}
