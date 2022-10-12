import { useEffect, useState } from 'react'

import { RESTRequest } from '@apiteam/types/src'
import type { Doc as YDoc, Map as YMap } from 'yjs'
import { useYMap } from 'src/lib/zustand-yjs'

import { useYJSModule } from 'src/contexts/imports'
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
  requestYMap: YMap<any>
  activeEnvironmentYMap: YMap<any> | null
  collectionYMap: YMap<any>
}

export const RESTCodeGenerator = ({
  onCloseAside,
  requestYMap,
  activeEnvironmentYMap,
  collectionYMap,
}: RESTCodeGeneratorProps) => {
  const Y = useYJSModule()

  const [codeGenerated, setCodeGenerated] = useState<CodeGenerated | 'NONE'>(
    'NONE'
  )
  const [denyMessage, setDenyMessage] = useState<string | null>('')
  const [codeGen, setCodeGen] = useState<CodeGenDefinition | null>(
    RESTCodegenDefinitions[0]
  )

  useYMap(requestYMap)
  useYMap(activeEnvironmentYMap ?? new Y.Map())
  useYMap(collectionYMap)

  const scopeId = useScopeId()
  const rawBearer = useRawBearer()

  useEffect(() => {
    const handleGenerateCode = async () => {
      if (!codeGen) {
        setCodeGenerated('NONE')
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
        collectionYMap
      )

      const code = (await generateRESTCode(
        codeGen.name,
        axiosConfig,
        restRequest,
        activeEnvironmentYMap,
        collectionYMap
      )) as string | 'NONE'

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

    handleGenerateCode()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    requestYMap,
    activeEnvironmentYMap,
    collectionYMap,
    scopeId,
    rawBearer,
    codeGen,
  ])

  return (
    <CodeGenerator
      availableCodeGens={RESTCodegenDefinitions}
      onCloseAside={onCloseAside}
      onGenerateCode={setCodeGen}
      codeGenerated={codeGenerated}
      monacoNamespace="restCodeGenerator"
      denyMessage={denyMessage}
    />
  )
}
