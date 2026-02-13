import { useNavigate } from "react-router-dom";

const CartItems = ({ cart, onRemoveItem }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-200 dark:bg-gradient-to-br from-slate-800 to-slate-900">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Items ({cart.length})
        </h2>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-slate-700">
        {cart.map((item) => {
          const itemPrice = item.product?.price || item.price || 0;
          const quantity = item.quantity || 1;
          const itemTotal = itemPrice * quantity;

          return (
            <div
              key={item.product_id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex gap-4">
                <div 
                  className="flex-shrink-0 cursor-pointer"
                  
                >
                  <img
                    src={item.product?.image_url || item.image_url}
                    alt={item.product?.name || item.name}
                    className="w-24 h-24 object-cover rounded-lg hover:opacity-80 transition-opacity"
                    onClick={() => navigate(`/products/${item.product_id}`)}
                  />
                </div>

                <div className="flex-grow">
                  <h3 
                    className="text-lg font-bold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-amber-400 transition-colors"
                    onClick={() => navigate(`/products/${item.product_id}`)}
                  >
                    {item.product?.name || item.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {item.product?.description || item.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Price: ₹{itemPrice.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Quantity: {quantity}
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-amber-400 mt-1">
                        ₹{itemTotal.toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product_id)}
                      className="ml-4 px-4 py-2 bg-red-500 hover:bg-red-700 hover:cursor-pointer text-white font-semibold rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CartItems;
