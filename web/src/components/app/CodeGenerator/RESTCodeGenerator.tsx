import { RESTCodegenDefinitions } from 'src/utils/restCodeGen'

import { CodeGenerator } from './CodeGenerator'

type RESTCodeGeneratorProps = {
  onCloseAside: () => void
}

export const RESTCodeGenerator = ({ onCloseAside }: RESTCodeGeneratorProps) => {
  return (
    <CodeGenerator
      availableCodeGens={RESTCodegenDefinitions}
      onCloseAside={onCloseAside}
    />
  )
}
