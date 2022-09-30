export const defaultScript = {
  name: 'Default',
  language: 'javascript',
  builtIn: true,
  description: 'Default script for REST requests',
  script:
    "import { ExecutionScript } from '@apiteam/types/src'\n\nexport const BUILTIN_REST_SCRIPTS = [] as ExecutionScript[]\n",
}
