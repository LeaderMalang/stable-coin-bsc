Your README is clear and detailed, but here are some improvements and adjustments to ensure precision and alignment with your latest updates:

---

### **Updated README**

# **USD-Pegged Stable Coin Project**

Welcome to the official repository of the **USD-pegged stable coin**, a secure, scalable, and transparent digital asset built on the **Binance Smart Chain (BSC)** and backed 1:1 by USD reserves. This project offers reliability for decentralized finance (DeFi) and centralized exchange (CEX) platforms.

---

## **Project Overview**

This stable coin ensures price stability and trustworthiness with real-time oracle integrations and robust admin controls. Initially, operations like minting and burning are manual, with automation planned in future updates.

### **Key Features**
- **Pyth Oracle Integration:** Real-time price feeds for accurate USD peg maintenance.
- **Admin-Controlled Minting & Burning:** Precise supply management to match USD reserves.
- **Blacklisting & Freezing Accounts:** Enhanced security for fraud prevention.
- **Centralized Management:** Manual operations, with future CEX and API integrations.
- **Dynamic Supply Adjustments:** Based on real-time price updates to maintain peg accuracy.

---

## **Smart Contract Features**

### **1. Minting and Burning (Admin-Only)**
- Admin-only functionality to mint tokens backed by USD reserves.
- Tokens can be burned upon USD redemption.
- Ensures reserves match the circulating supply.

### **2. Security Measures**
- **Blacklist Accounts:** Prevent transactions from flagged addresses.
- **Freeze Accounts:** Temporarily restrict activities of flagged accounts.
- **Pause Contract:** Admin can pause all operations during emergencies.

### **3. Price Floor Enforcement**
- Prevents transactions below a minimum price threshold (1 USD equivalent).
- Powered by **Pyth Network Oracles** for real-time price validation.

### **4. Oracle Integration**
- Real-time USD price feed using **Pyth Network**.
- Plans for future integration with CEXs and API-based reserve tracking.

---

## **Deployment Steps**

### **Prerequisites**
1. Install [Node.js](https://nodejs.org/) and npm.
2. Install Hardhat globally: `npm install --global hardhat`.
3. Set up a Binance Smart Chain wallet and obtain testnet/mainnet credentials.

### **Installation**
Clone the repository and install dependencies:
```bash
npm install
```

### **Compilation**
Compile the contract using Hardhat:
```bash
npx hardhat compile
```

### **Deployment**
Deploy the contract to BSC:
```bash
npx hardhat ignition deploy ignition/modules/StableCoin.js --network bsc_mainnet --parameters ignition/p
arameters.json --verify
```

---

## **Testing the Contract**

### **Testing Framework**
- **Deployment Tests:** Ensure correct owner assignment and initial supply allocation.
- **Transaction Tests:** Verify transfers, events, and blacklist functionality.
- **Minting/Burning Tests:** Validate token supply management.
- **Oracle Tests:** Mock and validate dynamic price updates.

### **Run Tests**
Run the test suite:
```bash
npx hardhat test
```

### **Environment Variables**
Set up a `.env` file with the following values:
```plaintext
PYTH_ORACLE=0xYourOracleAddress
PRICE_FEED_ID=0xYourPriceFeedId
PRIVATE_KEY=YourPrivateKey
API_KEY=YourBSCScanAPIKey
```

---

## **Contract Usage**

### **Mint Tokens**
```solidity
stableCoin.mint("0xRecipientAddress", ethers.utils.parseUnits("1000", 18));
```

### **Burn Tokens**
```solidity
stableCoin.burn(ethers.utils.parseUnits("500", 18));
```

### **Blacklist an Address**
```solidity
stableCoin.setBlacklist("0xMaliciousAddress", true);
```

### **Update Oracle Price**
```solidity
stableCoin.getLatestPrice(priceUpdateData);
```

### **Pause/Unpause Contract**
```solidity
stableCoin.pauseContract();
stableCoin.unpauseContract();
```

---

## **Future Plans**
- **Automated Reserve Tracking:** Integration with custodians and financial APIs for automated supply adjustments.
- **CEX Integration:** Support for minting and burning based on fiat deposits and withdrawals.
- **Cross-Chain Support:** Deployment on additional blockchains like Polygon, Arbitrum, and Base.
- **Audits:** Regular smart contract audits to ensure compliance and security.

---


## **Contributors**
- **[Hassan Ali](mailto:hassanali5120@gmail.com)** – Development Lead

---

## **License**
This project is licensed under the [MIT License](LICENSE).

---

## **Get Involved**

Follow our progress or contribute to the project:
- 🌐 [Website](https://aasanhai.pk)
- 📧 [Contact Us](mailto:hassanali5120@gmail.com)


---

We appreciate your interest in building a stable and accessible digital economy!
**#StableCoin #Crypto #Blockchain #DeFi #BinanceSmartChain #Web3 #Tokenization**

