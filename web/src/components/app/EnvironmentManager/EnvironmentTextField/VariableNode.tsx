import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
  Spread,
} from 'lexical'

import type { LexicalModule } from './module'
import { VariableChip } from './VariableChip'

export type SerializedVariableNode = Spread<
  {
    variableName: string
    type: 'variable'
    version: 1
  },
  SerializedTextNode
>

const convertVariableElement = (
  domNode: HTMLElement,
  VariableNodeClass: VariableNodeType
): DOMConversionOutput | null => {
  const textContent = domNode.textContent

  if (textContent !== null && textContent !== '') {
    const node = $createVariableNode(textContent, VariableNodeClass)
    return {
      node,
    }
  }

  return null
}

export const VariableNodeClass = (lexical: LexicalModule) => {
  return class VariableNode extends lexical.DecoratorNode<JSX.Element> {
    __variable: string

    static getType(): string {
      return 'variable'
    }

    static clone(node: VariableNode): VariableNode {
      return new VariableNode(node.__variable, node.__key)
    }
    static importJSON(serializedNode: SerializedVariableNode): VariableNode {
      const node = $createVariableNode(serializedNode.variableName, this)
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
}

export type VariableNodeType = ReturnType<typeof VariableNodeClass>

export const $createVariableNode = (
  variableName: string,
  VariableNodeClass: VariableNodeType
) => {
  const variableNode = new VariableNodeClass(variableName)
  return variableNode
}

export const $isVariableNode = (
  node: LexicalNode | null | undefined,
  VariableNodeClass: VariableNodeType
) => {
  return node instanceof VariableNodeClass
}
