import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { searchProducts } from "../services/products";
import NavComp from "./NavComp";

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

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef(null);
  const resultsRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      setActiveIndex(-1);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
=======
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    // Debounce: wait 400ms after user stops typing
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {

>>>>>>> 45471ce (Added Search Engine feature)
      try {
        setLoading(true);
        const data = await searchProducts(query.trim(), 1, 8);
        setResults(data);
        setShowResults(true);
<<<<<<< HEAD
        setActiveIndex(-1);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
=======

      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
        
>>>>>>> 45471ce (Added Search Engine feature)
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showResults || !resultsRef.current.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < resultsRef.current.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : resultsRef.current.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && resultsRef.current[activeIndex]) {
        clearSearch();
        navigate(`/product/${resultsRef.current[activeIndex]._id}`);
      }
    } else if (e.key === "Escape") {
      setShowResults(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="hidden md:block flex-1 max-w-lg mx-8 relative group">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <SearchIcon />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
<<<<<<< HEAD
          onKeyDown={handleKeyDown}
=======
>>>>>>> 45471ce (Added Search Engine feature)
          placeholder="Search for essentials..."
          className="block w-full pl-10 pr-10 py-2.5 rounded-full 
                     bg-stone-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100
                     placeholder-gray-500 focus:outline-none focus:ring-2 
                     focus:ring-blue-500/50 transition-all shadow-sm"
        />

        {query && (
          <button onClick={clearSearch} className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <CloseIcon />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 
                        rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 
                        z-20 max-h-[400px] overflow-y-auto">
          {results.length ? (
<<<<<<< HEAD
            results.map((p, index) => (
              <div
                key={p._id}
                onMouseDown={() => { clearSearch(); navigate(`/product/${p._id}`); }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`cursor-pointer transition-colors ${
                  activeIndex === index
                    ? "bg-blue-50 dark:bg-slate-600"
                    : "hover:bg-gray-50 dark:hover:bg-slate-700"
                }`}
=======
            results.map((p) => (
              <div
                key={p._id}
                onMouseDown={() => {
                  clearSearch();
                  navigate(`/product/${p._id}`);
                }}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
>>>>>>> 45471ce (Added Search Engine feature)
              >
                <NavComp product={p} />
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No products found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
