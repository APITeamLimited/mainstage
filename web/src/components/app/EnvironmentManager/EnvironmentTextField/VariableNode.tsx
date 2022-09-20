import { DecoratorNode, Spread } from 'lexical'
import {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
} from 'lexical'

import { VariableChip } from './VariableChip'

export type SerializedVariableNode = Spread<
  {
    variableName: string
    type: 'variable'
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

export class VariableNode extends DecoratorNode<JSX.Element> {
  __variable: string

  static getType(): string {
    return 'variable'
  }

  static clone(node: VariableNode): VariableNode {
    return new VariableNode(node.__variable, node.__key)
  }
  static importJSON(serializedNode: SerializedVariableNode): VariableNode {
    const node = $createVariableNode(serializedNode.variableName)
    return node
  }

  constructor(variableName: string, text?: string, key?: NodeKey) {
    super(key)
    this.__variable = variableName
  }

  exportJSON() {
    return {
      variableName: this.__variable,
      type: 'variable',
      version: 1,
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span')
    element.setAttribute('data-lexical-variable', this.__variable)
    return { element }
  }

  createDOM(): HTMLElement {
    const elem = document.createElement('span')
    elem.style.display = 'inline-block'
    return elem
  }

  updateDOM(): false {
    return false
  }

  decorate(): JSX.Element {
    return <VariableChip variableName={this.__variable} />
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-variable')) {
          return null
        }
        return {
          conversion: convertVariableElement,
          priority: 2,
        }
      },
    }
  }
}

export function $createVariableNode(variableName: string): VariableNode {
  const variableNode = new VariableNode(variableName)
  //variableNode.setMode('segmented').toggleDirectionless()
  return variableNode
}

export function $isVariableNode(
  node: LexicalNode | null | undefined
): node is VariableNode {
  return node instanceof VariableNode
}
