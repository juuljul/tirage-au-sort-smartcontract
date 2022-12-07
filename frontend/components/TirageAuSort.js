import { contractAddresses, abi } from "../constants"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"

export default function TirageAuSort() {
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const tirageSortAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    const [entranceFee, setEntranceFee] = useState("0")

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: tirageSortAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    async function updateUIValues() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        setEntranceFee(entranceFeeFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues()
        }
    }, [isWeb3Enabled])


    return (
        <div>
            <h1>Tirage au sort</h1>
            {tirageSortAddress ? (
                <>
                    <div>Frais d'inscription: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
                </>
            ) : (
                <div>Se connecter </div>
            )}
        </div>
    )
}
