export const CONTRACT_ADDRESSES = {
  TOKEN_A: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
  TOKEN_B: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
  TOKEN_SWAP: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318"
};

export const NETWORK_CONFIG = {
  chainId: "0xaa36a7", // 11155111 in hex (Sepolia testnet)
  chainName: "Sepolia Testnet",
  nativeCurrency: {
    name: "Sepolia Ether",
    symbol: "ETH", // Changed from 'SEP' to 'ETH' to fix MetaMask RPC error
    decimals: 18
  },
  rpcUrls: ["https://rpc.sepolia.org"], // Updated to use the correct RPC URL
  blockExplorerUrls: ["https://sepolia.etherscan.io"] // Added block explorer URL
}; 