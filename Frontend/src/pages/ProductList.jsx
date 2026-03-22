import { useEffect, useState, useContext } from "react";
import ProductCard from "../components/ProductCard";
import { CartContext } from "../context/CartContext";
import { fetchProducts } from "../services/products";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import withLoading from "../hoc/withLoading";

const ProductList = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const { addCart } = useContext(CartContext);
  const { isAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      load();
      
    }, 1000);
  }, []);

  async function load() {
    try {
      const items = await fetchProducts();
      document.title = "Anozon - Products";
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

  const ProductListContent = () => (
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
                onView={() => navigate(`/product/${item._id || item.id}`)}
              />
            ))
          )}
        </div>
      </div>
    </>
  );

  const ProductListWithLoading = withLoading(ProductListContent);
  return <ProductListWithLoading isLoading={loading} />;
};

export default ProductList;