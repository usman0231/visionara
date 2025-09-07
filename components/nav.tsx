import React from 'react'
import Image from 'next/image';
import Link from 'next/link';
function nav() {
  return (
    <div className='navbar liquid-glass w-[90vw] md:w-2xl flex'>
        <Link href={'/'} className='nav_logo_link'>
          <Image src="/images/just_logo.png" alt="Logo" width={60} height={100} className='nav_logo cursor-pointer'/>
        </Link>
        <div className='nav_links flex justify-evenly w-full pt-3'>
            <Link href='/' className='nav_link text-sm sm:text-base'>Home</Link>
            <Link href='/about' className='nav_link text-sm sm:text-base'>About</Link>
            <Link href='#features' className='nav_link text-sm sm:text-base'>Features</Link>
            <Link href='/contact' className='nav_link text-sm sm:text-base'>Contact</Link>
        </div>
    </div>
  )
}

export default nav