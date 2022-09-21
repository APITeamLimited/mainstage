import { importers, ImportRequest } from 'insomnia-importers'

export const importToInsomnia = async (rawText: string) => {
  for (const importer of importers) {
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

export const getImporterNames = () => {
  // Restricted for now as not all work
  //return importers.map((i) => i.name)
  return importers.slice(0, 5).map((i) => i.name)
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
