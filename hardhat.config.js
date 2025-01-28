require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const API_KEY = process.env.API_KEY;
module.exports = {
  solidity: {
   
        version: "0.8.22",
        settings: {
          evmVersion: "istanbul",
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      
  },

  networks: {
    hardhat: {
      gas: "auto", // Automatically estimate gas
      gasPrice: "auto", // Automatically estimate gas price
    },
    bsc_mainnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: [PRIVATE_KEY],
      gas: "auto",
      //gasPrice: 25000000000, // 25 gwei (adjust based on Eth's current gas price)
      allowUnlimitedContractSize: true,
    },
    // localhost: {
    //   url: `http://127.0.0.1:8545`,
    //   accounts: [`0x${PRIVATE_KEY}`]
    // }
  },
  etherscan: {
    apiKey: API_KEY
  }
};