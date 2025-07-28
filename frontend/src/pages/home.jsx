import { useState, useEffect } from "react";
import history from "../assets/history.png";
import { Link } from "react-router-dom";
import swapp from "../assets/swapp.png";
import web3Service from "../services/web3Service";
import { CONTRACT_ADDRESSES } from "../config/contracts";
import TargetCursor from '../components/TargetCursor';
import Squares from '../components/Square';
import WalletModal from '../components/WalletModal';
import NetworkWarningModal from '../components/NetworkWarningModal';
import NotificationToast from '../components/NotificationToast';
import notificationService from '../services/notificationService.jsx';

export default function Home() {
  const tokens = ["TKA7", "TKB7"];
  const [tokenA, setTokenA] = useState("");
  const [tokenB, setTokenB] = useState("");
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  
  // Web3 state
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tokenABalance, setTokenABalance] = useState("0");
  const [tokenBBalance, setTokenBBalance] = useState("0");
  const [connectedWalletType, setConnectedWalletType] = useState("");

  // Wallet modal state
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [availableWallets, setAvailableWallets] = useState([]);

  // Network warning modal state
  const [showNetworkWarning, setShowNetworkWarning] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [ethereumProvider, setEthereumProvider] = useState(null);

  // Conversion rate (1 TKA7 = 0.8 TKB7)
  const conversionRate = 0.8;

  // Check if wallet is already connected on component mount
  useEffect(() => {
    checkWalletConnection();
    updateAvailableWallets();
    
    // Listen for custom network change events
    const handleNetworkChanged = (event) => {
      const { isCorrectNetwork, currentNetwork, requiresAction } = event.detail;
      
      if (!isCorrectNetwork && requiresAction) {
        setCurrentNetwork(currentNetwork);
        setShowNetworkWarning(true);
      } else if (isCorrectNetwork) {
        setShowNetworkWarning(false);
        setError(""); // Clear any network errors
      }
    };

    // Listen for account change events
    const handleAccountChanged = (event) => {
      const { isConnected, currentAccount } = event.detail;
      
      if (!isConnected) {
        // User disconnected
        setWalletAddress("");
        setTokenABalance("0");
        setTokenBBalance("0");
        setConnectedWalletType("");
        setError("");
        setSuccess("");
      } else if (currentAccount) {
        // Account changed
        setWalletAddress(currentAccount);
        loadTokenBalances(currentAccount);
      }
    };

    // Add event listeners
    window.addEventListener('networkChanged', handleNetworkChanged);
    window.addEventListener('accountChanged', handleAccountChanged);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('networkChanged', handleNetworkChanged);
      window.removeEventListener('accountChanged', handleAccountChanged);
    };
  }, []);

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Update available wallets
  const updateAvailableWallets = () => {
    const wallets = web3Service.getAvailableWallets();
    setAvailableWallets(wallets);
  };

  // Check wallet connection status
  const checkWalletConnection = async () => {
    try {
      const isConnected = web3Service.isConnected();
      if (isConnected) {
        const account = await web3Service.getCurrentAccount();
        if (account) {
          setWalletAddress(account);
          setConnectedWalletType(web3Service.getConnectedWalletType());
          
          // Check network status
          const networkStatus = await web3Service.getNetworkStatus(web3Service.provider);
          if (!networkStatus.isCorrect) {
            setCurrentNetwork(networkStatus.network);
            setShowNetworkWarning(true);
            return;
          }
          
          // Check if contracts are deployed
          const contractsStatus = await web3Service.checkContractsDeployed();
          if (contractsStatus) {
            const notDeployed = Object.entries(contractsStatus).filter(([name, status]) => !status.deployed);
            if (notDeployed.length > 0) {
              console.warn('Some contracts are not deployed:', notDeployed);
              notificationService.warning(
                `Some contracts are not deployed on Sepolia testnet. Please deploy contracts first.`,
                10000
              );
            }
          }
          
          // Initialize contracts and get balances
          await web3Service.initializeContracts();
          const tokenABalance = await web3Service.getTokenBalance(CONTRACT_ADDRESSES.TOKEN_A, account);
          const tokenBBalance = await web3Service.getTokenBalance(CONTRACT_ADDRESSES.TOKEN_B, account);
          
          setTokenABalance(tokenABalance);
          setTokenBBalance(tokenBBalance);
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      notificationService.error('Error checking wallet connection: ' + error.message);
    }
  };

  // Load token balances
  const loadTokenBalances = async (address) => {
    try {
      const balanceA = await web3Service.getTokenBalance(CONTRACT_ADDRESSES.TOKEN_A, address);
      const balanceB = await web3Service.getTokenBalance(CONTRACT_ADDRESSES.TOKEN_B, address);
      setTokenABalance(balanceA);
      setTokenBBalance(balanceB);
    } catch (error) {
      console.error('Error loading token balances:', error);
    }
  };

  // Handle minting messages
  const handleMintingMessages = () => {
    // Listen for minting success messages in console
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog.apply(console, args);
      
      const message = args.join(' ');
      if (message.includes('Successfully minted 1000 TKA7 tokens!')) {
        setSuccess('🎉 Successfully minted 1000 TKA7 tokens!');
      } else if (message.includes('Successfully minted 1000 TKB7 tokens!')) {
        setSuccess('🎉 Successfully minted 1000 TKB7 tokens!');
      } else if (message.includes('Failed to mint TKA7') || message.includes('Failed to mint TKB7')) {
        setError('❌ Failed to mint tokens. Please try again.');
      }
    };
  };

  // Show wallet selection modal
  const showWalletSelection = () => {
    updateAvailableWallets();
    setShowWalletModal(true);
  };

  // Connect to specific wallet
  const connectToWallet = async (walletType) => {
    setIsConnecting(true);
    setError("");
    setSuccess("");
    setShowWalletModal(false);
    
    try {
      // Store the ethereum provider for network switching
      let provider;
      if (walletType === 'metamask') {
        provider = window.ethereum;
      } else if (walletType === 'phantom') {
        provider = window.phantom?.ethereum;
      }
      setEthereumProvider(provider);
      
      const address = await web3Service.connectToWallet(walletType);
      
      // Check if we're on the correct network after connection
      const isSepolia = await web3Service.isConnectedToSepolia();
      if (!isSepolia) {
        const networkStatus = await web3Service.getNetworkStatus();
        if (networkStatus && !networkStatus.isCorrect) {
          setCurrentNetwork(networkStatus.network);
          setShowNetworkWarning(true);
        }
      }
      
      setWalletAddress(address);
      setConnectedWalletType(walletType);
      await loadTokenBalances(address);
      
      // Set up minting message handling
      handleMintingMessages();
    } catch (error) {
      console.error('Wallet connection error:', error);
      
      // Handle specific rejection cases
      if (error.message.includes('rejected') || error.message.includes('cancelled') || error.message.includes('user rejected')) {
        setError("Connection was cancelled. Please try again when ready.");
      } else if (error.message.includes('pending') || error.message.includes('already pending')) {
        setError("Connection request is pending. Please check your wallet.");
      } else if (error.message.includes('network') || error.message.includes('Network')) {
        setError("Network error. Please check your connection and try again.");
      } else if (error.message.includes('provider not initialized') || error.message.includes('not ready')) {
        setError("Wallet provider not ready. Please try again.");
      } else if (error.message.includes('not installed')) {
        setError(error.message);
      } else if (error.message.includes('Failed to switch') || error.message.includes('Failed to add')) {
        setError(error.message);
      } else {
        setError(error.message || "Failed to connect wallet");
      }
      
      // Don't reopen modal for user rejections - let them click Connect Wallet again
      if (!error.message.includes('rejected') && !error.message.includes('cancelled') && !error.message.includes('user rejected')) {
        // Only reopen modal for technical errors, not user rejections
        setTimeout(() => {
          setShowWalletModal(true);
        }, 1000);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Connect wallet (legacy function for backward compatibility)
  const connectWallet = async () => {
    try {
      const wallets = await web3Service.connectWallet();
      
      if (wallets.length === 0) {
        setError("No supported wallets found. Please install MetaMask or Phantom.");
        return;
      }
      
      // Always show wallet selection modal, even if only one wallet is available
      showWalletSelection();
    } catch (error) {
      setError(error.message || "Failed to get available wallets");
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    web3Service.disconnect();
    setWalletAddress("");
    setTokenABalance("0");
    setTokenBBalance("0");
    setConnectedWalletType("");
    setError("");
    setSuccess("");
    setShowNetworkWarning(false);
    setCurrentNetwork(null);
    setEthereumProvider(null);
  };

  // Execute swap
  const executeSwap = async (e) => {
    e.preventDefault();
    
    if (!web3Service.isConnected()) {
      setError("Please connect your wallet first");
      return;
    }

    if (!tokenA || !tokenB || !amountA || !amountB) {
      setError("Please fill in all fields");
      return;
    }

    setIsSwapping(true);
    setError("");
    setSuccess("");

    try {
      // Validate network before swap
      const isSepolia = await web3Service.isConnectedToSepolia();
      if (!isSepolia) {
        const networkStatus = await web3Service.getNetworkStatus();
        if (networkStatus && !networkStatus.isCorrect) {
          setCurrentNetwork(networkStatus.network);
          setShowNetworkWarning(true);
          return;
        }
      }

      // Determine which token to approve
      const tokenAddress = tokenA === "TKA7" ? CONTRACT_ADDRESSES.TOKEN_A : CONTRACT_ADDRESSES.TOKEN_B;
      
      // Show pending notification
      notificationService.transactionPending();
      
      // Approve tokens first
      await web3Service.approveTokens(tokenAddress, amountA);
      
      // Execute the swap
      const txHash = await web3Service.executeSwap(tokenA, tokenB, amountA);
      
      // Show success notification
      notificationService.transactionSuccess(txHash);
      setSuccess(`Swap successful! Transaction hash: ${txHash}`);
      
      // Clear form
      setAmountA("");
      setAmountB("");
      
      // Reload balances
      const account = await web3Service.getCurrentAccount();
      if (account) {
        await loadTokenBalances(account);
      }
    } catch (error) {
      console.error('Swap error:', error);
      
      // Show error notification
      notificationService.transactionFailed(error.message);
      setError(error.message || "Swap failed");
    } finally {
      setIsSwapping(false);
    }
  };

  // Swap tokens (UI only) - Enhanced with direction button
  const swapTokenDirection = () => {
    const tempToken = tokenA;
    const tempAmount = amountA;

    setTokenA(tokenB);
    setTokenB(tempToken);

    setAmountA(amountB);
    setAmountB(tempAmount);
  };

  // Enhanced token selection with prevention of duplicates
  const handleTokenA = (e) => {
    const sel = e.target.value;
    setTokenA(sel);
    
    // Prevent selecting the same token in both dropdowns
    if (sel === tokenB) {
      setTokenB("");
    }
    
    setAmountA("");
    setAmountB("");
  };

  const handleTokenB = (e) => {
    const sel = e.target.value;
    setTokenB(sel);
    
    // Prevent selecting the same token in both dropdowns
    if (sel === tokenA) {
      setTokenA("");
    }
    
    setAmountA("");
    setAmountB("");
  };

  const handleAmountAChange = (e) => {
    const value = e.target.value;
    setAmountA(value);

    if (tokenA === "TKA7" && tokenB === "TKB7") {
      setAmountB((parseFloat(value) * conversionRate).toFixed(4));
    } else if (tokenA === "TKB7" && tokenB === "TKA7") {
      setAmountB((parseFloat(value) / conversionRate).toFixed(4));
    } else {
      setAmountB("");
    }
  };

  // Format wallet address for display
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get wallet display name
  const getWalletDisplayName = () => {
    if (!connectedWalletType) return "";
    return connectedWalletType === 'metamask' ? 'MetaMask' : 'Phantom';
  };

  // Get network status
  const getNetworkStatus = () => {
    if (!walletAddress) return null;
    return (
      <div className="text-green-400 text-xs opacity-75 cursor-target">
        Sepolia Testnet
      </div>
    );
  };

  return (
    <>
      <TargetCursor 
        spinDuration={2}
        hideDefaultCursor={true}
      />
      
      {/* Squares Background Animation */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -2 }}>
        <Squares 
          speed={0.5} 
          squareSize={40}
          direction="diagonal"
          borderColor="#F7F4F3"
          hoverFillColor="#5B2333"
        />
      </div>
      
      {/* Wallet Selection Modal */}
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onSelectWallet={connectToWallet}
        availableWallets={availableWallets}
        isConnecting={isConnecting}
      />

      {/* Network Warning Modal */}
      <NetworkWarningModal
        isOpen={showNetworkWarning}
        onClose={() => setShowNetworkWarning(false)}
        currentNetwork={currentNetwork}
        ethereumProvider={ethereumProvider}
        onNetworkSwitch={() => {
          setShowNetworkWarning(false);
          // Refresh the page or reload balances after network switch
          window.location.reload();
        }}
      />

      {/* Notification Toast */}
      <NotificationToast />
      
      {/* Navbar */}
      <nav className="flex items-center justify-between  z-50 bg-[#5B2333] p-4 md:p-8 border-b border-gray-800 shadow-[0_4px_10px_rgba(0,0,0,0.25)]">
        <div className="flex items-center">
          <h2
            className="text-2xl md:text-4xl text-[#F7F4F3] cursor-target"
            style={{ fontFamily: '"Pacifico", cursive' }}
          >
            SwapVerse
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/historyy"
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors cursor-target"
          >
            <img src={history} alt="history" className="w-6 h-6 md:w-8 md:h-8" />
          </Link>
          {walletAddress ? (
             <div className="flex items-center space-x-2">
               <div className="text-right">
                 <div className="text-white text-xs opacity-75 cursor-target">
                   {getWalletDisplayName()}
                 </div>
                 <div className="text-white text-sm cursor-target">
                   {formatAddress(walletAddress)}
                 </div>
                 {getNetworkStatus()}
               </div>
              <button 
                onClick={disconnectWallet}
                className="border-2 border-white bg-[#BA1B1D] px-4 py-2 rounded-xl hover:bg-[#F24333] transition-colors cursor-target"
              >
                <span
                  className="text-sm md:text-md text-white font-semibold"
                  style={{ fontFamily: '"Roboto", sans-serif' }}
                >
                  Disconnect
                </span>
              </button>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="border-2 border-white bg-[#F24333] px-4 py-2 rounded-xl hover:bg-[#BA1B1D] transition-colors disabled:opacity-50 cursor-target"
            >
              <span
                className="text-sm md:text-md text-white font-semibold"
                style={{ fontFamily: '"Roboto", sans-serif' }}
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </span>
            </button>
          )}
        </div>
      </nav>

      {/* TOKEN SWAP FORM */}
      <div className="min-h-screen bg-transparent p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1
            className="text-3xl md:text-5xl text-[#5B2333] text-center mt-8 mb-6 font-extrabold cursor-target"
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
          <p className="text-[#564D4A] text-center mb-18 text-sm cursor-target">
            <i>Your trusted platform for seamless token swapping</i>
          </p>

          {/* Token Balances */}
          {walletAddress && (
            <div className="bg-[#332F2F] rounded-xl p-4 mb-4 max-w-xl mx-auto cursor-target">
              <h3 className="text-white text-center mb-2 font-semibold">Your Token Balances</h3>
              <div className="flex justify-center space-x-8 text-white text-sm">
                <div>TKA7: {parseFloat(tokenABalance).toFixed(2)}</div>
                <div>TKB7: {parseFloat(tokenBBalance).toFixed(2)}</div>
              </div>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-xl mx-auto cursor-target">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 max-w-xl mx-auto cursor-target">
              {success}
            </div>
          )}

          <div className="bg-[#332F2F] rounded-xl p-8 border border-gray-700 max-w-xl mx-auto cursor-target">
            <form onSubmit={executeSwap} style={{ fontFamily: '"Montserrat", sans-serif' }}>
              {/* Selling Section */}
              <div className="bg-[#F7F4F3] rounded-lg p-4 mt-4">
                <label className="block text-[#5B2333] text-xs mb-2 font-semibold text-[10px]">
                  You're Selling
                </label>
                <div className="flex justify-between items-center">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amountA}
                    onChange={handleAmountAChange}
                    className="w-1/2 p-2 text-sm focus:outline-none bg-[#F7F4F3] no-spinner cursor-target"
                    disabled={!walletAddress}
                  />
                  <select
                    className="w-1/3 p-2 rounded-md border border-gray-300 text-sm bg-white cursor-target"
                    onChange={handleTokenA}
                    value={tokenA}
                    disabled={!walletAddress}
                  >
                    <option value="">-- Select Token --</option>
                    {tokens.map((token) => (
                      <option key={token} value={token} disabled={token === tokenB}>
                        {token}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap Direction Button */}
              <div className="flex justify-center items-center my-6">
  <button
    type="button"
    onClick={swapTokenDirection}
    disabled={!walletAddress || !tokenA || !tokenB}
    title="Swap Token Direction"
    className="group relative flex items-center justify-center rounded-full bg-[#0D0D0D] p-4 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out disabled:opacity-30 disabled:cursor-not-allowed"
  >
    <img
      src={swapp}
      alt="Swap Icon"
      className="w-6 h-6 transition-transform duration-300 group-hover:rotate-180"
    />
  </button>
</div>

              {/* Buying Section */}
              <div className="mb-6 bg-[#F7F4F3] rounded-lg p-4">
                <label className="block text-[#5B2333] text-[10px] mb-2 font-semibold">
                  To Buy
                </label>
                <div className="flex justify-between items-center">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amountB}
                    readOnly
                    className="w-1/2 p-2 text-sm focus:outline-none no-spinner cursor-target"
                  />
                  <select
                    className="w-1/3 p-2 rounded-md border border-gray-300 text-sm bg-white cursor-target"
                    onChange={handleTokenB}
                    value={tokenB}
                    disabled={!walletAddress}
                  >
                    <option value="">-- Select Token --</option>
                    {tokens.map((token) => (
                      <option key={token} value={token} disabled={token === tokenA}>
                        {token}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={!walletAddress || isSwapping || !tokenA || !tokenB || !amountA}
                  className="bg-[#F24333] hover:bg-[#BA1B1D] text-white px-6 py-2 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-target"
                >
                  {isSwapping ? "Swapping..." : "Swap"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <footer
  className="bg-[#5B2333] w-full shadow-[0_4px_10px_rgba(0,0,0,0.25)]
"
  style={{ fontFamily: '"Libertinus Mono", monospace' }}
>
  {/* Top Section: Logo / Newsletter */}
  <div className="flex flex-col md:flex-row justify-between items-center px-6 py-8 gap-6">
    {/* Designed By */}
    <div className="text-center md:text-left cursor-target">
      <h2 className="text-lg font-bold text-[#F7F4F3]">
        Designed By Harshit Singh
      </h2>
    </div>

    {/* Newsletter */}
    <div className="flex flex-col sm:flex-row items-center gap-2">
      <input
        type="email"
        placeholder="Enter your email"
        className="px-3 py-2 rounded-md text-sm focus:outline-none text-[#07090F] bg-[#F7F4F3] cursor-target"
      />
      <button className="bg-[#98473E] hover:bg-[#A37C40] text-white px-4 py-2 rounded-md text-sm cursor-target">
        Subscribe
      </button>
    </div>

    {/* Social Media */}
    <div className="flex gap-4 text-[#F7F4F3] text-xl">
      <a href="#" aria-label="Facebook" className="hover:text-[#A37C40] cursor-target">
        <i className="fab fa-facebook-f"></i>
      </a>
      <a href="#" aria-label="Twitter" className="hover:text-[#A37C40] cursor-target">
        <i className="fab fa-twitter"></i>
      </a>
      <a href="#" aria-label="Instagram" className="hover:text-[#A37C40] cursor-target">
        <i className="fab fa-instagram"></i>
      </a>
      <a href="#" aria-label="LinkedIn" className="hover:text-[#A37C40] cursor-target">
        <i className="fab fa-linkedin-in"></i>
      </a>
    </div>
  </div>

  {/* Divider */}
  <hr className="m-4 border-[#C4C4C4]" />

  {/* Bottom Text */}
  <div className="flex justify-center items-center px-4 pb-6 text-center">
    <p className="text-[12px] text-[#F7F4F3] cursor-target">
      © 2025 SwapVerse. All rights reserved. Empowering seamless token swaps
      with security and speed.
    </p>
  </div>
</footer>

    </>
  );
}
