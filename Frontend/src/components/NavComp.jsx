import React from 'react'

const NavComp = ({product}) => {
  return (
    <div className=' p-2 flex gap-4 rounded-2xl items-center '>

        <img className='object-cover h-10 w-18 rounded-xl' src={product.url}></img>
        <h1 className='text-sm font-bold'>{product.name}</h1>
        <p>${product.price}</p>
    </div>
  )
}

export default NavComp