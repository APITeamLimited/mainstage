import { ReactNode } from 'react'

import { DecoratorNode, LexicalNode, NodeKey } from 'lexical'

import { VariableChip } from './VariableChip'

export class VariableNode extends DecoratorNode<ReactNode> {
  variableName: string

  static getType(): string {
    return 'environmentVariable'
  }

  static clone(node: VariableNode): VariableNode {
    return new VariableNode(node.__id, node.__key)
  }

  constructor(variableName: string, key?: NodeKey) {
    super(key)
    this.variableName = variableName
  }

  // Base html element holding the react component
  createDOM(): HTMLElement {
    return document.createElement('span')
  }

  // Decide when the component should be updated
  updateDOM() {
    return true
  }

  decorate(): ReactNode {
    return <VariableChip variableName={this.variableName} />
  }
}

export function $createVariableNode(variableName: string): VariableNode {
  return new VariableNode(variableName)
}

export function $isVariableNode(node?: LexicalNode): boolean {
  return node instanceof VariableNode
}
