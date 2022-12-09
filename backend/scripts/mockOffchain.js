const { ethers, network } = require("hardhat")

async function mockKeepers() {
    const tirageSort = await ethers.getContract("TirageSort")
    const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""))
    const { upkeepNeeded } = await tirageSort.callStatic.checkUpkeep(checkData)
    if (upkeepNeeded) {
        const tx = await tirageSort.performUpkeep(checkData)
        const txReceipt = await tx.wait(1)
        const requestId = txReceipt.events[1].args.requestId
        console.log(`requestId: ${requestId}`)
        if (network.config.chainId == 31337) {
            await mockVrf(requestId, tirageSort)
        }
    } else {
        console.log("Pas d'upkeepNeeded")
    }
}

async function mockVrf(requestId, tirageSort) {
    console.log("Utilisation de mock pour réseau local...")
    const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
    await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, tirageSort.address)
    const recentWinner = await tirageSort.getRecentWinner()
    console.log(`Le gagnant est: ${recentWinner}`)
}

mockKeepers()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
