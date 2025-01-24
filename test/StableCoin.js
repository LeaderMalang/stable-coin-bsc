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

    });

});
