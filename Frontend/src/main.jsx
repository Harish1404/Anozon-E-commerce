import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { CartProvider } from './context/CartContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <CartProvider>  
      <StrictMode>
        <App />
      </StrictMode>
    </CartProvider>
  </BrowserRouter>
)
