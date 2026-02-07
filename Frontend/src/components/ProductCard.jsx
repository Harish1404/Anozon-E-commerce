import { useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartFilled } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartEmpty } from "@fortawesome/free-regular-svg-icons";
import { FavoritesContext } from "../context/FavoritesContext";
import { useAuth } from "../context/AuthContext";

const ProductCard = ({ product, click, onView }) => {

  const { isFavorited, toggleFav } = useContext(FavoritesContext);
  const { isAuth } = useAuth();
  const [isFav, setIsFav] = useState(isFavorited(product._id || product.id));
  const [isToggling, setIsToggling] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();

    if (!isAuth) {
      alert("Please login to add to favorites");
      return;
    }
    try {
      setIsToggling(true);
      await toggleFav(product._id || product.id);
      setIsFav(!isFav);

    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorite");
      
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg group"
      onClick={onView}>
      {/* Product Image */}
      <img
        className="object-cover h-80 w-full transform group-hover:scale-105 transition-transform duration-500"
        src={product.url}
        alt={product.name}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90"></div>

      {/* Favorite Heart Button - Top Right */}
      <button
        onClick={handleFavoriteClick}
        disabled={isToggling}
        className="absolute top-4 right-4 z-10 p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition-all transform hover:scale-110 disabled:opacity-50"
        title={isFav ? "Remove from favorites" : "Add to favorites"}
      >
        <FontAwesomeIcon
          icon={isFav ? faHeartFilled : faHeartEmpty}
          className={`text-xl transition-colors ${
            isFav ? "text-red-500" : "text-white hover:text-red-400"
          }`}
        />
      </button>

      {/* Content */}
      <div className="absolute bottom-0 w-full p-4 flex flex-col text-white ">
        <h1 className="font-bold text-lg md:text-xl">{product.name}</h1>
        <p className="text-sm text-gray-200 mt-1 line-clamp-2">
          {product.description}
        </p>
        <p className="font-bold text-lg mt-2">₹{product.price}</p>

        {/* Footer */}
        <div className="flex justify-between items-center mt-3">
          <p className="flex items-center gap-1 font-semibold">
            <span className="text-red-500">♥</span>
            {product.likes || 0}
          </p>

          {product.stock > 0 ? (
            <button
              className="bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-black font-semibold px-4 py-2 rounded-xl text-sm md:text-base transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                click && click();
              }}
            >
              Add to cart
            </button>
          ) : (
            <button
              className="bg-gray-500 text-white rounded-xl px-4 py-2 text-sm md:text-base cursor-not-allowed"
              disabled
            >
              Out of stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
