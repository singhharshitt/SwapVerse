import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from '../config/contracts';
import { ERC20_ABI, TOKEN_SWAP_ABI } from '../config/contractABIs';
import networkService from './networkService';
import notificationService from './notificationService.jsx';

// Token configuration for MetaMask watchAsset
const TOKEN_CONFIG = {
  TKA7: {
    address: CONTRACT_ADDRESSES.TOKEN_A,
    symbol: 'TKA7',
    decimals: 18,
    image: 'https://yourdomain.com/tka7-icon.png' // Replace with your actual icon URL
  },
  TKB7: {
    address: CONTRACT_ADDRESSES.TOKEN_B,
    symbol: 'TKB7',
    decimals: 18,
    image: 'https://yourdomain.com/tkb7-icon.png' // Replace with your actual icon URL
  }
};

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.tokenSwapContract = null;
    this.tokenAContract = null;
    this.tokenBContract = null;
    this.connectedWallet = null; // 'metamask' or 'phantom'
    this.tokensAddedThisSession = new Set(); // Track tokens added in current session
  }

  // Check available wallets
  getAvailableWallets() {
    const wallets = [];
    
    if (window.ethereum) {
      wallets.push('metamask');
    }
    
    if (window.phantom?.ethereum) {
      wallets.push('phantom');
    }
    
    return wallets;
  }

  // Add token to MetaMask using wallet_watchAsset
  async addTokenToMetaMask(tokenSymbol, ethereumProvider) {
    try {
      // Check if token was already added this session
      if (this.tokensAddedThisSession.has(tokenSymbol)) {
        console.log(`${tokenSymbol} already added this session, skipping...`);
        return;
      }

      const tokenConfig = TOKEN_CONFIG[tokenSymbol];
      if (!tokenConfig) {
        console.error(`Token configuration not found for ${tokenSymbol}`);
        return;
      }

      console.log(`Attempting to add ${tokenSymbol} to MetaMask...`);
      
      const result = await ethereumProvider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenConfig.address,
            symbol: tokenConfig.symbol,
            decimals: tokenConfig.decimals,
            image: tokenConfig.image
          }
        }
      });

      if (result) {
        console.log(`✅ ${tokenSymbol} successfully added to MetaMask!`);
        this.tokensAddedThisSession.add(tokenSymbol);
      } else {
        console.log(`❌ ${tokenSymbol} was rejected by user`);
      }
    } catch (error) {
      console.error(`Error adding ${tokenSymbol} to MetaMask:`, error);
      
      // Handle specific error cases
      if (error.code === 4001) {
        console.log(`❌ ${tokenSymbol} addition was rejected by user`);
      } else if (error.message && error.message.includes('already added')) {
        console.log(`ℹ️ ${tokenSymbol} is already added to MetaMask`);
        this.tokensAddedThisSession.add(tokenSymbol);
      } else {
        console.error(`❌ Failed to add ${tokenSymbol}:`, error.message);
      }
    }
  }

  // Add all custom tokens to MetaMask
  async addCustomTokensToMetaMask(ethereumProvider) {
    try {
      console.log('🔄 Adding custom tokens to MetaMask...');
      
      // Add both tokens
      await this.addTokenToMetaMask('TKA7', ethereumProvider);
      await this.addTokenToMetaMask('TKB7', ethereumProvider);
      
      console.log('✅ Custom token addition process completed');
    } catch (error) {
      console.error('Error in addCustomTokensToMetaMask:', error);
    }
  }

  // Mint tokens to user if they have 0 balance
  async mintTokensIfNeeded(userAddress) {
    try {
      if (!this.signer) {
        console.log('No signer available for minting');
        return;
      }

      console.log('🔄 Checking token balances for minting...');

      // Check TKA7 balance
      const tka7Balance = await this.getTokenBalance(CONTRACT_ADDRESSES.TOKEN_A, userAddress);
      const tka7BalanceWei = ethers.parseUnits(tka7Balance, 18);
      
      // Check TKB7 balance
      const tkb7Balance = await this.getTokenBalance(CONTRACT_ADDRESSES.TOKEN_B, userAddress);
      const tkb7BalanceWei = ethers.parseUnits(tkb7Balance, 18);

      const mintAmount = ethers.parseUnits("1000", 18); // 1000 tokens with 18 decimals

      // Mint TKA7 if balance is 0
      if (tka7BalanceWei === BigInt(0)) {
        console.log('🪙 Minting 1000 TKA7 tokens...');
        try {
          const tokenAContract = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_A, ERC20_ABI, this.signer);
          const tx = await tokenAContract.mint(userAddress, mintAmount);
          await tx.wait();
          console.log('✅ Successfully minted 1000 TKA7 tokens!');
        } catch (error) {
          console.error('❌ Failed to mint TKA7:', error);
        }
      } else {
        console.log(`ℹ️ TKA7 balance is ${tka7Balance}, skipping mint`);
      }

      // Mint TKB7 if balance is 0
      if (tkb7BalanceWei === BigInt(0)) {
        console.log('🪙 Minting 1000 TKB7 tokens...');
        try {
          const tokenBContract = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_B, ERC20_ABI, this.signer);
          const tx = await tokenBContract.mint(userAddress, mintAmount);
          await tx.wait();
          console.log('✅ Successfully minted 1000 TKB7 tokens!');
        } catch (error) {
          console.error('❌ Failed to mint TKB7:', error);
        }
      } else {
        console.log(`ℹ️ TKB7 balance is ${tkb7Balance}, skipping mint`);
      }

      console.log('✅ Token minting check completed');
    } catch (error) {
      console.error('Error in mintTokensIfNeeded:', error);
    }
  }

  // Get stored wallet preference
  getStoredWallet() {
    return localStorage.getItem('swapverse_wallet');
  }

  // Store wallet preference
  storeWallet(walletType) {
    localStorage.setItem('swapverse_wallet', walletType);
  }

  // Clear stored wallet
  clearStoredWallet() {
    localStorage.removeItem('swapverse_wallet');
  }

  // Connect to specific wallet
  async connectToWallet(walletType) {
    try {
      // Reset any cached provider/session to ensure fresh connection
      this.provider = null;
      this.signer = null;
      this.connectedWallet = null;
      
      let ethereumProvider;
      
      if (walletType === 'metamask') {
        if (!window.ethereum) {
          throw new Error('MetaMask is not installed. Please install MetaMask to use this app.');
        }
        ethereumProvider = window.ethereum;
      } else if (walletType === 'phantom') {
        if (!window.phantom?.ethereum) {
          throw new Error('Phantom is not installed. Please install Phantom to use this app.');
        }
        ethereumProvider = window.phantom.ethereum;
      } else {
        throw new Error('Unsupported wallet type');
      }

      // Request account access
      const accounts = await ethereumProvider.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.');
      }

      // Create provider and signer
      this.provider = new ethers.BrowserProvider(ethereumProvider);
      this.signer = await this.provider.getSigner();
      this.connectedWallet = walletType;

      // Setup network listeners
      networkService.setupNetworkListeners(
        ethereumProvider,
        this.handleNetworkChange.bind(this),
        this.handleAccountChange.bind(this)
      );

      // Check if we're on the correct network (Sepolia)
      const isCorrectNetwork = await networkService.isConnectedToCorrectNetwork(this.provider);
      if (!isCorrectNetwork) {
        try {
          await networkService.switchToSepolia(ethereumProvider);
          notificationService.networkSwitchSuccess();
        } catch (error) {
          console.error('Could not switch to Sepolia network:', error);
          notificationService.networkSwitchFailed(error.message);
          // Reset provider and signer since network switch failed
          this.provider = null;
          this.signer = null;
          this.connectedWallet = null;
          // Re-throw the error to prevent further operations
          throw error;
        }
      }

      // Initialize contracts
      await this.initializeContracts();

      // Store wallet preference only after successful connection
      this.storeWallet(walletType);

      // Add custom tokens to MetaMask after successful connection
      if (walletType === 'metamask') {
        // Add tokens asynchronously - don't wait for completion to avoid blocking the connection
        this.addCustomTokensToMetaMask(ethereumProvider).catch(error => {
          console.error('Error adding custom tokens:', error);
        });
      }

      // Mint tokens if user has 0 balance (only once per connection)
      this.mintTokensIfNeeded(accounts[0]).catch(error => {
        console.error('Error minting tokens:', error);
      });

      notificationService.walletConnected(walletType === 'metamask' ? 'MetaMask' : 'Phantom');
      return accounts[0];
    } catch (error) {
      console.error('Error connecting wallet:', error);
      
      // Handle specific rejection errors
      if (error.code === 4001) {
        throw new Error('Connection rejected by user. Please try again.');
      } else if (error.code === -32002) {
        throw new Error('Connection request already pending. Please check your wallet.');
      } else if (error.message.includes('User rejected') || error.message.includes('user rejected')) {
        throw new Error('Connection rejected by user. Please try again.');
      } else if (error.message.includes('rejected') || error.message.includes('cancelled')) {
        throw new Error('Connection was cancelled. Please try again when ready.');
      } else if (error.message.includes('provider not initialized')) {
        throw new Error('Wallet provider not ready. Please try again.');
      }
      
      throw error;
    }
  }

  // Connect wallet (always show wallet selection prompt)
  async connectWallet() {
    // Reset any cached state to ensure fresh connection
    this.provider = null;
    this.signer = null;
    this.connectedWallet = null;
    
    const availableWallets = this.getAvailableWallets();
    
    if (availableWallets.length === 0) {
      throw new Error('No supported wallets found. Please install MetaMask or Phantom.');
    }

    // Always return available wallets instead of auto-connecting
    // This ensures the wallet selection modal is always shown
    return availableWallets;
  }

  // Handle network changes
  handleNetworkChange(networkInfo) {
    console.log('Network changed:', networkInfo);
    
    if (!networkInfo.isCorrectNetwork) {
      notificationService.networkError(networkInfo.name);
      
      // Emit a custom event for the UI to handle
      const event = new CustomEvent('networkChanged', {
        detail: {
          isCorrectNetwork: false,
          currentNetwork: networkInfo,
          requiresAction: true
        }
      });
      window.dispatchEvent(event);
    } else {
      // Clear any network error notifications
      notificationService.success('Connected to Sepolia testnet');
      
      // Emit a custom event for the UI to handle
      const event = new CustomEvent('networkChanged', {
        detail: {
          isCorrectNetwork: true,
          currentNetwork: networkInfo,
          requiresAction: false
        }
      });
      window.dispatchEvent(event);
    }
  }

  // Handle account changes
  handleAccountChange(accounts) {
    console.log('Account changed:', accounts);
    
    if (accounts.length === 0) {
      // User disconnected
      this.disconnect();
      notificationService.walletDisconnected();
      
      // Emit a custom event for the UI to handle
      const event = new CustomEvent('accountChanged', {
        detail: {
          accounts: [],
          isConnected: false
        }
      });
      window.dispatchEvent(event);
    } else {
      // Account changed but still connected
      notificationService.info('Account changed');
      
      // Emit a custom event for the UI to handle
      const event = new CustomEvent('accountChanged', {
        detail: {
          accounts,
          isConnected: true,
          currentAccount: accounts[0]
        }
      });
      window.dispatchEvent(event);
    }
  }

  // Initialize contract instances
  async initializeContracts() {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    // Ensure provider is properly initialized
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    this.tokenSwapContract = new ethers.Contract(
      CONTRACT_ADDRESSES.TOKEN_SWAP,
      TOKEN_SWAP_ABI,
      this.signer
    );

    this.tokenAContract = new ethers.Contract(
      CONTRACT_ADDRESSES.TOKEN_A,
      ERC20_ABI,
      this.signer
    );

    this.tokenBContract = new ethers.Contract(
      CONTRACT_ADDRESSES.TOKEN_B,
      ERC20_ABI,
      this.signer
    );
  }

  // Get token balance
  async getTokenBalance(tokenAddress, userAddress) {
    try {
      // Validate network before operation
      await this.validateNetwork();
      
      // Use existing contract instances if available, otherwise create new ones
      let contract;
      if (tokenAddress === CONTRACT_ADDRESSES.TOKEN_A && this.tokenAContract) {
        contract = this.tokenAContract;
      } else if (tokenAddress === CONTRACT_ADDRESSES.TOKEN_B && this.tokenBContract) {
        contract = this.tokenBContract;
      } else {
        // Fallback: create new contract instance with provider
        if (!this.provider) {
          throw new Error('Provider not initialized');
        }
        contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      }
      
      // Ensure the contract has a valid runner (provider or signer)
      if (!contract.runner) {
        if (this.provider) {
          contract = contract.connect(this.provider);
        } else {
          throw new Error('No valid contract runner available');
        }
      }
      
      // Add debugging information
      console.log('🔍 Getting token balance for:', {
        tokenAddress,
        userAddress,
        contractAddress: contract.target,
        provider: !!this.provider,
        signer: !!this.signer
      });
      
      // Check if contract exists at the address
      const code = await this.provider.getCode(tokenAddress);
      if (code === '0x') {
        throw new Error(`No contract found at address ${tokenAddress}. Please ensure contracts are deployed to Sepolia testnet.`);
      }
      
      const balance = await contract.balanceOf(userAddress);
      const decimals = await contract.decimals();
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Error getting token balance:', error);
      // Return a more informative error message
      if (error.message.includes('No contract found')) {
        throw new Error(`Contract not deployed at ${tokenAddress}. Please deploy contracts to Sepolia testnet first.`);
      }
      return '0';
    }
  }

  // Approve tokens for swap
  async approveTokens(tokenAddress, amount) {
    try {
      // Validate network before operation
      await this.validateNetwork();
      
      // Add debugging information
      console.log('🔍 Approving tokens:', {
        tokenAddress,
        amount,
        signer: !!this.signer,
        swapContract: CONTRACT_ADDRESSES.TOKEN_SWAP
      });
      
      // Check if contract exists at the address
      const code = await this.provider.getCode(tokenAddress);
      if (code === '0x') {
        throw new Error(`No contract found at address ${tokenAddress}. Please ensure contracts are deployed to Sepolia testnet.`);
      }
      
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer);
      const decimals = await contract.decimals();
      const amountWei = ethers.parseUnits(amount.toString(), decimals);
      
      const tx = await contract.approve(CONTRACT_ADDRESSES.TOKEN_SWAP, amountWei);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error approving tokens:', error);
      // Return a more informative error message
      if (error.message.includes('No contract found')) {
        throw new Error(`Contract not deployed at ${tokenAddress}. Please deploy contracts to Sepolia testnet first.`);
      }
      throw error;
    }
  }

  // Execute swap
  async executeSwap(fromToken, toToken, amount) {
    try {
      // Validate network before operation
      await this.validateNetwork();
      
      if (!this.tokenSwapContract) {
        throw new Error('Contracts not initialized');
      }

      const decimals = 18; // Both tokens use 18 decimals
      const amountWei = ethers.parseUnits(amount.toString(), decimals);

      let tx;
      if (fromToken === 'TKA7' && toToken === 'TKB7') {
        tx = await this.tokenSwapContract.swapAtoB(amountWei);
      } else if (fromToken === 'TKB7' && toToken === 'TKA7') {
        tx = await this.tokenSwapContract.swapBtoA(amountWei);
      } else {
        throw new Error('Invalid token pair for swap');
      }

      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error executing swap:', error);
      throw error;
    }
  }

  // Get current account
  async getCurrentAccount() {
    if (!this.provider) return null;
    const accounts = await this.provider.listAccounts();
    return accounts[0]?.address || null;
  }

  // Check if wallet is connected
  isConnected() {
    return this.signer !== null;
  }

  // Get connected wallet type
  getConnectedWalletType() {
    return this.connectedWallet;
  }

  // Disconnect wallet
  disconnect() {
    // Cleanup network listeners
    if (this.provider) {
      const ethereumProvider = this.provider.provider;
      if (ethereumProvider) {
        networkService.removeNetworkListeners(ethereumProvider);
      }
    }
    
    this.provider = null;
    this.signer = null;
    this.tokenSwapContract = null;
    this.tokenAContract = null;
    this.tokenBContract = null;
    this.connectedWallet = null;
    this.tokensAddedThisSession.clear(); // Clear session tracking
    this.clearStoredWallet();
  }

  // Check if wallet is already connected (for page load)
  async checkExistingConnection() {
    try {
      if (this.provider && this.signer) {
        const accounts = await this.provider.listAccounts();
        if (accounts.length > 0) {
          // Verify the account is still accessible
          try {
            const balance = await this.provider.getBalance(accounts[0]);
            return accounts[0];
          } catch (error) {
            console.warn('Account no longer accessible:', error);
            return null;
          }
        }
      }
      return null;
    } catch (error) {
      console.warn('Error checking existing connection:', error);
      return null;
    }
  }

  // Auto-reconnect on page load - ONLY if already connected and approved
  async autoReconnect() {
    try {
      // Only try to reconnect if we have an existing connection
      const existingAccount = await this.checkExistingConnection();
      if (existingAccount) {
        // Verify we're on the correct network
        const network = await this.provider.getNetwork();
        if (network.chainId === BigInt(11155111)) { // Sepolia testnet
          // Only reconnect if we have a stored wallet preference (user previously approved)
          const storedWallet = this.getStoredWallet();
          if (storedWallet && this.connectedWallet === storedWallet) {
            return existingAccount;
          } else {
            // Clear invalid connection state
            this.disconnect();
            return null;
          }
        } else {
          console.warn('Wrong network detected, clearing connection');
          this.disconnect();
          return null;
        }
      }
      
      // Don't auto-connect from stored preference on page load
      return null;
    } catch (error) {
      console.warn('Auto-reconnect failed:', error);
      this.disconnect();
      return null;
    }
  }

  // Validate network before any operation
  async validateNetwork() {
    try {
      if (!this.provider) {
        throw new Error('Wallet not connected');
      }
      
      return await networkService.validateNetwork(this.provider, this.provider.provider);
    } catch (error) {
      console.error('Network validation failed:', error);
      throw error;
    }
  }

  // Get current network info
  async getCurrentNetwork() {
    try {
      if (!this.provider) return null;
      return await networkService.getCurrentNetwork(this.provider);
    } catch (error) {
      console.error('Error getting network info:', error);
      return null;
    }
  }

  // Check if connected to Sepolia
  async isConnectedToSepolia() {
    try {
      if (!this.provider) return false;
      return await networkService.isConnectedToCorrectNetwork(this.provider);
    } catch (error) {
      console.error('Error checking Sepolia connection:', error);
      return false;
    }
  }

  // Check if contracts are deployed
  async checkContractsDeployed() {
    try {
      const results = {};
      
      for (const [name, address] of Object.entries(CONTRACT_ADDRESSES)) {
        try {
          const code = await this.provider.getCode(address);
          results[name] = {
            address,
            deployed: code !== '0x',
            codeLength: code.length
          };
        } catch (error) {
          results[name] = {
            address,
            deployed: false,
            error: error.message
          };
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error checking contracts deployment:', error);
      return null;
    }
  }

  // Get network status for UI display
  async getNetworkStatus(provider) {
    try {
      const isCorrect = await networkService.isConnectedToCorrectNetwork(provider);
      const network = await this.getCurrentNetwork(provider);
      
      return {
        isCorrect,
        network,
        status: isCorrect ? 'connected' : 'wrong-network',
        message: isCorrect ? 'Connected to Sepolia' : `Connected to ${network?.name || 'unknown network'}`
      };
    } catch (error) {
      console.error('Error getting network status:', error);
      return {
        isCorrect: false,
        network: null,
        status: 'error',
        message: 'Network error'
      };
    }
  }
}

export default new Web3Service(); 