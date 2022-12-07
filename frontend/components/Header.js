import { ConnectButton } from "web3uikit"

export default function Header() {
    return (
        <nav className="px-5 py-4 border-stone-900 border-b flex flex-row">
            <h1 className="py-4 px-4 font-bold text-3xl"> Remportez des ethers !</h1>
            <div className="ml-auto py-3 px-3">
                <ConnectButton moralisAuth={false}/>
            </div>
        </nav>
    )
}