// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@pancakeswap-libs/pancake-swap-core/contracts/interfaces/IPancakePair.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

interface IPancakeStableSwapRouter {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
}

contract StableCoin is ERC20Burnable, ERC20Pausable, Ownable {
    IPancakeStableSwapRouter public pancakeRouter;
    AggregatorV3Interface internal priceFeed;
    address public stableSwapRouter;
    address public usdt;
    uint256 public minPegThreshold = 99 * 1e6; // 0.99 USDT in 8 decimals
    uint256 public maxPegThreshold = 101 * 1e6; // 1.01 USDT in 8 decimals

    event PegRebalanced(uint24 newLpFee);

    constructor(address _router, address _priceFeed, address _usdt) ERC20("MyStableCoin", "MSC") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10 ** decimals()); // Mint 1 million tokens to deployer
        stableSwapRouter = _router;
        pancakeRouter = IPancakeStableSwapRouter(_router);
        priceFeed = AggregatorV3Interface(_priceFeed);
        usdt = _usdt;
    }

    function getLatestPrice() public view returns (uint256) {
        (, int price,,,) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price feed");
        return uint256(price);
    }

    function mint(uint256 amount) external onlyOwner {
        require(getLatestPrice() >= 1e8, "Price below peg");
        _mint(msg.sender, amount);
    }

    function _swap(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external whenNotPaused returns (uint256[] memory amounts) {
        require(balanceOf(msg.sender) >= amountIn, "Insufficient balance");
        require(path.length >= 2, "Invalid path");
        require(path[0] == address(this) && path[path.length - 1] == usdt, "Invalid stablecoin path");
        
        _approve(msg.sender, stableSwapRouter, amountIn);
        amounts = pancakeRouter.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            to,
            deadline
        );
    }

    function rebalancePeg() external onlyOwner {
        uint256 currentPrice = getLatestPrice();
        uint24 newLpFee = 3000; // Default fee (0.3%)
        if (currentPrice < minPegThreshold) {
            newLpFee = newLpFee + 1000; // Increase fee if below peg
        } else if (currentPrice > maxPegThreshold) {
            newLpFee = newLpFee - 1000; // Reduce fee if above peg
        }
        emit PegRebalanced(newLpFee);
    }
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
