import { Workspace } from '@apiteam/types/src'

import { navigate, routes } from '@redwoodjs/router'

import { activeWorkspaceIdVar } from 'src/contexts/reactives'

export const navigatePersonalSettings = ({
  workspaces,
  activeWorkspaceId,
}: {
  workspaces: Workspace[]
  activeWorkspaceId: string | null
}) => {
  // Set active workspace to personal workspace
  const personalWorkspace = workspaces.find(
    (workspace) => workspace.scope?.variant === 'USER'
  )

  if (!personalWorkspace) {
    throw new Error('No personal workspace found')
  }

  if (personalWorkspace.id !== activeWorkspaceId) {
    activeWorkspaceIdVar(personalWorkspace.id)

    const usingTls = window.location.protocol === 'https:'
    const domain = window.location.hostname
    const port = window.location.port
    const path = routes.settingsWorkspace()
    const personalSettingsUrl = `${usingTls ? 'https' : 'http'}://${domain}${
      port ? `:${port}` : ''
    }${path}`

    window.location.href = personalSettingsUrl
  } else {
    navigate(routes.settingsWorkspace())
  }
}

export const handleLogout = (logOut: () => void) => {
  // Clear local storage of everything
  logOut()

  localStorage.clear()

  // Clear all cookies
  document.cookie.split(';').forEach(function (c) {
    document.cookie = c
      .replace(/^ +/, '')
      .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
  })

  navigate(routes.splash())
  window.location.reload()
}
