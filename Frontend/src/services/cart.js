import { apiRequest} from "./auth";
// Fetch current user's cart



export const fetchCart = async () => {
  const response = await apiRequest('/cart', {
    method: 'GET',
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || 'Failed to fetch cart')
  }

  return response.json()
}

// Add an item to cart (or increase quantity)
export const addToCart = async (productId, quantity = 1) => {

  const response = await apiRequest('/cart', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, quantity }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || 'Failed to add item to cart')
  }

  return response.json()
}

// Update quantity of an existing cart item
export const updateCartItem = async (itemId, quantity) => {

  const response = await apiRequest(`/cart/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || 'Failed to update cart item')
  }

  return response.json()
}

// Remove a specific item from cart
export const removeFromCart = async (itemId) => {
    
  const response = await apiRequest(`/cart/items/${itemId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || 'Failed to remove item from cart')
  }

  return response.json()
}

// Clear the entire cart
export const clearCart = async () => {
  const response = await apiRequest('/cart', {
    method: 'DELETE',
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || 'Failed to clear cart')
  }

  return response.json()
}

export default {
  fetchCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
}

