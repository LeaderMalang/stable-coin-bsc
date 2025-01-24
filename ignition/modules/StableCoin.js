const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const StableCoinModule = buildModule("StableCoin", (m) => {



   // Parameters required for contract deployment
   const tokenName = m.getParameter("tokenName", "StableUSD");
   const tokenSymbol = m.getParameter("tokenSymbol", "SUSD");
   const initialSupply = m.getParameter("initialSupply", ethers.parseUnits("1000000", 18)); // 1M tokens
   const maxSupply = m.getParameter("maxSupply", ethers.parseUnits("100000000", 18)); // 100M tokens
   const priceFeedId = m.getParameter(
     "priceFeedId",
     "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace" // Default ETH/USD Price Feed
   );
   const pythOracle = m.getParameter(
     "pythOracle",
     "0x0000000000000000000000000000000000000000" // Placeholder oracle address
   );
 
   // Deploying the StableCoin contract
   const StableCoin = m.contract(
     "StableCoin",
     [tokenName, tokenSymbol, initialSupply, maxSupply, priceFeedId, pythOracle],
     { id: "StableCoin" }
   );
 
   return { StableCoin };
});

module.exports = StableCoinModule;