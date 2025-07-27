import { useState, useEffect } from 'react'; 
import history from '../assets/history.png';
import { Link } from "react-router-dom";
import TargetCursor from '../components/TargetCursor';
import Squares from '../components/Squares';
import WalletModal from '../components/WalletModal';
import web3Service from "../services/web3Service";
import transactionService from "../services/transactionService";
import { CONTRACT_ADDRESSES } from "../config/contracts";

export default function History() {
    const [transactions, setTransactions] = useState([]);
    const [walletAddress, setWalletAddress] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [connectedWalletType, setConnectedWalletType] = useState("");

    // Wallet modal state
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [availableWallets, setAvailableWallets] = useState([]);

    // Check if wallet is already connected on component mount
    useEffect(() => {
        checkWalletConnection();
        updateAvailableWallets();
        
        // Listen for network changes
        const handleNetworkChange = async () => {
            if (walletAddress) {
                const isSepolia = await web3Service.isConnectedToSepolia();
                if (!isSepolia) {
                    setError("Please switch to Sepolia testnet to use this DApp.");
                } else {
                    setError(""); // Clear error if user switches back to Sepolia
                }
            }
        };

        // Add event listeners for network changes
        if (window.ethereum) {
            window.ethereum.on('chainChanged', handleNetworkChange);
        }
        if (window.phantom?.ethereum) {
            window.phantom.ethereum.on('chainChanged', handleNetworkChange);
        }

        // Cleanup event listeners
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('chainChanged', handleNetworkChange);
            }
            if (window.phantom?.ethereum) {
                window.phantom.ethereum.removeListener('chainChanged', handleNetworkChange);
            }
        };
    }, [walletAddress]);

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
            if (web3Service.isConnected()) {
                const account = await web3Service.getCurrentAccount();
                if (account) {
                    // Check if we're on the correct network
                    const isSepolia = await web3Service.isConnectedToSepolia();
                    if (!isSepolia) {
                        setError("Please switch to Sepolia testnet to use this DApp.");
                        web3Service.disconnect();
                        return;
                    }
                    
                    setWalletAddress(account);
                    setConnectedWalletType(web3Service.getConnectedWalletType());
                    await loadTransactionHistory(account);
                }
            } else {
                // Try auto-reconnect only if previously connected
                const account = await web3Service.autoReconnect();
                if (account) {
                    setWalletAddress(account);
                    setConnectedWalletType(web3Service.getConnectedWalletType());
                    await loadTransactionHistory(account);
                }
            }
        } catch (error) {
            console.error('Error checking wallet connection:', error);
            // Clear any invalid connection state
            web3Service.disconnect();
        } finally {
            setIsLoading(false);
        }
    };

    // Load transaction history
    const loadTransactionHistory = async (address) => {
        setIsLoading(true);
        try {
            const history = await transactionService.getTransactionHistory(address);
            setTransactions(history);
            
            // Set up real-time listener for new transactions
            const unsubscribe = await transactionService.listenForNewTransactions(address, (newTransaction) => {
                setTransactions(prev => [newTransaction, ...prev]);
            });

            // Cleanup listener on unmount
            return unsubscribe;
        } catch (error) {
            console.error('Error loading transaction history:', error);
            setError('Failed to load transaction history');
        } finally {
            setIsLoading(false);
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
            const address = await web3Service.connectToWallet(walletType);
            
            // Check if we're on the correct network after connection
            const isSepolia = await web3Service.isConnectedToSepolia();
            if (!isSepolia) {
                setError("Please switch to Sepolia testnet to use this DApp. You can continue, but some features may not work.");
            }
            
            setWalletAddress(address);
            setConnectedWalletType(walletType);
            await loadTransactionHistory(address);
            setSuccess(`Connected to ${walletType === 'metamask' ? 'MetaMask' : 'Phantom'} successfully!`);
            
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
        setTransactions([]);
        setConnectedWalletType("");
        setError("");
        setSuccess("");
    };

    // Format wallet address for display
    const formatAddress = (address) => {
        if (!address) return "";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    // Format transaction hash for display
    const formatTxHash = (hash) => {
        if (!hash) return "";
        return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
    };

    // Get token symbol from address
    const getTokenSymbol = (address) => {
        if (address.toLowerCase() === CONTRACT_ADDRESSES.TOKEN_A.toLowerCase()) {
            return "TKA7";
        } else if (address.toLowerCase() === CONTRACT_ADDRESSES.TOKEN_B.toLowerCase()) {
            return "TKB7";
        }
        return "Unknown";
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
            
            {/* Navbar */}
            <nav className="flex items-center justify-between z-50 bg-[#5B2333] p-4 md:p-8 border-b border-gray-800 shadow-[0_4px_10px_rgba(0,0,0,0.25)]">
                <div className="flex items-center">
                    <Link to="/" className="hover:opacity-80 transition-opacity cursor-target">
                        <h2 className="text-2xl md:text-4xl text-[#F7F4F3]" style={{ fontFamily: '"Pacifico", cursive' }}>
                            SwapVerse
                        </h2>
                    </Link>
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

            {/* History Content */}
            <div className="min-h-screen bg-transparent p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl md:text-5xl text-[#5B2333] font-extrabold cursor-target" style={{ fontFamily: '"Bitter", serif' }}>
                            Transaction History
                        </h1>
                        <Link 
                            to="/" 
                            className="text-[#5B2333] hover:text-[#F24333] transition-colors text-lg cursor-target"
                        >
                            ← Back to Home
                        </Link>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-4xl mx-auto cursor-target">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 max-w-4xl mx-auto cursor-target">
                            {success}
                        </div>
                    )}

                    {!walletAddress ? (
                        <div className="bg-[#332F2F] rounded-xl p-8 border border-gray-700 max-w-4xl mx-auto text-center cursor-target">
                            <h3 className="text-white text-xl mb-4 font-semibold">Connect Your Wallet</h3>
                            <p className="text-gray-300 mb-6">Connect your wallet to view your transaction history</p>
                            <button 
                                onClick={connectWallet}
                                disabled={isConnecting}
                                className="bg-[#F24333] hover:bg-[#BA1B1D] text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 cursor-target"
                            >
                                {isConnecting ? "Connecting..." : "Connect Wallet"}
                            </button>
                        </div>
                    ) : isLoading ? (
                        <div className="bg-[#332F2F] rounded-xl p-8 border border-gray-700 max-w-4xl mx-auto text-center cursor-target">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F24333] mx-auto mb-4"></div>
                            <p className="text-white text-lg">Loading transaction history...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="bg-[#332F2F] rounded-xl p-8 border border-gray-700 max-w-4xl mx-auto text-center cursor-target">
                            <h3 className="text-white text-xl mb-4 font-semibold">No Transactions Found</h3>
                            <p className="text-gray-300 mb-6">Your swap history will appear here once you make transactions</p>
                            <Link 
                                to="/" 
                                className="bg-[#F24333] hover:bg-[#BA1B1D] text-white px-6 py-3 rounded-xl font-semibold inline-block cursor-target"
                            >
                                Start Swapping
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-[#332F2F] rounded-xl border border-gray-700 overflow-hidden cursor-target">
                            <div className="p-6 border-b border-gray-700">
                                <h3 className="text-white text-xl font-semibold">Recent Transactions</h3>
                                <p className="text-gray-300 text-sm mt-1">Your latest token swap transactions</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-white font-semibold cursor-target">Transaction Hash</th>
                                            <th className="px-6 py-4 text-left text-white font-semibold cursor-target">From</th>
                                            <th className="px-6 py-4 text-left text-white font-semibold cursor-target">To</th>
                                            <th className="px-6 py-4 text-left text-white font-semibold cursor-target">Amount</th>
                                            <th className="px-6 py-4 text-left text-white font-semibold cursor-target">Date</th>
                                            <th className="px-6 py-4 text-left text-white font-semibold cursor-target">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((tx) => (
                                            <tr key={tx.id} className="border-b border-gray-700 hover:bg-gray-800 transition-colors cursor-target">
                                                <td className="px-6 py-4 text-gray-300 font-mono text-sm">
                                                    {formatTxHash(tx.txHash)}
                                                </td>
                                                <td className="px-6 py-4 text-gray-300 font-semibold">
                                                    {typeof tx.from === 'string' ? tx.from : getTokenSymbol(tx.from)}
                                                </td>
                                                <td className="px-6 py-4 text-gray-300 font-semibold">
                                                    {typeof tx.to === 'string' ? tx.to : getTokenSymbol(tx.to)}
                                                </td>
                                                <td className="px-6 py-4 text-gray-300">{tx.amount}</td>
                                                <td className="px-6 py-4 text-gray-300">{tx.date}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm cursor-target">
                                                        {tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
