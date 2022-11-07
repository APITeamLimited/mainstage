import { DOCS_CONTENT_INDEX } from '@apiteam/types/src'

import { Route } from '@redwoodjs/router'

import { DocsPage } from './DocsPage'

export const generateDocRoutes = () => (
  <>
    {Object.entries(DOCS_CONTENT_INDEX).map(([routeName, path]) => (
      <Route path={path} page={DocsPage} name={routeName} key={routeName} />
    ))}
  </>
)
