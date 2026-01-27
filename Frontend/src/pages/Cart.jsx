import React, { useContext } from 'react'
import { CartContext } from '../context/CartContext'

const Cart = () => {
  const { cart, removeCart } = useContext(CartContext)

  return (
    <div >
      <h1 className='text-2xl font-bold text-center mt-4 dark:text-amber-400'>Shopping Cart</h1>

      {cart.length === 0 ? (
        <p className='text-center mt-4 text-gray-500'>Your cart is empty 🛒</p>
      ) : (
        <div className='flex gap-4 justify-evenly'>
          <div className="grid grid-cols-3 gap-4 mt-6 ml-2">
            {cart.map((item) => (
              <div 
                key={item.id} 
                className='p-4 flex items-center gap-4 rounded-2xl border-white shadow-md bg-white'
              >
                <img 
                  className='object-cover h-32 w-32 rounded-xl' 
                  src={item.url} 
                  alt={item.name} 
                />
                <div className='flex-1 '>
                  <h1 className='text-lg text-black font-bold'>{item.name}</h1>
                  <p className='text-gray-700'>₹{item.price}</p>
                </div>
                <button 
                  onClick={() => removeCart(item.id)} 
                  className='bg-red-500 text-white px-4 py-2 cursor-pointer rounded-lg hover:bg-red-600 transition'>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="p-6 flex flex-col justify-between  gap-4 rounded-2xl border-none h-46 mt-6  shadow-xl
                bg-gradient-to-t from-gray-100 via-gray-200 to-gray-300
                dark:from-indigo-800 dark:via-indigo-900 dark:to-indigo-900
                dark:border-gray-700 transition-colors duration-300">
  
            {/* Subtotal */}
            <h1>
              <span className="font-mono text-xl text-gray-800 dark:text-gray-200">
                Subtotal ({cart.length} items): 
              </span>
              <span className="font-extrabold font-mono text-xl ml-2 text-indigo-900 dark:text-amber-300">
                ₹{cart.reduce((acc, item) => acc + item.price, 0)}
              </span>
            </h1>

            {/* Apply Coupon */}
            <label className="flex gap-2 items-center text-gray-700 dark:text-gray-300 font-mono">
              <input
                className="w-4 h-4 accent-indigo-600 dark:accent-amber-400 hover:cursor-pointer"
                type="checkbox"
              />
              Apply coupon
            </label>

            {/* Button */}
            <button className="bg-amber-400 px-8 py-2 rounded-lg font-semibold cursor-pointer
                               text-black hover:bg-amber-600 active:scale-90 transition
                               dark:bg-amber-300 dark:hover:bg-amber-400">
              Proceed To Pay
            </button>
          </div>
        </div>

      )}
    </div>
  )
}

export default Cart
