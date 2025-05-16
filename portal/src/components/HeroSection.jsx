import React, { useState } from 'react'
import { Button } from './ui/button'
import { Search } from 'lucide-react'


const HeroSection = () => {

    return (
        <div className='text-center'>
            <div className='flex flex-col gap-5 my-10'>
                <span className=' mx-auto px-4 py-2 rounded-full bg-gray-100 text-[#F83002] font-medium'>Welcome to GuardianSync</span>
                <h1 className='text-5xl font-bold'>Your trusted school bus tracking  <br /> solution for <span className='text-[#6A38C2]'>child safety.</span></h1>
                <div className='flex w-[40%] shadow-lg border border-gray-200 pl-3 rounded-full items-center gap-4 mx-auto'>
                    
                </div>
            </div>
        </div>
    )
}

export default HeroSection