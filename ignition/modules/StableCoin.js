const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const StableCoinModule = buildModule("StableCoin", (m) => {



   // Parameters required for contract deployment
  //  const tokenName = m.getParameter("tokenName", "SUSD");
  //  const tokenSymbol = m.getParameter("tokenSymbol", "SUSD");
  //  const initialSupply = m.getParameter("initialSupply", ethers.parseUnits("1000000", 18)); // 1M tokens
  //  const maxSupply = m.getParameter("maxSupply", ethers.parseUnits("100000000", 18)); // 100M tokens
   const priceFeedId = m.getParameter(
     "priceFeedId",
     "0xEca2605f0BCF2BA5966372C99837b1F182d3D620" // Default USDT/USD Price Feed
   );
   const usdt_address = m.getParameter(
     "usdt_address",
     "0xaB1a4d4f1D656d2450692D237fdD6C7f9146e814" // Placeholder oracle address
   );
   const router_address = m.getParameter(
    "router_address",
    "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3" // Placeholder oracle address
  );
 
   // Deploying the StableCoin contract
   const StableCoin = m.contract(
     "StableCoin",
     [router_address, priceFeedId, usdt_address],
     { id: "StableCoin" }
   );
 
   return { StableCoin };
});

module.exports = StableCoinModule;