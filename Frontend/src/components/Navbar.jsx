import { useEffect, useState, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { navlinks } from '../services/Navbar';
import NavComp from './NavComp';
import { Girls } from '../services/Girls';
import DarkModeToggle from './DarkMode';
import { useAuth } from '../context/AuthContext';

// Icons
const SearchIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);

const Navbar = () => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const products = Girls; 
  const navigate = useNavigate();
  const { logout, user, isAuth } = useAuth();

  const filteredProducts = useMemo(() => {
    if (!query) return [];
    return products.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, products]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(value.length > 0);
  };

  const clearSearch = () => {
    setQuery('');
    setShowResults(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 1).toUpperCase();
    }
    return 'U';
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LEFT: LOGO */}
          <div 
            className="flex-shrink-0 cursor-pointer flex items-center gap-2"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
              A
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
              Anozon
            </span>
          </div>

          {/* MIDDLE: SEARCH BAR */}
          <div className="hidden md:block flex-1 max-w-lg mx-8 relative group">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-10 py-2.5 border-none rounded-full 
                         bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100 
                         placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 
                         transition-all shadow-sm group-hover:bg-white dark:group-hover:bg-slate-700
                         group-hover:shadow-md"
                placeholder="Search for essentials..."
                value={query}
                onChange={handleSearch}
                onFocus={() => { if(query) setShowResults(true) }}
              />
              {query && (
                <button 
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-red-500 transition-colors"
                >
                  <CloseIcon />
                </button>
              )}
            </div>

            {/* RESULTS DROPDOWN */}
            {showResults && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowResults(false)} />
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden z-20 max-h-[400px] overflow-y-auto">
                  {filteredProducts.length > 0 ? (
                    <div className="p-2 grid grid-cols-1 gap-1">
                      {filteredProducts.map((p) => (
                        <div key={p.id} onClick={() => { clearSearch(); navigate(`/product/${p.id}`) }}>
                           <NavComp product={p} /> 
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No products found for "{query}"
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* RIGHT: LINKS + DARK MODE */}
          <div className="hidden md:flex items-center gap-6">
            
            {/* Navigation Links */}
            <div className="flex items-center gap-6">
              {navlinks.map((nav) => (
                <NavLink 
                  key={nav.id} 
                  to={nav.path}
                  className={({ isActive }) => `
                    relative font-medium text-base transition-colors duration-200
                    ${isActive || activeId === nav.id 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}
                  `}
                  onClick={() => setActiveId(nav.id)}
                >
                  {nav.title}
                  <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 transform transition-transform duration-300 origin-left
                    ${activeId === nav.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}
                  `}/>
                </NavLink>
              ))}
            </div>

            {/* Divider Line */}
            <div className="h-6 w-px bg-gray-300 dark:bg-slate-600"></div>

            {/* Dark Mode Toggle */}
            <div className="transform hover:scale-105 transition-transform">
              <DarkModeToggle />
            </div>

            {/* User Profile & Logout */}
            {isAuth ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {getUserInitials()}
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-700 dark:text-gray-300 transition-transform ${
                      showUserMenu ? 'rotate-180' : ''
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-100 dark:border-slate-700 z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Logged in as</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {user?.email || 'User'}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-semibold flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all"
                >
                  Sign Up
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;