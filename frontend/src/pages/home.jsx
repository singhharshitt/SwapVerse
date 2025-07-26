import { useState, useEffect } from 'react'; 
import history from '../assets/history.png';
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <>
            {/* Navbar */}
            <nav className="flex items-center justify-between sticky top-0 z-50 bg-[#5B2333] p-4 md:p-8 border-b border-gray-800">
                <div className="flex items-center">
                    <h2 className="text-2xl md:text-4xl text-[#F7F4F3]" style={{ fontFamily: '"Pacifico", cursive' }}>
                        SwapVerse
                    </h2>
                </div>
                <div className="flex items-center space-x-4">
                    <Link to="/historyy" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                        <img src={history} alt="history" className="w-6 h-6 md:w-8 md:h-8" />
                    </Link>
                    <button className="border-2 border-white bg-[#F24333] px-4 py-2 rounded-xl hover:bg-[#BA1B1D] transition-colors">
                        <span className="text-sm md:text-md text-white font-semibold" style={{ fontFamily: '"Roboto", sans-serif' }}>
                            Connect Wallet
                        </span>
                    </button>
                </div>
            </nav>

            {/* TOKEN SWAP FORM */}
            <div className="min-h-screen bg-[#F7F4F3] p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl md:text-5xl text-[#5B2333] text-center mt-8 mb-6 font-extrabold" style={{ fontFamily: '"Bitter", serif' }}>
                        Welcome To <span className='text-[#F24333]' style={{ fontFamily: '"Pacifico", cursive' }}>SwapVerse</span>
                    </h1>
                    <p className="text-[#564D4A] text-center mb-18 text-lg">
                        <i>Your trusted platform for seamless token swapping</i>
                    </p>
                    
                    
                    <div className="bg-[#564D4A] rounded-xl p-8 border border-gray-700 flex justify-between">
                        <form className=''>
                            <div className='m-10 w-180 h-38 border bg-[#F7F4F3] rounded-lg'>
                            <label className='top-0 left-5 text-sm md:text-md text-[#5B2333] mb-5 w-full' style={{ fontFamily: '"Lobster Two", cursive' }}>You're Selling</label>
                            <input className='w-60 h-22' type='' >

                                
                            </input>
                            <input className=''>
                                </input>

                            </div>
                            <div className='relative m-10 w-180 h-38 border bg-[#F7F4F3] rounded-lg'>
                                <label className='absolute top-0 left-5 text-[#5B2333] text-sm md:text-md' style={{ fontFamily: '"Lobster Two", cursive' }}>To Buy</label>
                            </div>
                            <div className='m-10 flex justify-between items-center'>
                                <button className='bg-[#F24333] hover:bg-[#BA1B1D] p-8 border rounded-xl'><span>Swap</span></button>
                            </div>

                        </form>
                        
                    </div>
                </div>
            </div>
            <footer>

            </footer>
        </>
    );
}
