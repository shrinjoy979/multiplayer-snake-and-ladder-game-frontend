import { useEffect, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios";
import "./css/Account.css";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { toast } from "react-toastify";
import { useUser } from '@clerk/clerk-react';
import '@solana/wallet-adapter-react-ui/styles.css';

function Account() {
  const { user } = useUser();
  const [amount, setAmount] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const navigate = useNavigate();
  const wallet = useWallet();
  const { connection } = useConnection();
  const { gameId, playerId, type } = useParams();

  const serverURL = import.meta.env.VITE_ENVIRONMENT === 'LOCAL' ? import.meta.env.VITE_LOCAL_SERVER_URL : import.meta.env.VITE_SERVER_URL;
  const betAmounts = [0.1, 0.25, 0.5, 1, 2, 3, 4, 5];

  const handleBet = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    if (!wallet.publicKey) return;
    
    setIsSpinning(true);

    const snakeWinAccountPublicAddress = import.meta.env.VITE_SOLANA_PUBLIC_ADDRESS;

    const transaction = new Transaction();
    transaction.add(SystemProgram.transfer({
      fromPubkey: wallet.publicKey!,
      toPubkey: new PublicKey(snakeWinAccountPublicAddress),
      lamports: Number(amount) * LAMPORTS_PER_SOL,
    }));

    await wallet.sendTransaction(transaction, connection);

    toast.success(amount + " SOL deposited successfully");

    if(type === 'create') {
      axios
      .post(`${serverURL}/api/save-game-details`, {
        creator_id: user?.id,
        bet_amount: Number(amount) * LAMPORTS_PER_SOL,
        game_code: gameId,
        status: "waiting"
      })
      .then((response: any) => {
        console.log("Game data saved successfully:", response.data);
      })
      .catch((error: any) => {
        console.error("Error saving game data:", error.response?.data || error.message);
      });
    }
    navigate(`/game/${gameId}/${playerId}/${type}`);
  };

  useEffect(() => {
    if(type === 'join') {

      const fetchBetAmout = async () => {
        try {
          const response = await axios.get(`${serverURL}/api/get-bet-amount`, {
            params: {
              gameId: gameId
            },
          });
  
          setAmount(response.data.bet_amount);
        } catch (error) {
          console.error('Error fetching filtered games:', error);
        }
      };
  
      fetchBetAmout();
    }
  }, [type]);

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center py-4">
      <div className="betting-card p-4 p-md-5" style={{ maxWidth: '32rem' }}>
        <h1 className="text-center mb-4 fw-bold">Double or Nothing</h1>
        
        <div className="d-flex flex-column gap-4">
          <div className="d-flex justify-content-center">
            <WalletMultiButton></WalletMultiButton>
          </div>

          <div className="d-flex flex-wrap gap-2 justify-content-center">
            {betAmounts.map((betAmount) => {
              const isSelected = amount === betAmount.toString();
              return (
                <button
                  key={betAmount}
                  onClick={() => {
                    if (type !== 'join') {
                      setAmount(betAmount.toString());
                    }
                  }}
                  disabled={type === 'join'}
                  className={`btn bet-amount-btn ${isSelected ? 'active' : ''} ${type === 'join' && !isSelected ? 'disabled' : ''}`}
                >
                  {betAmount} SOL
                </button>
              );
            })}
          </div>


          <button
            onClick={handleBet}
            disabled={isSpinning || !amount || parseFloat(amount) <= 0 || !wallet.publicKey}
            className="btn place-bet-btn d-flex align-items-center justify-content-center gap-2 py-3"
          >
            {isSpinning ? (
              <>
                <RefreshCcw className="spinner" size={20} />
                Please Wait...
              </>
            ) : (
              !wallet.publicKey ? 'Connect Wallet to Bet' : 'Play Now'
            )}
          </button>
        </div>

        <p className="text-white-50 small text-center mt-4 mb-0">
          Place your bet and double your money if you win! <br />
          <b>3%</b> fees apply for every game.
        </p>
      </div>
    </div>
  );
}

export default Account;