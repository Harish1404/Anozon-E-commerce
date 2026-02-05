import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../services/auth'

const AdminDashboard = () => {
  const { isAdmin, isLoading } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    stock: '',
  })

  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && !isAdmin()) {
      navigate('/')
    }
  }, [isAdmin, isLoading, navigate])

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiRequest('/products/list')
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load products on mount
  useEffect(() => {
    if (!isLoading && isAdmin()) {
      fetchProducts()
    }
  }, [isLoading, isAdmin])

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle create/update product
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)

      const url = editingProduct 
        ? `/admin/product/replace_product/${editingProduct._id}`
        : '/admin/products/create_products'
      
      const method = editingProduct ? 'PUT' : 'POST'
      
      const response = await apiRequest(url, {
        method,
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to save product')
      }

      // Reset form and refresh products
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: '',
        stock: '',
      })
      setEditingProduct(null)
      setShowForm(false)
      await fetchProducts()
    } catch (err) {
      setError(err.message)
      console.error('Error saving product:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle edit product
  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      image_url: product.image_url || '',
      stock: product.stock || '',
    })
    setShowForm(true)
  }

  // Handle delete product
  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return

    try {
      setLoading(true)
      setError(null)

      const response = await apiRequest(`/admin/product/delete_product/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to delete product')
      }

      await fetchProducts()
    } catch (err) {
      setError(err.message)
      console.error('Error deleting product:', err)
    } finally {
      setLoading(false)
    }
  }

  // Close form
  const handleCloseForm = () => {
    setShowForm(false)
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image_url: '',
      stock: '',
    })
  }

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

  return (
    <div className='min-h-screen bg-gray-200 dark:bg-gray-800 p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8 flex justify-between items-center'>
          <div>
            <h1 className='text-4xl font-bold text-gray-800 dark:text-white mb-2'>Admin Dashboard</h1>
            <p className='text-gray-600 dark:text-gray-400'>Manage your products</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingProduct(null)
            }}
            className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors'
          >
            Add New Product
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className='mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded'>
            {error}
          </div>
        )}

        {/* Product Form Modal */}
        {showForm && (
          <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
            <div className='bg-white dark:bg-gray-700 rounded-lg p-8 max-w-md w-full'>
              <h2 className='text-2xl font-bold mb-6 text-gray-800 dark:text-white'>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              
              <form onSubmit={handleSubmit} className='space-y-4'>
                <input
                  type='text'
                  name='name'
                  placeholder='Product Name'
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                
                <textarea
                  name='description'
                  placeholder='Description'
                  value={formData.description}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                  rows='3'
                ></textarea>
                
                <input
                  type='number'
                  name='price'
                  placeholder='Price'
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  step='0.01'
                  className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                
                <input
                  type='text'
                  name='category'
                  placeholder='Category'
                  value={formData.category}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                
                <input
                  type='url'
                  name='image_url'
                  placeholder='Image URL'
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                
                <input
                  type='number'
                  name='stock'
                  placeholder='Stock'
                  value={formData.stock}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                
                <div className='flex gap-3 pt-4'>
                  <button
                    type='submit'
                    disabled={loading}
                    className='flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors'
                  >
                    {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                  <button
                    type='button'
                    onClick={handleCloseForm}
                    className='flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors'
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className='bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden'>
          {loading && !products.length ? (
            <div className='p-8 text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
              <p className='text-gray-600 dark:text-gray-400'>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className='p-8 text-center text-gray-600 dark:text-gray-400'>
              No products found. Create your first product!
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-100 dark:bg-gray-600 border-b-2 border-gray-300 dark:border-gray-500'>
                  <tr>
                    <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-white'>Name</th>
                    <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-white'>Category</th>
                    <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-white'>Price</th>
                    <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-white'>Stock</th>
                    <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-white'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className='border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors'>
                      <td className='px-6 py-4 text-sm text-gray-800 dark:text-gray-200'>{product.name}</td>
                      <td className='px-6 py-4 text-sm text-gray-800 dark:text-gray-200'>{product.category}</td>
                      <td className='px-6 py-4 text-sm text-gray-800 dark:text-gray-200'>${product.price.toFixed(2)}</td>
                      <td className='px-6 py-4 text-sm text-gray-800 dark:text-gray-200'>{product.stock}</td>
                      <td className='px-6 py-4 text-sm space-x-2 flex'>
                        <button
                          onClick={() => handleEdit(product)}
                          className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors text-xs font-medium'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className='bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors text-xs font-medium'
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
