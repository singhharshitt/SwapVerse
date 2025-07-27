# SwapVerse - Enhanced Web3 Token Swap DApp

A full-stack decentralized application (DApp) for seamless token swapping with enhanced wallet support, persistent connections, and beautiful UI animations.

## 🚀 Features

### 🔗 **Multi-Wallet Support**
- **MetaMask Integration**: Full support for MetaMask wallet
- **Phantom Integration**: Full support for Phantom wallet
- **Smart Wallet Detection**: Automatically detects available wallets
- **Wallet Selection Modal**: Beautiful modal for choosing between available wallets
- **Graceful Fallbacks**: Handles missing wallets and connection errors

### 🔄 **Persistent Wallet Connections**
- **Auto-Reconnect**: Automatically reconnects to the last used wallet on page reload
- **Local Storage**: Remembers wallet preferences across sessions
- **Seamless Experience**: No need to reconnect every time you visit

### 🎯 **Enhanced Token Swap Logic**
- **Prevent Duplicate Selection**: Cannot select the same token in both dropdowns
- **Swap Direction Button**: "↕️" button to quickly swap token directions
- **Real-time Calculations**: Automatic conversion rate calculations (1 TKA7 = 0.8 TKB7)
- **Smart Validation**: Prevents invalid swaps and provides clear error messages

### 🎨 **Beautiful UI/UX**
- **Custom Cursor**: Interactive TargetCursor with spinning animations
- **Background Animation**: Dynamic Squares animation with hover effects
- **Responsive Design**: Works perfectly on desktop and mobile
- **Consistent Styling**: Unified design language across all pages
- **Loading States**: Smooth loading indicators and disabled states

### 📊 **Real-time Transaction History**
- **Live Updates**: Real-time transaction monitoring
- **Event Listening**: Listens to blockchain events for instant updates
- **Detailed Information**: Shows transaction hash, amounts, dates, and status
- **Wallet Integration**: History tied to connected wallet

## 🛠️ Technical Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for utility-first styling
- **Ethers.js v6** for Web3 interactions
- **GSAP** for smooth animations

### Smart Contracts
- **Solidity 0.8.28** for smart contract development
- **OpenZeppelin** for secure, audited contract components
- **Hardhat** for development environment

### Blockchain
- **Local Hardhat Network** for development
- **ERC20 Standard** tokens (TKA7, TKB7)
- **Custom TokenSwap Contract** for exchange logic

## 📁 Project Structure

```
Token-swap-Dapp/
├── contracts/
│   ├── TokenA.sol          # ERC20 Token A (TKA7)
│   ├── TokenB.sol          # ERC20 Token B (TKB7)
│   └── TokenSwap.sol       # Token exchange contract
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TargetCursor.jsx    # Custom interactive cursor
│   │   │   ├── Squares.jsx         # Background animation
│   │   │   └── WalletModal.jsx     # Wallet selection modal
│   │   ├── pages/
│   │   │   ├── home.jsx            # Main swap interface
│   │   │   └── historyy.jsx        # Transaction history
│   │   ├── services/
│   │   │   ├── web3Service.js      # Web3 interactions
│   │   │   └── transactionService.js # Transaction handling
│   │   └── config/
│   │       ├── contracts.js        # Contract addresses
│   │       └── contractABIs.js     # Contract ABIs
│   └── package.json
├── script/
│   ├── deploy.js           # Contract deployment
│   └── addLiquidity.js     # Initial liquidity setup
└── hardhat.config.js
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MetaMask or Phantom wallet extension

### 1. Clone and Install
```bash
git clone <repository-url>
cd Token-swap-Dapp
npm install
cd frontend
npm install
```

### 2. Start Local Blockchain
```bash
# From root directory
npx hardhat node
```

### 3. Deploy Contracts
```bash
# In a new terminal, from root directory
npx hardhat run script/deploy.js --network localhost
```

### 4. Add Initial Liquidity
```bash
npx hardhat run script/addLiquidity.js --network localhost
```

### 5. Start Frontend
```bash
# From frontend directory
npm run dev
```

### 6. Connect Wallet
1. Open your browser and navigate to `http://localhost:5173`
2. Click "Connect Wallet"
3. Choose between MetaMask or Phantom (if both are available)
4. Approve the connection in your wallet
5. Switch to the local Hardhat network if prompted

