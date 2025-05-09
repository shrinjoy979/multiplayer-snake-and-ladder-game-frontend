import { useEffect, useState } from "react";
import { Dice5, Trophy } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useParams } from 'react-router-dom';
import { socket } from './socket';
import axios from "axios";
import "./css/Board.css";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

import { Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import bs58 from 'bs58';

const boardRowSize = 10;
const cellSize = 50;

const snakes: { [key: number]: number } = { 98: 78, 95: 56, 93: 73, 87: 36, 64: 60, 49: 11, 26: 10 };
const ladders: { [key: number]: number } = { 2: 38, 7: 14, 8: 31, 21: 42, 28: 84, 51: 67, 71: 91 };

const getPosition = (num: number) => {
  const row = Math.floor((num - 1) / boardRowSize);
  const col = row % 2 === 0 ? (num - 1) % boardRowSize : boardRowSize - 1 - ((num - 1) % boardRowSize);
  return {
    x: col * cellSize + cellSize / 2,
    y: (boardRowSize - 1 - row) * cellSize + cellSize / 2,
  };
};

function Game() {
  const { user } = useUser();
  const [players, setPlayers] = useState<string[]>([]);
  const [playerPosition, setPlayerPosition] = useState<{ [key: string]: number }>({});
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [winner, setWinner] = useState<string | null>(null);
  const { gameId, playerId, type } = useParams();

  const { connection } = useConnection();
  const wallet = useWallet();
  const serverURL = import.meta.env.VITE_ENVIRONMENT === 'LOCAL' ? import.meta.env.VITE_LOCAL_SERVER_URL : import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    socket.on("startGame", ({ players }: { players: string[] }) => {
      setPlayers(players);
      setPlayerPosition({
        [players[0]]: 0,
        [players[1]]: 0,
      });
    });

    socket.on("updateGame", ({ positions, diceRoll, currentTurn }: { positions: { [key: string]: number }, diceRoll: number, currentTurn: number }) => {
      setPlayerPosition(positions);
      setDiceValue(diceRoll);
      setCurrentTurn(currentTurn);
    });

    socket.on("gameOver", async ({ winner, userId }: { winner: string, userId: string }) => {
      setWinner(winner);

      await axios.get(`${serverURL}/api/get-winner-details`, {
        params: {
          gameId: gameId,
          userId: userId
        }
      }).then((response) => {

        if(userId === user?.id) {
          sendSolToWinner(response.data.winner_public_key, response.data.wining_amount, userId);
        } else {
          updateDataForLossUser(userId, response.data.bet_amount);
        }

      }).catch((error) => {
        console.log('error in getting winner details', error);
      });
    });

    return () => {
      socket.off("gameCreated");
      socket.off("startGame");
      socket.off("updateGame");
      socket.off("gameOver");
    };
  }, []);

  useEffect(() => {
    if(players.length === 0 && type === 'join') {
      socket.emit("playerReady", gameId);
    }
  }, [gameId]);
  
  const rollDice = () => {
    if (gameId && players[currentTurn] === playerId && !winner) {
      socket.emit("rollDice", { gameId, player: playerId, username: user?.fullName, userId: user?.id });
    }
  };

  const renderBoard = () => {
    let boardCells = [];
    let toggle = true;

    for (let row = boardRowSize; row > 0; row--) {
      let rowCells = [];

      for (let col = 0; col < boardRowSize; col++) {
        let num = toggle ? row * boardRowSize - col : (row - 1) * boardRowSize + col + 1;
        rowCells.push(
          <div key={num} className={`cell ${snakes[num] ? "snake" : ""} ${ladders[num] ? "ladder" : ""}`}>
            {num}
            {Object.keys(playerPosition).map((player, index) =>
              playerPosition[player] === num ? (
                <div key={player} className={`player player-${index}`}>
                  {index === 0 ? "🔴" : "🟢"}
                </div>
              ) : null
            )}
          </div>
        );
      }

      toggle = !toggle;

      boardCells.push(
        <div key={row} className="row">
          {rowCells}
        </div>
      );
    }
    return boardCells;
  };

  async function sendSolToWinner(winner_public_key: string, amount: any, userId: string) {
    const organizationBase58PrivateKey = import.meta.env.VITE_BASE58_PRIVATE_KEY;
    const senderKeypair = Keypair.fromSecretKey(bs58.decode(organizationBase58PrivateKey));
  
    const winnerPublicKey = new PublicKey(winner_public_key);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: senderKeypair.publicKey,
        toPubkey: winnerPublicKey,
        lamports: amount,
      })
    );
  
    try {
      const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeypair]);

      if(signature) {
        console.log('Transaction successful. Explorer:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);

        await axios.post(`${serverURL}/api/save-payment-details`, {
          userId,
          winner_public_key,
          amount,
          status: "Win",
          payment_signature: signature,
          game_code: gameId
        }).then((response) => {
          console.log('Payment details saved successfully', response);
        }).catch((error) => {
          console.log('error in getting winner details', error);
        });
      }
    } catch (error) {
      console.error('Failed to send SOL:', error);
    }
  }

  async function updateDataForLossUser(userId: string, amount: any) {
    await axios.post(`${serverURL}/api/save-payment-details`, {
      userId,
      amount,
      status: "Loss",
      game_code: gameId
    }).then((response) => {
      console.log('Payment details saved successfully', response);
    }).catch((error) => {
      console.log('error in saving payment details', error);
    });
  }

  return (
    <>
      {gameId &&
        <div className="game-container">
          <div className="game-board-wrapper">
            <div style={{ position: 'relative', width: boardRowSize * cellSize, height: boardRowSize * cellSize }}>
              <div className="board">
                {renderBoard()}
              </div>
              <svg width={boardRowSize * cellSize} height={boardRowSize * cellSize} style={{ position: 'absolute', top: 0, left: 0 }} className="game-paths">
                {Object.entries(snakes).map(([start, end]) => {
                  let startPos = getPosition(parseInt(start));
                  let endPos = getPosition(end);
                  return <g key={start}>
                    <line 
                      x1={startPos.x} 
                      y1={startPos.y} 
                      x2={endPos.x} 
                      y2={endPos.y} 
                      className="snake-path"
                    />
                    <circle cx={startPos.x} cy={startPos.y} r="4" className="snake-head" />
                    <circle cx={endPos.x} cy={endPos.y} r="4" className="snake-tail" />
                  </g>;
                })}
                {Object.entries(ladders).map(([start, end]) => {
                  let startPos = getPosition(parseInt(start));
                  let endPos = getPosition(end);
                  return <g key={start}>
                    <line 
                      x1={startPos.x} 
                      y1={startPos.y} 
                      x2={endPos.x} 
                      y2={endPos.y} 
                      className="ladder-path"
                    />
                    <circle cx={startPos.x} cy={startPos.y} r="4" className="ladder-start" />
                    <circle cx={endPos.x} cy={endPos.y} r="4" className="ladder-end" />
                  </g>;
                })}
              </svg>
            </div>

            <div className="game-info">
              <div className="game-code">
                <span className="label">Game Code:</span>
                <span className="value">{gameId}</span>
              </div>

              {winner ? (
                <>
                  {diceValue !== null && (
                    <div className="dice-value">
                      <span className="label">Dice Roll:</span>
                      <span className="value">{diceValue}</span>
                    </div>
                  )}

                  <div className="winner-announcement">
                    <Trophy className="trophy-icon" size={32} />
                    <span>Player {winner} Wins!</span>
                  </div>
                </>
              ) : (
                <div className="game-controls">
                  <button
                    className={`roll-button ${players[currentTurn] !== playerId ? 'disabled' : ''}`}
                    onClick={rollDice}
                    disabled={players[currentTurn] !== playerId}
                  >
                    <Dice5 size={24} />
                    <span>Roll Dice</span>
                  </button>

                  {diceValue !== null && (
                    <div className="dice-value">
                      <span className="label">Dice Roll:</span>
                      <span className="value">{diceValue}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      }
    </>
  );
}

export default Game;
