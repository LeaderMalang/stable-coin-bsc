# **USD-Pegged Stable Coin Project**  

Welcome to the official repository for our **USD-pegged stable coin**, a secure and transparent digital asset built on the **Binance Smart Chain (BSC)** and backed 1:1 by USD reserves. This project aims to provide a reliable and scalable solution for decentralized finance (DeFi) and centralized exchanges (CEXs).  

---

## **Project Overview**  

Our stable coin is designed to ensure price stability and trustworthiness through manual operations initially, with a roadmap for future automation. It includes features such as:  

- **Pyth Oracle Integration:** Real-time price feeds to maintain USD peg accuracy.  
- **Manual Minting & Burning:** Controlled via admin functions for precise supply adjustments.  
- **Blacklisting & Freezing:** Enhanced security measures to prevent misuse.  
- **Centralized Management:** Efficient admin control with future integration possibilities.  

---

## **Smart Contract Features**  

### **1. Minting and Burning (Admin-Only Control)**  
- Minting new tokens is restricted to the admin to ensure a controlled supply.  
- Tokens can be burned when users redeem USD.  
- Both actions are manually managed initially for maximum oversight.  

### **2. Blacklisting and Freezing**  
- The admin can blacklist suspicious accounts to prevent transactions.  
- Contract pause/unpause functionality for emergency scenarios.  

### **3. Price Floor Enforcement**  
- Transactions below a specific price threshold are restricted.  
- Ensures peg stability with real-time oracle updates.  

### **4. Oracle Integration**  
- Uses **Pyth Network** oracles for accurate USD pricing.  
- Supports future upgrades to automate operations with CEX or financial institutions.  

---

## **Deployment Steps**  

Follow these steps to deploy the smart contract on Binance Smart Chain (BSC):  

### **Prerequisites**  
- Node.js and npm installed  
- Hardhat for contract compilation and deployment  
- Binance Smart Chain (BSC) wallet setup  

### **Installation**  
```bash
npm install
```

### **Compilation**  
```bash
npx hardhat compile
```

### **Deployment**  
```bash
   npx hardhat ignition deploy ignition/modules/StableCoin.js --network bsc_mainnet --parameters ignition/parameters.json --verify
   ```

---

## **Testing the Contract**  

The project includes a test suite to validate the functionality of the stable coin smart contract. Tests include:

- Deployment verification (owner assignment, initial supply allocation)
- Transactions (transfers, events, blacklisting)
- Minting and burning functionality
- Oracle price updates
- Contract pausing/unpausing

### **Run Tests:**  
```bash
npx hardhat test
```

Ensure the following environment variables are set in the `.env` file:

```plaintext
PYTH_ORACLE=0xYourOracleAddressHere
PRICE_FEED_ID=0xYourPriceFeedIdHere
PRIVATE_KEY=0xYourPrivateKey
API_KEY=YourBSCAPIKEY
```

---

## **Contract Usage**  

### **Mint Tokens**  
```solidity
stableCoin.mint("0xRecipientAddress", 1000 * 10**18);
```

### **Burn Tokens**  
```solidity
stableCoin.burn(500 * 10**18);
```

### **Blacklist Address**  
```solidity
stableCoin.setBlacklist("0xMaliciousAddress", true);
```

### **Update Oracle Data**  
```solidity
stableCoin.getLatestPrice(priceUpdateData);
```

---

## **Future Plans**  
- **CEX Integration:** Automating minting and burning based on FIAT deposits/withdrawals.  
- **Cross-Chain Deployment:** Expansion to Polygon, Arbitrum, and Base.  
- **Audit and Compliance:** Ensuring full transparency and regulatory alignment.  

---

## **Contributors**  
- **Hassan Ali/aasanhai.pk** – Development Lead  

---

## **License**  
This project is licensed under the [MIT License](LICENSE).  

---

## **Get Involved**  
Follow our progress and contribute to the project:  

- 🌐 [Website](https://aasanhai.pk)   
- 📩 Contact us: [hassanali5120@gmail.com](mailto:email@example.com)  

---

We appreciate your interest and contributions in building a more stable and accessible digital economy!  

---


