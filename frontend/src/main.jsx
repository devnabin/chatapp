import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.jsx'

//router
import {
  BrowserRouter
} from 'react-router-dom'




const root = document.getElementById('root')
createRoot(root).render(
    <BrowserRouter>
          <App />
        </BrowserRouter>
)
