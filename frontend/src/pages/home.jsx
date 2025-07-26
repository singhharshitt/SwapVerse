import { useState, useEffect } from 'react'; 
export default function home(){
    return(
        <>
        {/* Navbar */}
        <nav className="flex items-center justify-between sticky z-20 bg-[#07090F] p-8">
            <div className="flex justify-start ml-5">
                <h2 className="text-3xl md:text-4xl text-[#D6C3C9]" style={{ fontFamily: '"Pacifico", cursive' }}> SwapVerse</h2>
            </div>
            <div className="flex justify-between">
                {/* <Link to="">
                </Link> */}

            </div>
            <div className="flex justify-end">
                <button className='border-2 border-white bg-[#D6C3C9] p-2 rounded-xl'><span className='text-sm md:text-md text-white font-semibold'style={{fontFamily: '"Roboto", sans-serif'}}>Connect Wallet</span></button>

            </div>
        </nav>

        {/* TOKEN SWAP FORM */}

        
        </>
    )
}