## 🎯 Usage Guide

### Connecting Wallets
- **Single Wallet**: If only one wallet is available, it connects automatically
- **Multiple Wallets**: A modal appears to choose between MetaMask and Phantom
- **Auto-Reconnect**: Your wallet preference is saved and auto-reconnects on page reload

### Swapping Tokens
1. **Select Tokens**: Choose TKA7 or TKB7 in both dropdowns (duplicates are prevented)
2. **Enter Amount**: Type the amount you want to swap
3. **Review Conversion**: The converted amount appears automatically
4. **Swap Direction**: Use the "↕️" button to quickly reverse the swap direction
5. **Execute Swap**: Click "Swap" to execute the transaction

### Viewing History
- Navigate to the History page to see all your transactions
- Transactions update in real-time as you make swaps
- Each transaction shows hash, amounts, dates, and status

## 🔧 Configuration

### Contract Addresses
Update `frontend/src/config/contracts.js` with your deployed contract addresses:

```javascript
export const CONTRACT_ADDRESSES = {
  TOKEN_A: "0x...",      // Your TokenA contract address
  TOKEN_B: "0x...",      // Your TokenB contract address
  TOKEN_SWAP: "0x..."    // Your TokenSwap contract address
};
```

### Network Configuration
Configure your network settings in the same file:

```javascript
export const NETWORK_CONFIG = {
  chainId: "0x7A69",     // Chain ID in hex
  chainName: "Hardhat Local",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: ["http://127.0.0.1:8545"]
};
```

## 🎨 Customization

### Styling
- All colors and styling use Tailwind CSS classes
- Main theme colors: `#5B2333` (maroon), `#F24333` (red), `#F7F4F3` (light)
- Custom fonts: Pacifico, Bitter, Montserrat, Roboto

### Animations
- **TargetCursor**: Customizable spin duration and cursor effects
- **Squares**: Configurable speed, size, direction, and colors
- **Wallet Modal**: Smooth transitions and hover effects

### Wallet Integration
- Easy to add new wallet providers in `web3Service.js`
- Wallet detection logic in `getAvailableWallets()`
- Persistent storage using localStorage

## 🔒 Security Features

- **Input Validation**: All user inputs are validated
- **Error Handling**: Comprehensive error handling and user feedback
- **Transaction Confirmation**: Users must approve all transactions
- **Network Validation**: Ensures correct network connection
- **Contract Verification**: Uses audited OpenZeppelin contracts

## 🐛 Troubleshooting

### Common Issues

**"No supported wallets found"**
- Install MetaMask or Phantom browser extension
- Ensure the extension is enabled and unlocked

**"Failed to connect wallet"**
- Check if your wallet is unlocked
- Ensure you're on the correct network (Hardhat Local)
- Try refreshing the page and reconnecting

**"Transaction failed"**
- Check your token balance
- Ensure you have enough ETH for gas fees
- Verify the transaction in your wallet

**"Cubes not visible"**
- Check browser console for errors
- Ensure JavaScript is enabled
- Try refreshing the page

### Debug Mode
Enable debug logging by setting `localStorage.setItem('debug', 'true')` in browser console.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **OpenZeppelin** for secure smart contract components
- **Ethers.js** for Web3 functionality
- **Tailwind CSS** for utility-first styling
- **GSAP** for smooth animations
- **Hardhat** for development environment

---

**Built with ❤️ by Harshit Singh**

*SwapVerse - Empowering seamless token swaps with security and speed.* 