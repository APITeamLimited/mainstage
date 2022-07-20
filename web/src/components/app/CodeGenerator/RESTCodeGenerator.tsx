import { RESTCodegenDefinitions } from 'src/utils/restCodeGen'

import { CodeGenerator } from './CodeGenerator'

export const RESTCodeGenerator = () => {
  return <CodeGenerator availableCodeGens={RESTCodegenDefinitions} />
}
