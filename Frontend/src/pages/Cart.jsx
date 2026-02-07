import { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  
  const { cart, removeCart, calculateTotal, cartLoading, cartError, loadCart } = useContext(CartContext);
  const { isAuth } = useAuth();
  const navigate = useNavigate();
  const [applyCoupon, setApplyCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
      return;
    }
  }, [isAuth, navigate]);

  const total = calculateTotal();
  const discountedTotal = Math.max(0, total - discount);

  const handleRemoveItem = async (productId) => {
    await removeCart(productId);
  };

  const handleApplyCoupon = () => {
    // Example coupon logic
    if (couponCode === "SAVE10") {
      setDiscount(total * 0.1);
      alert("Coupon applied! 10% discount");
    } else if (couponCode === "SAVE20") {
      setDiscount(total * 0.2);
      alert("Coupon applied! 20% discount");
    } else {
      alert("Invalid coupon code");
      setDiscount(0);
    }
  };

  if (cartLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Loading cart...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-amber-400">
          🛒 Shopping Cart
        </h1>

        {cartError && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg">
            {cartError}
          </div>
        )}

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-6">
              Your cart is empty 🛒
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items Section */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Items ({cart.length})
                  </h2>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                  {cart.map((item) => {
                    const itemPrice = item.product?.price || item.price || 0;
                    const quantity = item.quantity || 1;
                    const itemTotal = itemPrice * quantity;

                    return (
                      <div
                        key={item.product_id}
                        className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <img
                              src={item.product?.image_url || item.image_url}
                              alt={item.product?.name || item.name}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-grow">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {item.product?.name || item.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {item.product?.description || item.description}
                            </p>

                            {/* Price and Quantity */}
                            <div className="mt-3 flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Price: ₹{itemPrice.toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Quantity: {quantity}
                                </p>
                                <p className="text-lg font-bold text-gray-900 dark:text-amber-400 mt-1">
                                  ₹{itemTotal.toFixed(2)}
                                </p>
                              </div>

                              <button
                                onClick={() =>
                                  handleRemoveItem(item.product_id)
                                }
                                className="ml-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary Section */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 shadow-lg sticky top-20">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Order Summary
                </h2>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 border-b border-gray-200 dark:border-slate-700 pb-4">
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Subtotal ({cart.length} items):</span>
                    <span className="font-semibold">₹{total.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount:</span>
                      <span className="font-semibold">
                        -₹{discount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Shipping:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      Free
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      Total:
                    </span>
                    <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-amber-400 dark:to-amber-500">
                      ₹{discountedTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Coupon Section */}
                <div className="mb-6 p-4 bg-white dark:bg-slate-700 rounded-lg">
                  <label className="flex items-center gap-3 font-semibold text-gray-700 dark:text-gray-300 mb-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyCoupon}
                      onChange={(e) => setApplyCoupon(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 dark:accent-amber-400"
                    />
                    Apply Coupon Code
                  </label>

                  {applyCoupon && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    Try: SAVE10 or SAVE20
                  </p>
                </div>

                {/* Checkout Button */}
                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg">
                  Proceed to Checkout
                </button>

                {/* Continue Shopping Button */}
                <button
                  onClick={() => navigate("/")}
                  className="w-full mt-3 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
