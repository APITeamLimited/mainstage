/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Spread } from 'lexical'
import {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
  TextNode,
} from 'lexical'

export type SerializedVariableNode = Spread<
  {
    mentionName: string
    type: 'mention'
    version: 1
  },
  SerializedTextNode
>

function convertVariableElement(
  domNode: HTMLElement
): DOMConversionOutput | null {
  const textContent = domNode.textContent

  if (textContent !== null) {
    const node = $createVariableNode(textContent)
    return {
      node,
    }
  }

  return null
}

const mentionStyle = 'background-color: rgba(24, 119, 232, 0.2)'
export class VariableNode extends TextNode {
  __mention: string

  static getType(): string {
    return 'mention'
  }

  static clone(node: VariableNode): VariableNode {
    return new VariableNode(node.__mention, node.__text, node.__key)
  }
  static importJSON(serializedNode: SerializedVariableNode): VariableNode {
    const node = $createVariableNode(serializedNode.mentionName)
    node.setTextContent(serializedNode.text)
    node.setFormat(serializedNode.format)
    node.setDetail(serializedNode.detail)
    node.setMode(serializedNode.mode)
    node.setStyle(serializedNode.style)
    return node
  }

  constructor(mentionName: string, text?: string, key?: NodeKey) {
    super(text ?? mentionName, key)
    this.__mention = mentionName
  }

  exportJSON(): SerializedVariableNode {
    return {
      ...super.exportJSON(),
      mentionName: this.__mention,
      type: 'mention',
      version: 1,
    }
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config)
    dom.style.cssText = mentionStyle
    dom.className = 'mention'
    return dom
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span')
    element.setAttribute('data-lexical-mention', 'true')
    element.textContent = this.__text
    return { element }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-mention')) {
          return null
        }
        return {
          conversion: convertVariableElement,
          priority: 1,
        }
      },
    }
  }

  isTextEntity(): true {
    return true
  }
}

export function $createVariableNode(mentionName: string): VariableNode {
  const mentionNode = new VariableNode(mentionName)
  mentionNode.setMode('segmented').toggleDirectionless()
  return mentionNode
}

export function $isVariableNode(
  node: LexicalNode | null | undefined
): node is VariableNode {
  return node instanceof VariableNode
}
