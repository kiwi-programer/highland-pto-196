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

export function Auth0Provider({ children }) {
  return <AuthContext.Provider value={dormantAuthState}>{children}</AuthContext.Provider>
}

export function useAuth0() {
  return useContext(AuthContext)
}