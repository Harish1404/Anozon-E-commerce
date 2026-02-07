import { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { navlinks } from '../services/Navbar';
import SearchBar from './SearchBar';
import { Girls } from '../services/Girls';
import DarkModeToggle from './DarkMode';
import { useAuth } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';


const CartIcon = ({ count }) => (
  
  <div className="relative cursor-pointer">
    <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 8m10 0l2 8m-12 0h12" />
    </svg>
    {count > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
        {count > 99 ? '99+' : count}
      </span>
    )}
  </div>
);

const Navbar = () => {

  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const products = Girls; 
  const navigate = useNavigate();
  const { logout, user, isAuth, isAdmin } = useAuth();
  const { getCartCount } = useContext(CartContext);
  const cartCount = getCartCount();


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
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 transition-all duration-300">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LEFT: LOGO */}
          <div 
            className="flex-shrink-0 cursor-pointer flex items-center gap-2"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-800 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
              A
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
              Anozon
            </span>
          </div>

          <SearchBar products={products} />

          {/* RIGHT: LINKS + DARK MODE */}
          <div className="hidden md:flex items-center gap-6">
            
            {/* Navigation Links */}
            <div className="flex items-center gap-6">
              {navlinks.map((nav) => (
                <NavLink
                  key={nav.id}
                  to={nav.path}
                  className={({ isActive }) =>
                    `
                    relative font-medium text-base transition-colors duration-200
                    ${isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}
                  `
                  }
                >
                  {({ isActive }) => (
                    <span className="relative inline-block">
                      {nav.title}
                      <span
                        className={`
                          absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600
                          transform transition-transform duration-300 origin-left
                          ${isActive ? 'scale-x-100' : 'scale-x-0'}
                        `}
                      />
                    </span>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Divider Line */}
            <div className="h-6 w-px bg-gray-300 dark:bg-slate-600"></div>

            {/* Dark Mode Toggle */}
            <div className="transform hover:scale-105 transition-transform">
              <DarkModeToggle />
            </div>

            {/* Cart Icon */}
            {isAuth && (
              <button
                onClick={() => navigate('/cart')}
                className="transform hover:scale-110 transition-transform relative"
                title="View Cart"
              >
                <CartIcon count={cartCount} />
                
              </button>
            )}

            {/* User Profile & Logout */}
            {isAuth ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-700 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
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
                      {isAdmin() && (
                        <button
                          onClick={() => {
                            navigate('/admin');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors font-semibold flex items-center gap-2 border-b border-gray-100 dark:border-slate-700"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                          </svg>
                          Admin Dashboard
                        </button>
                      )}
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