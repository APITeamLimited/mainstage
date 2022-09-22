import type { ImportRequest } from 'insomnia-importers'

const loadImporters = async () => {
  const importers = await import('insomnia-importers')
  return importers
}

export const importToInsomnia = async (rawText: string) => {
  const importerModule = await loadImporters()

  for (const importer of importerModule.importers) {
    try {
      const output = await importer.convert(rawText)

      if (output) {
        return {
          output,
          importerName: importer.name,
        }
      }
    } catch (err) {
      // ignore
    }
  }

  return null
}

export const getImporterNames = async (): Promise<string[]> => {
  // Restricted for now as not all work
  //return importers.map((i) => i.name)
  const importers = await loadImporters()
  return importers.importers.slice(0, 5).map((i) => i.name)
}

export const getAuth = async ({
  item,
  disableInherit,
}: {
  item: ImportRequest
  disableInherit?: boolean
}) => {
  if (!item.authentication) {
    return disableInherit
      ? {
          authType: 'none',
        }
      : {
          authType: 'inherit',
        }
  }

  if (item.authentication?.type === 'basic') {
    return {
      authType: 'basic',
      username: item.authentication.username,
      password: item.authentication.password,
    }
  } else if (item.authentication?.disabled) {
    return {
      authType: 'none',
    }
  } else if (item.authentication?.type === 'oauth2') {
    return {
      authType: 'oauth2',
      token: item.authentication.clientSecret,
      oidcDiscoveryURL: item.authentication.accessTokenUrl,
      authorizationURL: item.authentication.authorizationUrl,
      clientID: item.authentication.clientId,
      scope: item.authentication.scope,
    }
  }

  return disableInherit
    ? {
        authType: 'none',
      }
    : {
        authType: 'inherit',
      }
}
