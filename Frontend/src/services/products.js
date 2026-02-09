import { apiRequest } from './auth'

const PRODUCTS_ENDPOINT = import.meta.env.VITE_PRODUCTS_GET || '/products'

// Fetch all products with optional query params (category, page, limit, etc.)
export const fetchProducts = async (params = {}) => {
    
  const query = new URLSearchParams(params).toString()
  const path = PRODUCTS_ENDPOINT + (query ? `?${query}` : '')

  const response = await apiRequest(path)
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || 'Failed to fetch products')
  }

  const data = await response.json()
  // backend may return an array or an object (e.g. { products: [...] })
  const items = Array.isArray(data) ? data : data.products || []

  // normalize product shape for frontend components
  return items.map((p) => ({
    id: p._id || p.id || null,
    _id: p._id || p.id || null,
    name: p.name || '',
    description: p.description || '',
    price: typeof p.price === 'string' ? parseFloat(p.price) : p.price || 0,
    category: p.category || '',
    // frontend components expect `url` for image; backend uses `image_url`
    url: p.image_url || p.url || '',
    image_url: p.image_url || p.url || '',
    stock: p.stock || p.stock_quantity || 0,
    likes: p.likes || p.likes_count || (Array.isArray(p.liked_by) ? p.liked_by.length : 0),
    raw: p,
  }))
}

export const fetchProductById = async (productId) => {
  const response = await apiRequest(`${PRODUCTS_ENDPOINT}/${productId}`)
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || 'Failed to fetch product')
  }
  const p = await response.json()
  return normalizeProduct(p)
}

// Enrich cart items with product details
export const enrichCartItems = async (cartItems) => {
  try {
    return await Promise.all(
          cartItems.map(async (item) => {
            try {
              const product = await fetchProductById(item.product_id)
              return {
                ...item,
                product,
              }
            } catch (error) {
              console.error(`Failed to fetch product ${item.product_id}:`, error)
              // Return cart item with empty product details if fetch fails
              return {
                ...item,
                product: null,
              }
            }
          })
        );
  } catch (error) {
    console.error('Error enriching cart items:', error)
    return cartItems
  }
}

const normalizeProduct = (p) => ({
  id: p._id || p.id || null,
  _id: p._id || p.id || null,
  name: p.name || '',
  description: p.description || '',
  price: typeof p.price === 'string' ? parseFloat(p.price) : p.price || 0,
  category: p.category || '',
  url: p.image_url || p.url || '',
  image_url: p.image_url || p.url || '',
  stock: p.stock || p.stock_quantity || 0,
  likes: p.likes || p.likes_count || (Array.isArray(p.liked_by) ? p.liked_by.length : 0),
  raw: p,
})

export default {
  fetchProducts,
  fetchProductById,
  enrichCartItems,
}
