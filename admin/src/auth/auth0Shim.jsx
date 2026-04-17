import { Auth0Provider as SDKAuth0Provider, useAuth0 as useAuth0Sdk } from '@auth0/auth0-react'
import { createContext, useContext } from 'react'

const dormantAuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  loginWithRedirect: async () => {},
  logout: () => {},
  getAccessTokenSilently: async () => ''
}

const AuthContext = createContext({
  ...dormantAuthState
})

const authConfig = {
  domain: String(import.meta.env.VITE_AUTH0_DOMAIN || '').trim(),
  clientId: String(import.meta.env.VITE_AUTH0_CLIENT_ID || '').trim(),
  audience: String(import.meta.env.VITE_AUTH0_AUDIENCE || '').trim(),
  scope: String(import.meta.env.VITE_AUTH0_SCOPE || 'openid profile email admin:write').trim(),
  redirectUri: String(import.meta.env.VITE_AUTH0_REDIRECT_URI || '').trim()
}

const authEnabled = Boolean(authConfig.domain && authConfig.clientId && authConfig.audience)

function Auth0ContextBridge({ children }) {
  const value = useAuth0Sdk()
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function Auth0Provider({ children }) {
  if (!authEnabled) {
    return <AuthContext.Provider value={dormantAuthState}>{children}</AuthContext.Provider>
  }

  const redirectUri = authConfig.redirectUri || window.location.origin

  return (
    <SDKAuth0Provider
      domain={authConfig.domain}
      clientId={authConfig.clientId}
      cacheLocation="localstorage"
      useRefreshTokens
      authorizationParams={{
        audience: authConfig.audience,
        scope: authConfig.scope,
        redirect_uri: redirectUri
      }}
    >
      <Auth0ContextBridge>{children}</Auth0ContextBridge>
    </SDKAuth0Provider>
  )
}

export function useAuth0() {
  return useContext(AuthContext)
}