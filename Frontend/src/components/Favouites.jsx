import { useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartFilled } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartEmpty } from "@fortawesome/free-regular-svg-icons";
import { FavoritesContext } from "../context/FavoritesContext";
import withAuth from "../hoc/withAuth";

const Favourites = ({
  productId,
  className = "",
  iconSize = "text-2xl",
  stopPropagation = true,
}) => {
  const { isFavorited, toggleFav } = useContext(FavoritesContext);

  const [isFav, setIsFav] = useState(isFavorited(productId));
  const [isToggling, setIsToggling] = useState(false);

  const handleClick = async (e) => {
    if (stopPropagation) e.stopPropagation();

    try {
      setIsToggling(true);
      await toggleFav(productId);
      setIsFav((prev) => !prev);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorite");
    } finally {
      setIsToggling(false);
    }
  };

  return (
        <button
        type="button"
        onClick={handleClick}
        disabled={isToggling}
        className="
            relative p-3 rounded-full
            bg-white/80 dark:bg-slate-800/80
            backdrop-blur-md
            border border-gray-200 dark:border-gray-700
            shadow-md
            transition-all duration-300 ease-out
            hover:scale-110 hover:shadow-lg
            active:scale-95
            focus:outline-none focus:ring-2 focus:ring-rose-400/40
            disabled:opacity-50
        "
        >
        <FontAwesomeIcon
            icon={isFav ? faHeartFilled : faHeartEmpty}
            className={`
            ${iconSize}
            transition-all duration-300
            ${
                isFav
                ? "text-rose-500 scale-110"
                : "text-gray-500 dark:text-red-600 hover:text-rose-400"
            }
            `}
        />
        </button>
  );
};

export default withAuth(Favourites);