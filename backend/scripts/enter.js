const { ethers } = require("hardhat")

async function enterTirageSort() {
    const tirageSort = await ethers.getContract("TirageSort")
    const entranceFee = await tirageSort.getEntranceFee()
    await tirageSort.enterTirageSort({ value: entranceFee + 1 })
    console.log("Participation au tirage au sort")
}

enterTirageSort()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
