import { useState } from 'react'

import { RESTRequest } from '@apiteam/types'
import * as Y from 'yjs'
import { useYMap } from 'zustand-yjs'

import { useRawBearer, useScopeId } from 'src/entity-engine/EntityEngine'
import { getFinalRequest } from 'src/globe-test/rest'
import {
  generateRESTCode,
  RESTCodegenDefinitions,
} from 'src/utils/code-gen/restCodeGen'

import {
  CodeGenDefinition,
  CodeGenerated,
  CodeGenerator,
} from './CodeGenerator'

type RESTCodeGeneratorProps = {
  onCloseAside: () => void
  requestYMap: Y.Map<any>
  activeEnvironmentYMap: Y.Map<any> | null
  collectionYMap: Y.Map<any>
}

export const RESTCodeGenerator = ({
  onCloseAside,
  requestYMap,
  activeEnvironmentYMap,
  collectionYMap,
}: RESTCodeGeneratorProps) => {
  const [codeGenerated, setCodeGenerated] = useState<
    CodeGenerated | 'NONE' | 'ERROR'
  >('NONE')
  useYMap(requestYMap)
  useYMap(activeEnvironmentYMap ?? new Y.Map())
  useYMap(collectionYMap)
  const scopeId = useScopeId()
  const rawBearer = useRawBearer()

  const handleGenerateCode = async (codeGen: CodeGenDefinition | null) => {
    if (!codeGen) {
      setCodeGenerated('ERROR')
      return
    }

    const restRequest: RESTRequest = {
      id: requestYMap.get('id'),
      __typename: requestYMap.get('__typename'),
      createdAt: requestYMap.get('createdAt'),
      updatedAt: requestYMap.get('updatedAt'),
      parentId: requestYMap.get('parentId'),
      __parentTypename: requestYMap.get('__parentTypename'),
      name: requestYMap.get('name'),
      orderingIndex: requestYMap.get('orderingIndex'),
      method: requestYMap.get('method'),
      endpoint: requestYMap.get('endpoint'),
      params: requestYMap.get('params'),
      headers: requestYMap.get('headers'),
      auth: requestYMap.get('auth'),
      body: requestYMap.get('body'),
      pathVariables: requestYMap.get('pathVariables'),
      description: requestYMap.get('description'),
    }

    if (!scopeId) throw new Error('No scopeId found')
    if (!rawBearer) throw new Error('No rawBearer found')

    const axiosConfig = await getFinalRequest(
      restRequest,
      requestYMap,
      activeEnvironmentYMap,
      collectionYMap,
      scopeId,
      rawBearer
    )

    const code = generateRESTCode(codeGen.name, axiosConfig) as string | 'ERROR'

    if (code === 'ERROR') {
      setCodeGenerated('ERROR')
      return
    }

    if (code === 'NONE') {
      setCodeGenerated('NONE')
      return
    }

    if (
      typeof codeGenerated === 'object' &&
      codeGenerated?.value === code &&
      codeGenerated?.language === codeGen.lang
    ) {
      return
    }

    setCodeGenerated({
      language: codeGen.lang,
      value: code,
    })
  }

  return (
    <CodeGenerator
      availableCodeGens={RESTCodegenDefinitions}
      onCloseAside={onCloseAside}
      onGenerateCode={handleGenerateCode}
      codeGenerated={codeGenerated}
      monacoNamespace="restCodeGenerator"
    />
  )
}
