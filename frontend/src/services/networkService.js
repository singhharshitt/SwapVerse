import { ethers } from 'ethers';
import { NETWORK_CONFIG } from '../config/contracts';

class NetworkService {
  constructor() {
    this.requiredChainId = BigInt(11155111); // Sepolia testnet
    this.requiredChainIdHex = '0xaa36a7'; // Sepolia in hex
    this.networkChangeCallbacks = [];
    this.accountChangeCallbacks = [];
  }

  // Check if connected to the correct network (Sepolia)
  async isConnectedToCorrectNetwork(provider) {
    try {
      if (!provider) return false;
      
      const network = await provider.getNetwork();
      return network.chainId === this.requiredChainId;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  }

  // Get current network info
  async getCurrentNetwork(provider) {
    try {
      if (!provider) return null;
      
      const network = await provider.getNetwork();
      return {
        chainId: network.chainId,
        chainIdHex: `0x${network.chainId.toString(16)}`,
        name: network.name || this.getNetworkName(network.chainId)
      };
    } catch (error) {
      console.error('Error getting current network:', error);
      return null;
    }
  }

  // Get network name by chain ID
  getNetworkName(chainId) {
    const networks = {
      1: 'Ethereum Mainnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon',
      56: 'BSC',
      42161: 'Arbitrum One'
    };
    return networks[Number(chainId)] || `Chain ID ${chainId}`;
  }

  // Switch to Sepolia network
  async switchToSepolia(ethereumProvider) {
    try {
      console.log('🔄 Attempting to switch to Sepolia network...');
      
      // First try to switch to the network
      try {
        await ethereumProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: this.requiredChainIdHex }]
        });
        console.log('✅ Successfully switched to Sepolia network');
        return true;
      } catch (switchError) {
        console.log('Switch failed, trying to add network:', switchError);
        
        // If the network is not added, add it
        if (switchError.code === 4902) {
          try {
            await ethereumProvider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: this.requiredChainIdHex,
                chainName: NETWORK_CONFIG.chainName,
                nativeCurrency: NETWORK_CONFIG.nativeCurrency,
                rpcUrls: NETWORK_CONFIG.rpcUrls,
                blockExplorerUrls: NETWORK_CONFIG.blockExplorerUrls
              }]
            });
            console.log('✅ Successfully added and switched to Sepolia network');
            return true;
          } catch (addError) {
            console.error('Failed to add Sepolia network:', addError);
            throw new Error(this.getNetworkErrorMessage(addError));
          }
        } else {
          console.error('Failed to switch to Sepolia network:', switchError);
          throw new Error(this.getNetworkErrorMessage(switchError));
        }
      }
    } catch (error) {
      console.error('Network switch error:', error);
      throw error;
    }
  }

  // Get user-friendly error message for network operations
  getNetworkErrorMessage(error) {
    if (error.code === 4001) {
      return 'Network switch was rejected by user. Please switch to Sepolia testnet manually.';
    } else if (error.code === 4902) {
      return 'Sepolia network not found. Please add it to your wallet manually.';
    } else if (error.message && error.message.includes('nativeCurrency.symbol')) {
      return 'Network configuration error. Please switch to Sepolia testnet manually.';
    } else {
      return 'Failed to switch network. Please switch to Sepolia testnet manually.';
    }
  }

  // Setup network change listeners
  setupNetworkListeners(ethereumProvider, onNetworkChange, onAccountChange) {
    if (!ethereumProvider) return;

    // Remove existing listeners to prevent duplicates
    this.removeNetworkListeners(ethereumProvider);

    // Add network change listener
    const handleChainChanged = (chainId) => {
      console.log('🔄 Network changed to:', chainId);
      const isCorrectNetwork = chainId === this.requiredChainIdHex;
      
      if (onNetworkChange) {
        onNetworkChange({
          chainId: BigInt(parseInt(chainId, 16)),
          chainIdHex: chainId,
          isCorrectNetwork,
          name: this.getNetworkName(parseInt(chainId, 16))
        });
      }
    };

    // Add account change listener
    const handleAccountsChanged = (accounts) => {
      console.log('🔄 Account changed:', accounts);
      if (onAccountChange) {
        onAccountChange(accounts);
      }
    };

    // Store callbacks for cleanup
    this.networkChangeCallbacks.push({ provider: ethereumProvider, callback: handleChainChanged });
    this.accountChangeCallbacks.push({ provider: ethereumProvider, callback: handleAccountsChanged });

    // Add listeners
    ethereumProvider.on('chainChanged', handleChainChanged);
    ethereumProvider.on('accountsChanged', handleAccountsChanged);

    console.log('✅ Network listeners setup complete');
  }

  // Remove network listeners
  removeNetworkListeners(ethereumProvider) {
    if (!ethereumProvider) return;

    // Remove network change listeners
    this.networkChangeCallbacks.forEach(({ provider, callback }) => {
      if (provider === ethereumProvider) {
        try {
          provider.removeListener('chainChanged', callback);
        } catch (error) {
          console.warn('Error removing chainChanged listener:', error);
        }
      }
    });

    // Remove account change listeners
    this.accountChangeCallbacks.forEach(({ provider, callback }) => {
      if (provider === ethereumProvider) {
        try {
          provider.removeListener('accountsChanged', callback);
        } catch (error) {
          console.warn('Error removing accountsChanged listener:', error);
        }
      }
    });

    // Clear stored callbacks
    this.networkChangeCallbacks = this.networkChangeCallbacks.filter(
      item => item.provider !== ethereumProvider
    );
    this.accountChangeCallbacks = this.accountChangeCallbacks.filter(
      item => item.provider !== ethereumProvider
    );
  }

  // Validate network before any Web3 operation
  async validateNetwork(provider, ethereumProvider) {
    const isCorrectNetwork = await this.isConnectedToCorrectNetwork(provider);
    
    if (!isCorrectNetwork) {
      const currentNetwork = await this.getCurrentNetwork(provider);
      throw new Error(`Wrong network detected. You are connected to ${currentNetwork?.name || 'unknown network'}. Please switch to Sepolia testnet.`);
    }
    
    return true;
  }

  // Get network status for UI display
  async getNetworkStatus(provider) {
    try {
      const isCorrect = await this.isConnectedToCorrectNetwork(provider);
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

  // Cleanup all listeners
  cleanup() {
    this.networkChangeCallbacks.forEach(({ provider, callback }) => {
      try {
        provider.removeListener('chainChanged', callback);
      } catch (error) {
        console.warn('Error removing chainChanged listener during cleanup:', error);
      }
    });

    this.accountChangeCallbacks.forEach(({ provider, callback }) => {
      try {
        provider.removeListener('accountsChanged', callback);
      } catch (error) {
        console.warn('Error removing accountsChanged listener during cleanup:', error);
      }
    });

    this.networkChangeCallbacks = [];
    this.accountChangeCallbacks = [];
  }
}

export default new NetworkService(); 