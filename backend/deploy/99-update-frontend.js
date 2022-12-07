const { frontEndContractsFile, frontEndAbiFile } = require("../helper-hardhat-config")
const fs = require("fs")
const { network } = require("hardhat")

module.exports = async () => {
    await updateContractAddresses()
    await updateAbi()
}

async function updateAbi() {
    const tirageSort = await ethers.getContract("TirageSort")
    fs.writeFileSync(frontEndAbiFile, tirageSort.interface.format(ethers.utils.FormatTypes.json))
}

async function updateContractAddresses() {
    const tirageSort = await ethers.getContract("TirageSort")
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
    if (network.config.chainId.toString() in contractAddresses) {
        if (!contractAddresses[network.config.chainId.toString()].includes(tirageSort.address)) {
            contractAddresses[network.config.chainId.toString()].push(tirageSort.address)
        }
    } else {
        contractAddresses[network.config.chainId.toString()] = [tirageSort.address]
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}
module.exports.tags = ["all", "frontend"]
