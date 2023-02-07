import type { ExecutionOptions } from '../../../entities/execution-options'
import { TestData, Node } from '../test-data'

import { determineIfLocalhost } from './urls'

export const determineGlobetestAgent = (
  testData: TestData,
  executionOptions?: ExecutionOptions
): 'Cloud' | 'Local' => {
  if (executionOptions && executionOptions?.executionAgent !== 'Default') {
    return executionOptions.executionAgent
  }

  return determineNodeRecursive(testData.rootNode)
}

const determineNodeRecursive = (node: Node): 'Local' | 'Cloud' => {
  if (node.variant === 'httpRequest') {
    return determineIfLocalhost(node.finalRequest.url) ? 'Local' : 'Cloud'
  }

  if (node.variant === 'group') {
    for (const childNode of node.children) {
      if (determineNodeRecursive(childNode) === 'Local') {
        return 'Local'
      }
    }
  }

  return 'Cloud'
}
