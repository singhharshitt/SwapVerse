export const CONTRACT_ADDRESSES = {
  TOKEN_A: "0x18bCdC0AB71FbE0682ea5803e1C4586878A3339c",
  TOKEN_B: "0x889cc282Cb3553CE7744b732542f22e1fAb32DA4",
  TOKEN_SWAP: "0xbD5E43894a6992bc68B812D25C0DCce5b06A9637"
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