import type { Map as YMap } from 'yjs'

import { TestData } from '../test-data'

export type GenerateTestDataArgs = {
  targetNode: YMap<any>
  scriptName: string
}

export const generateTestData = ({
  targetNode,
}: GenerateTestDataArgs): Promise<TestData> => {
  throw new Error('Not implemented')
}
