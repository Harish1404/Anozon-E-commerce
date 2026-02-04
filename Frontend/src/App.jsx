import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import DarkModeToggle from './components/DarkMode'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProductList from './pages/ProductList'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { useAuth } from './context/AuthContext'

import './App.css'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuth, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600 dark:text-gray-400'>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuth) {
    return <Navigate to='/login' replace />
  }

  return children
}

// Public Route Component (redirects to home if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuth, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600 dark:text-gray-400'>Loading...</p>
        </div>
      </div>
    )
  }

  if (isAuth) {
    return <Navigate to='/' replace />
  }

  return children
}

function App() {
  const { isAuth, isLoading } = useAuth()

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-200 dark:bg-gray-800'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600 dark:text-gray-400'>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Main Content */}
      <div className='bg-gray-200 dark:bg-gray-800 transition-colors ease-in-out duration-500 relative min-h-screen'>
        {/* Show Navbar only if authenticated */}
        {isAuth && <Navbar />}

        <Routes>
          {/* Public Routes (Login & Signup) */}
          <Route
            path='/login'
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path='/signup'
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          {/* Protected Routes (require authentication) */}
          <Route
            path='/'
            element={
              <ProtectedRoute>
                <ProductList />
              </ProtectedRoute>
            }
          />
          <Route
            path='/cart'
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to login if not authenticated, home if authenticated */}
          <Route
            path='*'
            element={isAuth ? <Navigate to='/' replace /> : <Navigate to='/login' replace />}
          />
        </Routes>

        {/* Show Footer only if authenticated */}
        {isAuth && <Footer />}
      </div>
    </>
  )
}

export default App
