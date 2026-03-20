import { useRef, useEffect } from 'react';
import ProductCard from './ProductCard';
import { useNavigate } from 'react-router-dom';

const ProductCarousel = ({ category, products, onAddToCart }) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || products.length === 0) return;

    let scrollInterval;
    let isPaused = false;

    const startScroll = () => {
      scrollInterval = setInterval(() => {
        if (!isPaused && scrollContainer) {
          scrollContainer.scrollLeft += 1;
          
          // Reset to start for infinite loop
          if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
            scrollContainer.scrollLeft = 0;
          }
        }
      }, 20);
    };

    startScroll();

    const handleMouseEnter = () => (isPaused = true);
    const handleMouseLeave = () => (isPaused = false);

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearInterval(scrollInterval);
      if (scrollContainer) {
        scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
        scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [products]);

  if (products.length === 0) return null;

  // Duplicate products for seamless infinite scroll
  const duplicatedProducts = [...products, ...products];

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
          {category}
        </h2>
        <button
          onClick={() => navigate(`/category/${category}`)}
          className="text-blue-600 dark:text-amber-400 hover:underline font-semibold"
        >
          View All →
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-hidden px-4 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {duplicatedProducts.map((product, index) => (
          <div key={`${product._id}-${index}`} className="flex-shrink-0 w-80">
            <ProductCard
              product={product}
              click={() => onAddToCart(product.name, product)}
              onView={() => navigate(`/product/${product._id || product.id}`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;
