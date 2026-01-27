import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

const ProductCard = ({ product, click }) => {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg group">
      {/* Product Image */}
      <img
        className="object-cover h-80 w-full transform group-hover:scale-105 transition-transform duration-500"
        src={product.url}
        alt={product.name}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90"></div>

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
            <FontAwesomeIcon
              icon={faHeart}
              className="text-red-500 cursor-pointer hover:text-red-600 transition-colors"
            />
            {product.likes}
          </p>

          {product.stock > 0 ? (
            <button
              className="bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-black font-semibold px-4 py-2 rounded-xl text-sm md:text-base transition-colors"
              onClick={click}
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
