import { useEffect, useState, useContext } from "react";
import ProductCard from "../components/ProductCard";
import { CartContext } from "../context/CartContext";
import { fetchProducts } from "../services/products";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProductList = () => {
    
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const { addCart } = useContext(CartContext);
  const { isAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      load();
    }, 500);
  }, []);

// sourcery skip: avoid-function-declarations-in-blocks
  async function load() {

    try {

      const items = await fetchProducts();
      setProducts(items);
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function addToCart(productName, product) {
    if (!isAuth) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }

    addCart(product, 1);
    alert(`${productName} added to cart`);
  }

  if (loading) {
    return (
      <div className="text-center p-10">
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <h1 className="text-xl dark:text-white">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 dark:text-gray-300 
                        bg-gradient-to-br from-blue-50 to-blue-100 py-8 mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Featured Products</h1>
          <p className="dark:text-blue-300 text-gray-500">
            Discover our amazing collection of products
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h1 className="text-3xl font-extrabold text-gray-600 dark:text-gray-300">
                No products available
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Please check back later
              </p>
            </div>
          ) : (
            products.map((item) => (
              <ProductCard
                key={item._id || item.id}
                product={item}
                click={() => addToCart(item.name, item)}
                onView={() => navigate(`/products/${item._id || item.id}`)}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default ProductList;