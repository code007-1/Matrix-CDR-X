import { RouterProvider } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react'
import { router } from './routes/urls'
import { Toaster } from '@/components/ui/toaster'
import { Provider } from 'react-redux'
import store from './modules/contexts/store'
import "./assets/main.css"

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster />
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode >,
)