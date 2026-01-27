import{ useEffect, useState , useContext}  from 'react'
import ProductCard from '../components/ProductCard'
import { Girls } from '../services/Girls'
import { CartContext } from '../context/CartContext'


const ProductList = () => {

    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])

    const {addCart} = useContext(CartContext)
   

    useEffect(()=>{

        setTimeout(()=>{
            fetchProducts();
        },500)

    }, [] )

    async function fetchProducts() {
        try{
            setProducts(Girls)

        } catch (error){
            console.error(error)
        }
        finally {
            setLoading(false)
        }
    }

    function addToCart(producName, p){
        alert(`${producName} added to cart`)
        addCart(p)
    }


    if (loading){

        return( 
        <div className='text-center p-10'>
            <div className='flex items-center justify-center gap-2'>
                <div className="w-5 h-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <h1 className='text-2xl'>Loading...</h1>
            </div>
        </div>
        )}

  return (
    <>
    <div className='grid grid-cols-1 w-3/4 mx-auto gap-4 mt-4 md:grid-cols-3 sm:grid-cols-2'>

        {products.length === 0 ? (
            <h1 className="text-2xl font-extrabold even:text-pink-500">All Busy</h1>
        ) : (

        products.map((item)=>(
            <ProductCard key={item.id} product = {item} click={()=>addToCart(item.name, item)} />
        ))

       )}
    </div>
    </>
    )
}

export default ProductList