import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord, faInstagram, faWhatsapp, faYoutube } from '@fortawesome/free-brands-svg-icons'

const Footer = () => {
  return (
    <div className=' p-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 mt-5 dark:bg-gradient-to-r dark:from-gray-800 dark:via-gray-900 dark:to-gray-950'>
        <ul className='flex justify-center gap-4 ' >
            <FontAwesomeIcon icon={faInstagram} className='text-pink-600 text-xl cursor-pointer ' />
            <FontAwesomeIcon icon={faYoutube} className='text-red-600 text-xl cursor-pointer' />
            <FontAwesomeIcon icon={faDiscord} className='text-indigo-500 text-xl cursor-pointer' />
            <FontAwesomeIcon icon={faWhatsapp} className='text-green-600 text-xl cursor-pointer' />
        </ul>
    </div>
  )
}

export default Footer