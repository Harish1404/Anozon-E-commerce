import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import withAuth from "../hoc/withAuth";
import CartItems from "../components/CartItems";
import CartSummary from "../components/CartSummary";

const Cart = () => {
  const { cart, removeCart, calculateTotal, cartLoading, cartError } = useContext(CartContext);
  const navigate = useNavigate();

  const total = calculateTotal();

  const handleRemoveItem = async (productId) => {
    await removeCart(productId);
  };

  if (cartLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-indigo-500">
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
            <div className="lg:col-span-2">
              <CartItems cart={cart} onRemoveItem={handleRemoveItem} />
            </div>

            <div className="lg:col-span-1">
              <CartSummary cart={cart} total={total} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default withAuth(Cart);
