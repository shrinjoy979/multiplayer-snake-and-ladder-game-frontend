import { useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import "./css/Account.css";
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

function Account() {
  const [amount, setAmount] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const wallet = useWallet();

  const betAmounts = [0.1, 0.25, 0.5, 1, 2, 3, 4, 5];

  const handleBet = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    if (!wallet.publicKey) return;
    
    setIsSpinning(true);
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
          Place your bet and double your money if you win!
        </p>
      </div>
    </div>
  );
}

export default Account;