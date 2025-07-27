// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenSwap is Ownable {
    IERC20 public tokenA;
    IERC20 public tokenB;

    uint256 public rateAtoB = 1; // 1:1 swap rate

    // Events for transaction tracking
    event Swap(address indexed user, address indexed fromToken, address indexed toToken, uint256 amount, uint256 timestamp);
    event LiquidityDeposited(address indexed owner, uint256 amountA, uint256 amountB, uint256 timestamp);
    event RateUpdated(uint256 oldRate, uint256 newRate, uint256 timestamp);

    constructor(address _tokenA, address _tokenB, address initialOwner) Ownable(initialOwner) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    function swapAtoB(uint256 amount) external {
        require(tokenA.allowance(msg.sender, address(this)) >= amount, "Approve tokenA first");
        require(tokenB.balanceOf(address(this)) >= amount * rateAtoB, "Insufficient tokenB");

        tokenA.transferFrom(msg.sender, address(this), amount);
        tokenB.transfer(msg.sender, amount * rateAtoB);

        emit Swap(msg.sender, address(tokenA), address(tokenB), amount, block.timestamp);
    }

    function swapBtoA(uint256 amount) external {
        require(tokenB.allowance(msg.sender, address(this)) >= amount, "Approve tokenB first");
        require(tokenA.balanceOf(address(this)) >= amount / rateAtoB, "Insufficient tokenA");

        tokenB.transferFrom(msg.sender, address(this), amount);
        tokenA.transfer(msg.sender, amount / rateAtoB);

        emit Swap(msg.sender, address(tokenB), address(tokenA), amount, block.timestamp);
    }

    function depositLiquidity(uint256 amountA, uint256 amountB) external onlyOwner {
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);

        emit LiquidityDeposited(msg.sender, amountA, amountB, block.timestamp);
    }

    function updateRate(uint256 newRate) external onlyOwner {
        require(newRate > 0, "Rate must be > 0");
        uint256 oldRate = rateAtoB;
        rateAtoB = newRate;

        emit RateUpdated(oldRate, newRate, block.timestamp);
    }
}
