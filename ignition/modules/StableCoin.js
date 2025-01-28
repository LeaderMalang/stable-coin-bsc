const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const StableCoinModule = buildModule("StableCoin", (m) => {



   // Parameters required for contract deployment
   const tokenName = m.getParameter("tokenName", "SUSD");
   const tokenSymbol = m.getParameter("tokenSymbol", "SUSD");
   const initialSupply = m.getParameter("initialSupply", ethers.parseUnits("1000000", 18)); // 1M tokens
   const maxSupply = m.getParameter("maxSupply", ethers.parseUnits("100000000", 18)); // 100M tokens
   const priceFeedId = m.getParameter(
     "priceFeedId",
     "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b" // Default USDT/USD Price Feed
   );
   const pythOracle = m.getParameter(
     "pythOracle",
     "0x5744Cbf430D99456a0A8771208b674F27f8EF0Fb" // Placeholder oracle address
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