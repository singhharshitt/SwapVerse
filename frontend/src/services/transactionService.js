import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import { TOKEN_SWAP_ABI } from '../config/contractABIs';

class TransactionService {
  constructor() {
    this.provider = null;
  }

  // Initialize provider
  async initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
    } else {
      // Fallback to local provider
      this.provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    }
  }

  // Get transaction history from blockchain events
  async getTransactionHistory(userAddress, fromBlock = 0) {
    try {
      if (!this.provider) {
        await this.initializeProvider();
      }

      const tokenSwapContract = new ethers.Contract(
        CONTRACT_ADDRESSES.TOKEN_SWAP,
        TOKEN_SWAP_ABI,
        this.provider
      );

      // Get current block number
      const currentBlock = await this.provider.getBlockNumber();
      const fromBlockNumber = fromBlock || Math.max(0, currentBlock - 1000); // Last 1000 blocks

      // Fetch swap events
      const swapEvents = await tokenSwapContract.queryFilter(
        tokenSwapContract.filters.Swap,
        fromBlockNumber,
        currentBlock
      );

      // Filter events for the specific user
      const userTransactions = [];
      
      for (const event of swapEvents) {
        try {
          const tx = await this.provider.getTransaction(event.transactionHash);
          if (tx.from.toLowerCase() === userAddress.toLowerCase()) {
            const block = await this.provider.getBlock(event.blockNumber);
            const timestamp = block.timestamp;
            
            // Parse event data
            const args = event.args;
            const fromToken = args.fromToken;
            const toToken = args.toToken;
            const amount = ethers.formatUnits(args.amount, 18);
            
            userTransactions.push({
              id: userTransactions.length + 1,
              txHash: event.transactionHash,
              from: fromToken,
              to: toToken,
              amount: parseFloat(amount).toFixed(2),
              date: new Date(timestamp * 1000).toLocaleDateString(),
              status: 'Completed',
              blockNumber: event.blockNumber,
              timestamp: timestamp
            });
          }
        } catch (error) {
          console.error('Error processing transaction:', error);
        }
      }

      // Sort by timestamp (newest first)
      return userTransactions.sort((a, b) => b.timestamp - a.timestamp);

    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  // Get transaction details by hash
  async getTransactionDetails(txHash) {
    try {
      if (!this.provider) {
        await this.initializeProvider();
      }

      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);
      const block = await this.provider.getBlock(tx.blockNumber);

      return {
        hash: txHash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: ethers.formatUnits(tx.gasPrice, 'gwei'),
        blockNumber: tx.blockNumber,
        timestamp: block.timestamp,
        status: receipt.status === 1 ? 'Success' : 'Failed'
      };
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      return null;
    }
  }

  // Listen for new transactions
  async listenForNewTransactions(userAddress, callback) {
    try {
      if (!this.provider) {
        await this.initializeProvider();
      }

      const tokenSwapContract = new ethers.Contract(
        CONTRACT_ADDRESSES.TOKEN_SWAP,
        TOKEN_SWAP_ABI,
        this.provider
      );

      // Listen for Swap events
      tokenSwapContract.on('Swap', async (from, to, amount, event) => {
        if (from.toLowerCase() === userAddress.toLowerCase()) {
          const block = await this.provider.getBlock(event.blockNumber);
          const newTransaction = {
            id: Date.now(),
            txHash: event.transactionHash,
            from: 'TKA7', // You might want to get the actual token symbols
            to: 'TKB7',
            amount: ethers.formatUnits(amount, 18),
            date: new Date(block.timestamp * 1000).toLocaleDateString(),
            status: 'Completed',
            blockNumber: event.blockNumber,
            timestamp: block.timestamp
          };
          
          callback(newTransaction);
        }
      });

      return () => {
        tokenSwapContract.removeAllListeners('Swap');
      };
    } catch (error) {
      console.error('Error setting up transaction listener:', error);
    }
  }
}

export default new TransactionService(); 