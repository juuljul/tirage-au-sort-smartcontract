// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";
import "hardhat/console.sol";

error TirageSort__UpkeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 tirageState);
error TirageSort__TransferFailed();
error TirageSort__SendMoreToEnterTirageSort();
error TirageSort__TirageSortNotOpen();


contract TirageSort is VRFConsumerBaseV2, AutomationCompatibleInterface {
    
    enum GameState {
        OPEN,
        CALCULATING
    }

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    uint256 private immutable i_interval;
    uint256 private immutable i_entranceFee;
    uint256 private lastTimeGame;
    address private recentWinner;
    address payable[] private players;
    GameState private gameState;

    event RequestedTirageSortWinner(uint256 indexed requestId);
    event TirageSortEnter(address indexed player);
    event WinnerPicked(address indexed player);

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane, // keyHash
        uint256 interval,
        uint256 entranceFee,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_interval = interval;
        i_subscriptionId = subscriptionId;
        i_entranceFee = entranceFee;
        gameState = GameState.OPEN;
        lastTimeGame = block.timestamp;
        i_callbackGasLimit = callbackGasLimit;
    }

    function enterTirageSort() public payable {
        if (msg.value < i_entranceFee) {
            revert TirageSort__SendMoreToEnterTirageSort();
        }
        if (gameState != GameState.OPEN) {
            revert TirageSort__TirageSortNotOpen();
        }
        players.push(payable(msg.sender));
        emit TirageSortEnter(msg.sender);
    }

  
    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        bool isOpen = GameState.OPEN == gameState;
        bool timePassed = ((block.timestamp - lastTimeGame) > i_interval);
        bool hasPlayers = players.length > 0;
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers);
        return (upkeepNeeded, "0x0"); 
    }


    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert TirageSort__UpkeepNotNeeded(
                address(this).balance,
                players.length,
                uint256(gameState)
            );
        }
        gameState = GameState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestedTirageSortWinner(requestId);
    }


    function fulfillRandomWords(
        uint256, /* requestId */
        uint256[] memory randomWords
    ) internal override {
        uint256 winnerIndex = randomWords[0] % players.length;
        address payable winner = players[winnerIndex];
        recentWinner = winner;
        players = new address payable[](0);
        gameState = GameState.OPEN;
        lastTimeGame = block.timestamp;
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        if (!success) {
            revert TirageSort__TransferFailed();
        }
        emit WinnerPicked(recentWinner);
    }


    function getRecentWinner() public view returns (address) {
        return recentWinner;
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return players.length;
    }
}
