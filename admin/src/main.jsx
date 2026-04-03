import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { Auth0Provider } from './auth/auth0Shim.jsx'
import './index.css'

const root = createRoot(document.getElementById('root'))

const authEnabled = Boolean(
  import.meta.env.VITE_AUTH0_DOMAIN &&
  import.meta.env.VITE_AUTH0_CLIENT_ID &&
  import.meta.env.VITE_AUTH0_AUDIENCE
)

root.render(
  <StrictMode>
    <Auth0Provider>
      <BrowserRouter>
        <App authEnabled={authEnabled} />
      </BrowserRouter>
    </Auth0Provider>
  </StrictMode>
)