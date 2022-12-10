import { ROUTES } from '@apiteam/types'
import { js2xml } from 'xml-js'

import { checkValue } from 'src/config'

export const handler = async (_1: never, _2: never) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
    body: js2xml({
      declaration: {
        attributes: {
          version: '1.0',
          encoding: 'UTF-8',
        },
      },
      elements: [
        {
          type: 'element',
          name: 'urlset',
          attributes: {
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            'xsi:schemaLocation':
              'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd',
            xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
          },
          elements: getContent(),
        },
      ],
    }),
  }
}

const gatewayUrl = checkValue<string>('gateway.url')

const bannedRoutes: string[] = [
  ROUTES.admin,
  ...Object.values(ROUTES).filter((route) => route.startsWith('/app')),
  ROUTES.resetPassword,
  ROUTES.userUnsubscribe,
  ROUTES.blanketUnsubscribe,
  ROUTES.acceptInvitation,
  ROUTES.declineInvitation,
  ROUTES.verifyEmail,
  ROUTES.deleteAccount,
  ROUTES.deleteTeam,
  ROUTES.changeOwner,
]

const getContent = () => {
  const allowedRoutes = Object.values(ROUTES).filter(
    (route) => !bannedRoutes.includes(route)
  )

  return Object.values(allowedRoutes).map((route) => ({
    type: 'element',
    name: 'url',
    elements: [
      {
        type: 'element',
        name: 'loc',
        elements: [
          {
            type: 'text',
            text: `${gatewayUrl}${route === '/' ? '' : route}`,
          },
        ],
      },
    ],
  }))
}
