import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CartSummary = ({ cart, total }) => {
  const navigate = useNavigate();
  const [applyCoupon, setApplyCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const discountedTotal = Math.max(0, total - discount);

  const handleApplyCoupon = () => {
    if (couponCode === "SAVE10") {
      setDiscount(total * 0.1);
      alert("Coupon applied! 10% discount");
    } else if (couponCode === "SAVE20") {
      setDiscount(total * 0.2);
      alert("Coupon applied! 20% discount");
    }else if(couponCode === "ANO1404"){
        setDiscount(total)
        alert("Congratulations! You've unlocked a 100% discount with the ANO1404 coupon code! Your entire order is now free. Enjoy your shopping!");
    }
     else {
      alert("Invalid coupon code");
      setDiscount(0);
    }
  };

  return (
    <div className="sticky top-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Order Summary
      </h2>

      <div className="space-y-3 mb-6 border-b border-gray-200 dark:border-slate-700 pb-4">
        <div className="flex justify-between text-gray-700 dark:text-gray-300">
          <span>Subtotal ({cart.length} items):</span>
          <span className="font-semibold">₹{total.toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>Discount:</span>
            <span className="font-semibold">-₹{discount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-700 dark:text-gray-300">
          <span>Shipping:</span>
          <span className="font-semibold text-green-600 dark:text-green-400">
            Free
          </span>
        </div>
      </div>

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

      <div className="mb-6 p-4 bg-white dark:bg-slate-700 rounded-lg">
        <label className="flex items-center gap-3 font-semibold text-gray-700 dark:text-gray-300 mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={applyCoupon}
            onChange={(e) => {
              setApplyCoupon(e.target.checked);
              if (!e.target.checked) {
                setDiscount(0);
                setCouponCode("");
              }
            }}
            className="w-4 h-4 accent-blue-600 dark:accent-amber-400"
          />
          Apply Coupon Code
        </label>

        {applyCoupon && (
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
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

      <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:cursor-pointer text-white font-bold rounded-lg transition-all transform hover:scale-105">
        Proceed to Checkout
      </button>
      
      <button
        onClick={() => navigate("/")}
        className="w-full mt-3 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold py-2 rounded-lg hover:bg-gray-100 hover:cursor-pointer dark:hover:bg-slate-700 transition-colors"
        >
             Continue Shopping
        </button>
    </div>
  );
};

export default CartSummary;
