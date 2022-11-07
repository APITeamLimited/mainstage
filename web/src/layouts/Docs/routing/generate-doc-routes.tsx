import { DOCS_ROUTES } from '@apiteam/types/src'

import { Route } from '@redwoodjs/router'

import { DocsPage } from './DocsPage'

export const generateDocRoutes = () => (
  <>
    {Object.entries(DOCS_ROUTES).map(([routeName, path]) => (
      <Route path={path} page={DocsPage} name={routeName} key={routeName} />
    ))}
  </>
)
