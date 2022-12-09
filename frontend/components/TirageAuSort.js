import { contractAddresses, abi } from "../constants"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { useNotification } from "web3uikit"
import { ethers } from "ethers"

export default function TirageAuSort() {
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const tirageSortAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    const [entranceFee, setEntranceFee] = useState("0")
    const [numberOfPlayers, setNumberOfPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()

    const {
        runContractFunction: enterTirageSort,
        data: enterTxResponse,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: tirageSortAddress,
        functionName: "enterTirageSort",
        msgValue: entranceFee,
        params: {},
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: tirageSortAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: tirageSortAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: tirageSortAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUIValues() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const numPlayersFromCall = (await getNumberOfPlayers()).toString()
        const recentWinnerFromCall = await getRecentWinner()
        setEntranceFee(entranceFeeFromCall)
        setNumberOfPlayers(numPlayersFromCall)
        setRecentWinner(recentWinnerFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues()
        }
    }, [isWeb3Enabled])


    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction effectuée",
            title: "Notification de transaction",
            position: "topR",
        })
    }

    const handleSuccess = async (tx) => {
        try {
            await tx.wait(1)
            updateUIValues()
            handleNewNotification(tx)
        } catch (error) {
            console.log(error)
        }
    }


    return (
        <div className="p-5">
            <h1 className="py-4 px-4 text-center text-2xl text-blue-500 my-6">Participation au tirage au sort ouverte</h1>
            {tirageSortAddress ? (
                <>
                    <div className="flex justify-center ">              
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white text-3xl py-2 px-4 rounded mb-10"
                            onClick={async () =>
                                await enterTirageSort({
                                    onSuccess: handleSuccess,
                                    onError: (error) => console.log(error),
                                })
                            }
                            disabled={isLoading || isFetching}
                        >
                            {isLoading || isFetching ? (
                                <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                            ) : (
                                "Participer"
                            )}
                        </button>
                    </div>  
                    <div className="text-center font-bold">Frais d'inscription: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
                    <div className="text-center font-bold mb-10">Nombre actuel de participants: {numberOfPlayers}</div>
                    <div className="text-center">Adresse du gagnant le plus récent: {recentWinner}</div>
                </>
            ) : (
                <div>Se connecter </div>
            )}
        </div>
    )
}
