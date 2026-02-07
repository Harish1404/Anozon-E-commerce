import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import NavComp from "./NavComp";

// Icons (moved here because they are search-specific)
const SearchIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SearchBar = ({ products }) => {
    
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  // 🔥 Only this component re-renders while typing
  const filteredProducts = useMemo(() => {
    if (!query) return [];
    return products.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, products]);

  const handleSearch = (e) => {
    const {value} = e.target;
    setQuery(value);
    setShowResults(value.length > 0);
  };

  const clearSearch = () => {
    setQuery("");
    setShowResults(false);
  };

  return (
    <div className="hidden md:block flex-1 max-w-lg mx-8 relative group">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon />
        </div>

        <input
          type="text"
          value={query}
          onChange={handleSearch}
          onFocus={() => query && setShowResults(true)}
          placeholder="Search for essentials..."
          className="block w-full pl-10 pr-10 py-2.5 rounded-full 
                     bg-stone-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100
                     placeholder-gray-500 focus:outline-none focus:ring-2 
                     focus:ring-blue-500/50 transition-all shadow-sm"
        />

        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {showResults && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowResults(false)} />

          <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 
                          rounded-xl shadow-2xl border z-20 max-h-[400px] overflow-y-auto">
            {filteredProducts.length ? (
              filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    clearSearch();
                    navigate(`/product/${p.id}`);
                  }}
                >
                  {/* Your existing component */}
                  <NavComp product={p} />
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No products found for "{query}"
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchBar;
