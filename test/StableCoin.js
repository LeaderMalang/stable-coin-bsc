require('dotenv').config();
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { StableCoinModule } = require("../ignition/modules/StableCoin");

describe("StableCoin contract", function () {
    async function deployStableCoinFixture() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const pythOracle = process.env.PYTH_ORACLE;
        const priceFeedId = process.env.PRICE_FEED_ID;
        const tokenName = "StableUSD";
        const tokenSymbol = "SUSD";
        const initialSupply = ethers.parseUnits("1000000", 18);
        const maxSupply = ethers.parseUnits("100000000", 18);

        if (!pythOracle || !priceFeedId) {
            throw new Error("Missing environment variables: PYTH_ORACLE or PRICE_FEED_ID");
        }

        const StableCoin = await ethers.deployContract("StableCoin", [
            tokenName, 
            tokenSymbol, 
            initialSupply, 
            maxSupply, 
            priceFeedId, 
            pythOracle
        ]);

        console.log("StableCoin Contract Deployed");

        return { StableCoin, owner, addr1, addr2 };
    }

    describe("StableCoin Deployment", function () {
        it("Should set the correct owner", async function () {
            const { StableCoin, owner } = await loadFixture(deployStableCoinFixture);
            expect(await StableCoin.owner()).to.equal(owner.address);
        });

        it("Should assign the total supply of tokens to the owner", async function () {
            const { StableCoin, owner } = await loadFixture(deployStableCoinFixture);
            const ownerBalance = await StableCoin.balanceOf(owner.address);
            expect(await StableCoin.totalSupply()).to.equal(ownerBalance);
        });
    });

    describe("StableCoin Transactions", function () {
        it("Should transfer StableCoin between two addresses", async function () {
            const { StableCoin, owner, addr1 } = await loadFixture(deployStableCoinFixture);
            const amount = ethers.parseUnits("50", 18);

            await expect(
                StableCoin.transfer(addr1.address, amount)
            ).to.changeTokenBalances(StableCoin, [owner, addr1], [-amount, amount]);
        });

        it("Should emit Transfer events", async function () {
            const { StableCoin, owner, addr1, addr2 } = await loadFixture(deployStableCoinFixture);

            await expect(StableCoin.transfer(addr1.address, 50))
                .to.emit(StableCoin, "Transfer")
                .withArgs(owner.address, addr1.address, 50);

            await expect(StableCoin.connect(addr1).transfer(addr2.address, 50))
                .to.emit(StableCoin, "Transfer")
                .withArgs(addr1.address, addr2.address, 50);
        });
    });

    describe("StableCoin Specific Features", function () {
        it("Should allow the owner to mint new tokens", async function () {
            const { StableCoin, owner } = await loadFixture(deployStableCoinFixture);
            const currentSupply = await StableCoin.totalSupply();
            const mintAmount = ethers.parseUnits("1000000", 18);

            await StableCoin.mint(owner.address, mintAmount);

            const newBalance = await StableCoin.balanceOf(owner.address);
            expect(newBalance).to.equal(currentSupply + mintAmount);
        });

        it("Should not allow non-owner to mint tokens", async function () {
            const { StableCoin, addr1 } = await loadFixture(deployStableCoinFixture);
            const mintAmount = ethers.parseUnits("100", 18);

            await expect(
                StableCoin.connect(addr1).mint(addr1.address, mintAmount)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should allow the owner to blacklist an address", async function () {
            const { StableCoin, owner, addr1 } = await loadFixture(deployStableCoinFixture);

            await StableCoin.setBlacklist(addr1.address, true);
            expect(await StableCoin.blacklisted(addr1.address)).to.be.true;
        });

        it("Should prevent blacklisted address from receiving tokens", async function () {
            const { StableCoin, owner, addr1 } = await loadFixture(deployStableCoinFixture);

            await StableCoin.setBlacklist(addr1.address, true);

            await expect(
                StableCoin.transfer(addr1.address, ethers.parseUnits("50", 18))
            ).to.be.revertedWith("Address is blacklisted");
        });

        it("Should update the Pyth Oracle successfully", async function () {
            const { StableCoin, owner } = await loadFixture(deployStableCoinFixture);
            const newOracleAddress = "0x0000000000000000000000000000000000000001";

            await StableCoin.updateOracle(newOracleAddress);
            expect(await StableCoin.pythOracle()).to.equal(newOracleAddress);
        });

        it("Should pause and unpause the contract", async function () {
            const { StableCoin, owner } = await loadFixture(deployStableCoinFixture);

            await StableCoin.pauseContract();
            expect(await StableCoin.paused()).to.be.true;

            await StableCoin.unpauseContract();
            expect(await StableCoin.paused()).to.be.false;
        });

        it("Should enforce price floor on transactions", async function () {
            const { StableCoin, addr1 } = await loadFixture(deployStableCoinFixture);

            const lowValueTransfer = ethers.parseUnits("1", 18);

            await expect(
                StableCoin.transfer(addr1.address, lowValueTransfer)
            ).to.be.revertedWith("Transaction below price floor");
        });
        it("Should prevent minting if reserves are insufficient", async function () {
            const { StableCoin, owner } = await loadFixture(deployStableCoinFixture);
            const mintAmount = ethers.parseUnits("2000000", 18); // Exceeding reserveBalance
        
            await expect(
                StableCoin.mint(owner.address, mintAmount)
            ).to.be.revertedWith("Insufficient reserves");
        });
        it("Should prevent frozen accounts from receiving tokens", async function () {
            const { StableCoin, owner, addr1 } = await loadFixture(deployStableCoinFixture);
        
            await StableCoin.setfreeze(addr1.address, true);
        
            await expect(
                StableCoin.transfer(addr1.address, ethers.parseUnits("50", 18))
            ).to.be.revertedWith("Address is frozen");
        });
        it("Should mock Pyth oracle responses and validate price data", async function () {
            const { StableCoin, owner } = await loadFixture(deployStableCoinFixture);
        
            // Mock the oracle's price data
            const mockPrice = {
                price: ethers.BigNumber.from("1500000"), // Mock price: $1.50
                expo: -6, // Price exponent (-6 for 6 decimals)
            };
        
            // Mock the getPriceNoOlderThan function
            const mockPyth = await ethers.getContractAt("IPyth", await StableCoin.pythOracle());
            const getPriceMock = sinon.stub(mockPyth, "getPriceNoOlderThan").returns(mockPrice);
        
            // Fetch the price from the oracle
            const price = await StableCoin.getLatestPrice([]);
            expect(price.price).to.equal(mockPrice.price);
            expect(price.expo).to.equal(mockPrice.expo);
        
            // Restore the mock
            getPriceMock.restore();
        });
        
        it("Should mint tokens when the price is above 1 USD", async function () {
            const { StableCoin, owner } = await loadFixture(deployStableCoinFixture);
        
            // Mock the price to $1.50
            const mockPrice = {
                price: ethers.BigNumber.from("1500000"), // $1.50 in 1e6 format
                expo: -6, // Price exponent
            };
            sinon.stub(StableCoin, "getLatestPrice").returns(mockPrice);
        
            // Check initial supply
            const initialSupply = await StableCoin.totalSupply();
        
            // Call adjustSupply to mint
            await StableCoin.adjustSupply();
            const newSupply = await StableCoin.totalSupply();
        
            // Verify that supply increased
            expect(newSupply).to.be.gt(initialSupply);
        });
        it("Should burn tokens when the price is below 1 USD", async function () {
            const { StableCoin, owner } = await loadFixture(deployStableCoinFixture);
        
            // Mock the price to $0.50
            const mockPrice = {
                price: ethers.BigNumber.from("500000"), // $0.50 in 1e6 format
                expo: -6, // Price exponent
            };
            sinon.stub(StableCoin, "getLatestPrice").returns(mockPrice);
        
            // Check initial supply
            const initialSupply = await StableCoin.totalSupply();
        
            // Call adjustSupply to burn
            await StableCoin.adjustSupply();
            const newSupply = await StableCoin.totalSupply();
        
            // Verify that supply decreased
            expect(newSupply).to.be.lt(initialSupply);
        });
        it("Should not mint or burn tokens when the price is exactly 1 USD", async function () {
            const { StableCoin, owner } = await loadFixture(deployStableCoinFixture);
        
            // Mock the price to exactly $1.00
            const mockPrice = {
                price: ethers.BigNumber.from("1000000"), // $1.00 in 1e6 format
                expo: -6, // Price exponent
            };
            sinon.stub(StableCoin, "getLatestPrice").returns(mockPrice);
        
            // Check initial supply
            const initialSupply = await StableCoin.totalSupply();
        
            // Call adjustSupply
            await StableCoin.adjustSupply();
            const newSupply = await StableCoin.totalSupply();
        
            // Verify that supply remains unchanged
            expect(newSupply).to.equal(initialSupply);
        });
        
        it("Should not mint or burn tokens for small price deviations", async function () {
            const { StableCoin, owner } = await loadFixture(deployStableCoinFixture);
        
            // Mock the price to $1.01 (small deviation)
            const mockPrice = {
                price: ethers.BigNumber.from("1010000"), // $1.01 in 1e6 format
                expo: -6, // Price exponent
            };
            sinon.stub(StableCoin, "getLatestPrice").returns(mockPrice);
        
            // Check initial supply
            const initialSupply = await StableCoin.totalSupply();
        
            // Call adjustSupply
            await StableCoin.adjustSupply();
            const newSupply = await StableCoin.totalSupply();
        
            // Verify that supply remains unchanged for small deviations
            expect(newSupply).to.equal(initialSupply);
        });
        
        it("Should validate price floor enforcement with mocked oracle prices", async function () {
            const { StableCoin, owner, addr1 } = await loadFixture(deployStableCoinFixture);
        
            // Mock the price to exactly $1.00
            const mockPrice = {
                price: ethers.BigNumber.from("1000000"), // $1.00 in 1e6 format
                expo: -6, // Price exponent
            };
            sinon.stub(StableCoin, "getLatestPrice").returns(mockPrice);
        
        
            // Simulate a transfer with a price above the price floor
            const transferAmount = ethers.parseUnits("1", 18); // 1 StableCoin
            await expect(StableCoin.transfer(addr1.address, transferAmount))
                .to.emit(StableCoin, "Transfer")
                .withArgs(owner.address, addr1.address, transferAmount);
        
            // Simulate a transfer with a price below the price floor
            const lowPrice = ethers.BigNumber.from("500000"); // Mock price below floor (0.5 USD)
            await expect(
                StableCoin.transfer(addr1.address, transferAmount)
            ).to.be.revertedWith("Transaction below price floor");
        });

        it("Should adjust supply correctly based on oracle price", async function () {
            const { StableCoin, owner } = await loadFixture(deployStableCoinFixture);
        
            // Mock the Pyth oracle response with a price above 1 USD
            const highPrice = ethers.BigNumber.from("1500000"); // Mock price: $1.50
            const priceUpdateData = "0x"; // Mock price update data
            await StableCoin.getLatestPrice([priceUpdateData]);
        
            // Call adjustSupply to mint tokens
            const initialSupply = await StableCoin.totalSupply();
            await StableCoin.adjustSupply();
            const newSupply = await StableCoin.totalSupply();
            expect(newSupply).to.be.gt(initialSupply); // Ensure minting occurred
        
            // Mock the Pyth oracle response with a price below 1 USD
            const lowPrice = ethers.BigNumber.from("500000"); // Mock price: $0.50
            await StableCoin.getLatestPrice([priceUpdateData]);
        
            // Call adjustSupply to burn tokens
            const supplyBeforeBurn = await StableCoin.totalSupply();
            await StableCoin.adjustSupply();
            const supplyAfterBurn = await StableCoin.totalSupply();
            expect(supplyAfterBurn).to.be.lt(supplyBeforeBurn); // Ensure burning occurred
        });
        

    });

});
