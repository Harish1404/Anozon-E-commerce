import { useEffect, useState } from 'react';
import { navlinks } from '../services/Navbar';
import NavComp from './NavComp';
import { Girls } from '../services/Girls';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const [query, setQuery] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [products, setProducts] = useState([])
  const [activeId, setActiveId] = useState(2);

  useEffect(()=>{

    fetchProducts()

  }, [])

  function fetchProducts(){
    try{
      setProducts(Girls)
    }catch(error){
      console.error(error)
    }
  }

  const filteredProducts = products.filter((p)=>(
    p.name
    .toLowerCase()
    .includes(query.toLowerCase())
  ));

  const handleSearch = (e) => {

    const value = e.target.value;
    setQuery(value);

    if (value.trim() && filteredProducts.length>0){
      setShowDrawer(true)
    }else{
      setShowDrawer(false)
    }

  };

  function screenClick(){
    setShowDrawer(false)
    setQuery('')
  }

  return (
    <div className="relative">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-5 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300
                       rounded-2xl w-3/4 mx-auto shadow-md relative z-41 
                       dark:bg-gradient-to-r dark:from-gray-800 dark:via-gray-700 dark:to-gray-900
                       ">
        <div className="text-2xl font-bold text-black dark:text-white">Anozon</div>

        {/* Search input */}
        <input
          id="Search"
          className="border-none p-2 w-[400px] rounded-full shadow-inner placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:bg-gray-300" 
          placeholder="Search for products..."
          value={query}
          onChange={handleSearch}
          
        />
        
        {/* Navigation links */}
       <div className="flex gap-6">
  {navlinks.map((nav) => (
    <NavLink key={nav.id} to={nav.path} >
      <ul key={nav.id} >

      <li  onClick={() => setActiveId(nav.id)}

            className={`
              relative text-black p-2 font-semibold dark:text-white
              hover:cursor-pointer hover:text-gray-700 transition-colors dark:hover:text-gray-300
              before:content-[''] before:absolute before:bottom-0 before:left-1/2 
              before:h-[3px] before:bg-gradient-to-r before:from-orange-600 before:via-orange-500 before:to-red-400
              before:transition-transform before:duration-300 before:ease-in-out
              before:transform before:-translate-x-1/2
              ${activeId === nav.id 
                ? "before:scale-x-100 text-gray-800" 
                : "before:scale-x-0 hover:before:scale-x-100"}
              before:origin-center
              before:w-full
            `}>
        {nav.title}
      </li>
    </ul>
    </NavLink>
  ))}
</div>

      </nav>

      {/* Search Drawer */}
      <div>

      {showDrawer && (
      <div> 
          <div 
            className="fixed inset-0 bg-black opacity-60 z-40"
            onClick={screenClick}>
          </div>

        <div className="absolute top-full w-3/4 left-1/2 transform -translate-x-1/2 bg-white border rounded-xl shadow-lg p-4 z-50 max-h-96 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <p className="text-gray-500 text-center">No products found</p>
          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

              {filteredProducts.map((p) => (
                <NavComp key={p.id} product={p} />
              ))}

            </div>

          )}

        </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Navbar;


   
