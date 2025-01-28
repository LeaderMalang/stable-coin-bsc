// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

contract StableCoin is ERC20, Ownable, ReentrancyGuard, Pausable {
    IPyth pyth;
    address public pythOracle;
    uint256 public immutable maxSupply;
    bytes32 public usdtUsdPriceFeedId; // Pyth price feed ID for Bnb/USD.
    uint256 public constant SCALING_FACTOR = 1e6; // Scaling factor to manage decimals for price.
    uint256 private constant PRICE_FLOOR = 1 * SCALING_FACTOR; // in USD // in USD
    uint256 public reserveBalance; // USD reserves (in cents or wei)

    mapping(address => bool) public blacklisted;
    mapping(address => bool) public frozen;

    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);
    event Blacklisted(address indexed account, bool status);
    event Frozen(address indexed account, bool status);
    event OracleUpdated(address indexed newOracle);

    /**
     * @param _pythOracle The address of the Pyth contract
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 _maxSupply,
        bytes32 _usdtUsdPriceFeedId,
        address _pythOracle
    ) payable ERC20(name, symbol) Ownable(_msgSender()) {
        require(
            initialSupply <= _maxSupply,
            "Initial supply exceeds max supply"
        );
        _mint(_msgSender(), initialSupply);
        maxSupply = _maxSupply;
        pythOracle = _pythOracle;
        //pyth = IPyth(_pythOracle);
        usdtUsdPriceFeedId = _usdtUsdPriceFeedId;

        // The IPyth interface from pyth-sdk-solidity provides the methods to interact with the Pyth contract.
        // Instantiate it with the Pyth contract address from https://docs.pyth.network/price-feeds/contract-addresses/evm
        pyth = IPyth(_pythOracle);
    }

    // Modifier for enforcing price floor before transactions.
    modifier enforcePriceFloor(uint256 khacnAmount) {
        require(
            isAbovePriceFloor(khacnAmount),
            "Transaction below price floor"
        );
        _;
    }

    /**
     * @dev Checks if the transaction is above the price floor.
     * @param stableCoinAmount Amount of KHACN tokens.
     */
    function isAbovePriceFloor(uint256 stableCoinAmount)
        public
        view
        returns (bool)
    {
        PythStructs.Price memory price = pyth.getPriceNoOlderThan(
            usdtUsdPriceFeedId,
            30
        );
        require(price.price > 0, "Invalid price data"); // Ensure positive price
        // Scale price with its exponent (e.g., price.price * 10^price.expo)
        uint256 scaledPrice = uint256(uint64(price.price)) * (10 ** uint256(int256(-price.expo)));
        uint256 stableCoinValue = (scaledPrice * stableCoinAmount) / SCALING_FACTOR;
        return stableCoinValue >= PRICE_FLOOR;
    }

    /**
     * @dev Allows the owner to pause the contract.
     */
    function pauseContract() external payable onlyOwner {
        _pause();
    }

    /**
     * @dev Allows the owner to unpause the contract.
     */
    function unpauseContract() external payable onlyOwner {
        _unpause();
    }

    /**
     * This method is an example of how to interact with the Pyth contract.
     * Fetch the priceUpdate from Hermes and pass it to the Pyth contract to update the prices.
     * Add the priceUpdate argument to any method on your contract that needs to read the Pyth price.
     * See https://docs.pyth.network/price-feeds/fetch-price-updates for more information on how to fetch the priceUpdate.
 
     * @param priceUpdate The encoded data to update the contract with the latest price
     */
    function getLatestPrice(bytes[] calldata priceUpdate)
        public
        payable
        returns (PythStructs.Price memory)
    {
        // Submit a priceUpdate to the Pyth contract to update the on-chain price.
        // Updating the price requires paying the fee returned by getUpdateFee.
        // WARNING: These lines are required to ensure the getPriceNoOlderThan call below succeeds. If you remove them, transactions may fail with "0x19abf40e" error.
        uint256 fee = pyth.getUpdateFee(priceUpdate);
        pyth.updatePriceFeeds{value: fee}(priceUpdate);

        // Read the current price from a price feed if it is less than 60 seconds old.
        // Each price feed (e.g., USDT/USD) is identified by a price feed ID.
        // The complete list of feed IDs is available at https://pyth.network/developers/price-feed-ids
        bytes32 priceFeedId = usdtUsdPriceFeedId; // USDT/USD
        PythStructs.Price memory price = pyth.getPriceNoOlderThan(
            priceFeedId,
            60
        );
        require(price.price > 0, "Invalid price data"); // Ensure positive price
        return price;
    }

    function mint(address to, uint256 amount) external onlyOwner nonReentrant {
        require(!blacklisted[to], "Address is blacklisted");
        require(!frozen[to], "Address is frozen");
        require(reserveBalance >= (totalSupply() + amount) * 1e18, "Insufficient reserves");

        _mint(to, amount);
        emit Mint(to, amount);
    }

    function burn(uint256 amount) external onlyOwner nonReentrant {
        _burn(_msgSender(), amount);
        emit Burn(_msgSender(), amount);
    }
    

    function setfreeze(address account,bool status) external onlyOwner {
        frozen[account] = status;
         emit Frozen(account, status);
    }
    
   

    function setBlacklist(address account, bool status) external onlyOwner {
        blacklisted[account] = status;
        emit Blacklisted(account, status);
    }
    

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function updateOracle(address _pythOracle) external onlyOwner {
        pythOracle = _pythOracle;
        emit OracleUpdated(_pythOracle);
    }

    function adjustSupply() external onlyOwner {
        PythStructs.Price memory price = pyth.getPriceNoOlderThan(
            usdtUsdPriceFeedId,
            60
        );
        require(price.price > 0, "Invalid price data"); // Ensure positive price
        uint256 currentPrice = uint256(uint64(price.price));
        unchecked {
            if (currentPrice > 1 * SCALING_FACTOR) {
                _mint(owner(), currentPrice - SCALING_FACTOR);
            } else if (currentPrice < 1 * SCALING_FACTOR) {
                _burn(owner(), SCALING_FACTOR - currentPrice);
            }
        }
    }

    

    // Function to update the initial supply (onlyOwner)
    function setInitialSupply(uint256 _newInitialSupply) external onlyOwner {
        require(_newInitialSupply >= maxSupply, "Initial supply cannot exceed max supply");
        _mint(owner(), _newInitialSupply - totalSupply());
    }
}