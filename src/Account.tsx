import { useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import "./css/Account.css";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { toast } from "react-toastify";
import '@solana/wallet-adapter-react-ui/styles.css';

function Account() {
  const [amount, setAmount] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const navigate = useNavigate();
  const wallet = useWallet();
  const { connection } = useConnection();

  const betAmounts = [0.1, 0.25, 0.5, 1, 2, 3, 4, 5];

  const handleBet = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    if (!wallet.publicKey) return;
    
    setIsSpinning(true);

    const snakeWinAccountPublicAddress = import.meta.env.VITE_SOLANA_PUBLIC_ADDRESS;
    console.log('snakeWinAccountPublicAddress', snakeWinAccountPublicAddress);

    const transaction = new Transaction();
    transaction.add(SystemProgram.transfer({
      fromPubkey: wallet.publicKey!,
      toPubkey: new PublicKey(snakeWinAccountPublicAddress),
      lamports: Number(amount) * LAMPORTS_PER_SOL,
    }));

    await wallet.sendTransaction(transaction, connection);

    toast.success(amount + " SOL deposited successfully");
    navigate('/game');
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center py-4">
      <div className="betting-card p-4 p-md-5" style={{ maxWidth: '32rem' }}>
        <h1 className="text-center mb-4 fw-bold">Double or Nothing</h1>
        
        <div className="d-flex flex-column gap-4">
          <div className="d-flex justify-content-center">
            <WalletMultiButton></WalletMultiButton>
          </div>

          <div className="d-flex flex-wrap gap-2 justify-content-center">
            {betAmounts.map((betAmount) => (
              <button
                key={betAmount}
                onClick={() => setAmount(betAmount.toString())}
                className={`btn bet-amount-btn ${amount === betAmount.toString() ? 'active' : ''}`}
              >
                {betAmount} SOL
              </button>
            ))}
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