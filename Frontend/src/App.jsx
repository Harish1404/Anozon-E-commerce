import DarkModeToggle from './components/DarkMode'
import ProductList from './pages/ProductList'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Cart from './pages/Cart'
import { Route, Routes } from 'react-router-dom'

import './App.css'

function App() {

  return (
    <>
      <div className='fixed top-4 left-4 z-50'>
        <DarkModeToggle />
      </div>
      
      <div className='bg-gray-200 dark:bg-gray-800 transition-colors ease-in-out duration-500 relative'>
          <Navbar />
          
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
          
          <Footer />
      </div>
    </>
  )
}

export default App
