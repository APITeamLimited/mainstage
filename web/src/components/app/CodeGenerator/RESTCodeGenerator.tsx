import { useState } from 'react'

import { RESTRequest } from '@apiteam/types'
import * as Y from 'yjs'

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
}

export const RESTCodeGenerator = ({
  onCloseAside,
  requestYMap,
}: RESTCodeGeneratorProps) => {
  const [codeGenerated, setCodeGenerated] = useState<CodeGenerated>(null)

  const handleGenerateCode = (codeGen: CodeGenDefinition | null) => {
    if (!codeGen) {
      setCodeGenerated(null)
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
    }

    const code = generateRESTCode(codeGen.name, restRequest)

    if (
      codeGenerated?.value === code &&
      codeGenerated?.language === codeGen.lang
    ) {
      return
    }

    setCodeGenerated(
      code
        ? {
            language: codeGen.lang,
            value: code,
          }
        : null
    )
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
