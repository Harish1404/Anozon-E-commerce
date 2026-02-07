import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AddToCartButton = ({ product }) => {
  const { addCart } = useContext(CartContext);
  const { isAuth } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    // 🔐 Auth check stays inside button
    if (!isAuth) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }

    addCart(product, 1);
    alert(`${product.name} added to cart`);
  };

  return (
    <button
      disabled={product.stock === 0}
      onClick={product.stock > 0 ? handleAddToCart : undefined}
      className={`
        w-full py-3 rounded-xl font-bold text-lg transition-all
        ${
          product.stock > 0
            ? "bg-amber-600 text-white hover:bg-amber-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            : "bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
        }
      `}
    >
      {product.stock > 0 ? "Add to Cart" : "Sold Out"}
    </button>
  );
};

export default AddToCartButton;
