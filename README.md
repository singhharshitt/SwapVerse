
<body>

  <h1>🔄 SwapVerse – Token Swap DApp on Ethereum</h1>

  <p><strong>SwapVerse</strong> is a decentralized token swap application that lets users instantly exchange ERC-20 tokens (TokenA ↔ TokenB) directly from their wallets.</p>
  <p class="tagline">🚀 “Step into the universe of instant token swaps.”</p>

  <h2>✨ Features</h2>
  <ul>
    <li>Swap between TokenA and TokenB with a fixed exchange rate</li>
    <li>Connect wallet via MetaMask</li>
    <li>Live balances and token approval handling</li>
    <li>Smart contracts built with OpenZeppelin (ERC-20 standard)</li>
    <li>Deployed on Ethereum Goerli Testnet</li>
    <li>Frontend powered by React & Ethers.js</li>
  </ul>

  <h2>📦 Tech Stack</h2>
  <ul>
    <li><strong>Smart Contract:</strong> Solidity, Hardhat, OpenZeppelin</li>
    <li><strong>Frontend:</strong> React.js, Ethers.js, Tailwind CSS</li>
    <li><strong>Wallet & Chain:</strong> MetaMask, Alchemy (Goerli RPC)</li>
    <li><strong>Dev Tools:</strong> Hardhat Toolbox, dotenv, Vite</li>
  </ul>

  <h2>🛠️ Project Structure</h2>
  <pre><code>
SwapVerse/
├── contracts/        # TokenA.sol, TokenB.sol, TokenSwap.sol
├── scripts/          # deploy.js scripts for all contracts
├── test/             # Unit tests for smart contracts
├── client/           # React frontend with wallet connection
├── hardhat.config.js # Hardhat configuration
└── .env              # Alchemy & private key (not committed)
  </code></pre>
</body>
