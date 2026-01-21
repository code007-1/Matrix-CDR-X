import { RouterProvider } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react'
import { router } from './routes/urls'
import { Toaster } from '@/components/ui/toaster'
import { Provider } from 'react-redux'
import store from './modules/contexts/store'
import "./assets/main.css"

import { ThemeProvider } from "@/components/theme-provider"

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Toaster />
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </ThemeProvider>
  </StrictMode >,
)