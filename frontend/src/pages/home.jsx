import { useState, useEffect } from "react";
import history from "../assets/history.png";
import { Link } from "react-router-dom";
import swapp from "../assets/swapp.png";

export default function Home() {
  const tokens = ["TKA7", "TKB7"];
  const [tokenA, setTokenA] = useState("");
  const [tokenB, setTokenB] = useState("");
  const handleTokenA = (e) => {
    const sel = e.target.value;
    setTokenA(sel);
    if (sel == tokenB) {
      setTokenB("");
    }
  };

  const handleTokenB = (e) => {
    const sel = e.target.value;
    setTokenB(sel);
    if (sel == tokenA) {
      setTokenA("");
    }
  };
  return (
    <>
      {/* Navbar */}
      <nav className="flex items-center justify-between sticky top-0 z-50 bg-[#5B2333] p-4 md:p-8 border-b border-gray-800">
        <div className="flex items-center">
          <h2
            className="text-2xl md:text-4xl text-[#F7F4F3]"
            style={{ fontFamily: '"Pacifico", cursive' }}
          >
            SwapVerse
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/historyy"
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <img
              src={history}
              alt="history"
              className="w-6 h-6 md:w-8 md:h-8"
            />
          </Link>
          <button className="border-2 border-white bg-[#F24333] px-4 py-2 rounded-xl hover:bg-[#BA1B1D] transition-colors">
            <span
              className="text-sm md:text-md text-white font-semibold"
              style={{ fontFamily: '"Roboto", sans-serif' }}
            >
              Connect Wallet
            </span>
          </button>
        </div>
      </nav>

      {/* TOKEN SWAP FORM */}
      <div className="min-h-screen bg-[#F7F4F3] p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1
            className="text-3xl md:text-5xl text-[#5B2333] text-center mt-8 mb-6 font-extrabold"
            style={{ fontFamily: '"Bitter", serif' }}
          >
            Welcome To{" "}
            <span
              className="text-[#F24333]"
              style={{ fontFamily: '"Pacifico", cursive' }}
            >
              SwapVerse
            </span>
          </h1>
          <p className="text-[#564D4A] text-center mb-18 text-sm">
            <i>Your trusted platform for seamless token swapping</i>
          </p>

          <div className="bg-[#332F2F] rounded-xl p-8 border border-gray-700 max-w-xl mx-auto">
            <form style={{ fontFamily: '"Montserrat", sans-serif' }}>
              {/* Selling Section */}
              <div className=" bg-[#F7F4F3] rounded-lg p-4 mt-4">
                <label
                  className="block text-[#5B2333] text-xs mb-2 font-semibold text-[10px]"
                  style={{ fontFamily: '"Montserrat", sans-serif' }}
                >
                  You're Selling
                </label>
                <div className="flex justify-between items-center">
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-1/2 p-2  text-sm focus:outline-none bg-[#F7F4F3] no-spinner"
                  />
                  <select
                    className="w-1/3 p-2 rounded-md border border-gray-300 text-sm bg-white"
                    onChange={(e) => handleTokenA(e)}
                    value={tokenA}
                  >
                    <option value="">-- Select Token --</option>
                    {tokens.map((token) =>
                      token !== tokenB ? (
                        <option key={token} value={token}>
                          {token}
                        </option>
                      ) : null
                    )}
                  </select>
                </div>
              </div>

              {/* Swap icon */}
              <div className="flex justify-center items-center">
                <div
                  className="rounded-full bg-[#0D0D0D] p-2 w-fit cursor-pointer hover:"
                  id=""
                >
                  <img
                    src={swapp}
                    alt="swap icon"
                    className="w-[28px] h-[28px]"
                  />
                </div>
              </div>

              {/* Buying Section */}
              <div className="mb-6 bg-[#F7F4F3] rounded-lg p-4 ">
                <label
                  className="block text-[#5B2333] text-[10px] mb-2 font-semibold"
                  style={{ fontFamily: '"Montserrat", sans-serif' }}
                >
                  To Buy
                </label>
                <div className="flex justify-between items-center">
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-1/2 p-2  text-sm focus:outline-none no-spinner"
                  />
                  <select
                    className="w-1/3 p-2 rounded-md border border-gray-300 text-sm bg-white"
                    onChange={(e) => handleTokenB(e)}
                    value={tokenB}
                  >
                    <option value="">-- Select Token --</option>
                    {tokens.map((token) =>
                      token !== tokenA ? (
                        <option key={token} value={token}>
                          {token}
                        </option>
                      ) : null
                    )}
                  </select>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="bg-[#F24333] hover:bg-[#BA1B1D] text-white px-6 py-2 rounded-xl font-semibold"
                >
                  Swap
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <footer className="bg-[#5B2333] w-full" style={{ fontFamily: '"Libertinus Mono", monospace' }}>
        <div className="flex">
          <div className="flex items-center justify-center w-full">
            <h2 className="text-lg font-bold text-[#F7F4F3] m-4" >Designed By Harshit Singh</h2>
          </div>
          <div></div>
        </div>
        <hr className="m-4"/>
        <div className="flex justify-center items-center w-full">
        <p className="text-[12px] text-[#F7F4F3] ">
          © 2025 SwapVerse. All rights reserved. Empowering seamless token swaps
          with security and speed.
        </p>
        </div>
      </footer>
    </>
  );
}
