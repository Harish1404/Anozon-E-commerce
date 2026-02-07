import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById } from "../services/products";
import AddToCartButton from "../components/AddToCartButton";
import Favourites from "../components/Favouites";


const ProductDetails = () => {
  const { id } = useParams(); // /products/:id
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // fetchProductById already returns a normalized product object
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Product not found or server error.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);


  if (loading)
    return (
      <div className="text-center mt-20 text-xl text-gray-800 dark:text-gray-100">
        Loading details...
      </div>
    );
  if (error)
    return (
      <div className="text-center mt-20 text-red-500 text-xl">{error}</div>
    );
  if (!product) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column: Image */}
        <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <img
            src={product.image_url || product.url}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col justify-center space-y-6">
          {/* Category Tag */}
          <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold w-fit">
            {product.category || "General"}
          </span>

          {/* Title & Price */}
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            {product.name}
          </h1>
          <p className="text-3xl font-medium text-gray-700 dark:text-gray-200">
            ₹{product.price}
          </p>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
            {product.description}
          </p>

          <hr className="border-gray-400 dark:border-gray-700" />

          {/* Stock Status */}
          <div>
            {product.stock > 0 ? (
              <div className="flex items-center text-green-600 dark:text-green-400 font-medium">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                In Stock ({product.stock} available)
              </div>
            ) : (
              <div className="flex items-center text-red-600 dark:text-red-400 font-medium">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Out of Stock
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 pt-4">

            {/* ADD TO CART */}

            <div className="flex-1">
                <AddToCartButton product={product} />
            </div>

            {/* FAVOURITE */}

            <Favourites
                productId={product._id || product.id}
                iconSize="text-2xl"
            />
            </div>

            <button
                className="
                    py-4 px-8 rounded-xl text-lg font-semibold
                    border-2 border-blue-500
                    text-blue-600 dark:text-blue-400
                    bg-transparent
                    transition-all duration-300 ease-out
                    hover:bg-blue-50 dark:hover:bg-blue-500/10
                    hover:text-blue-700 dark:hover:text-blue-300
                    hover:shadow-md hover:scale-[1.02]
                    focus:outline-none focus:ring-2 focus:ring-blue-400/50
                "
                onClick={()=> navigate("/")}
                >
                Continue Shopping
                </button>

        </div>
      </div>
    </div>
  );
};

export default ProductDetails;