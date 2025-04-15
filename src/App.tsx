import { Routes, Route } from "react-router-dom";
import LandingPage from './Landing';
import './App.css';
import Game from "./Game";
import Account from "./Account";
import CreateOrJoinGame from "./CreateOrJoinGame";
import { ToastContainer } from 'react-toastify';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

function App() {

  return (
    <>
      <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
        <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/create-or-join-game" element={<CreateOrJoinGame />} />
              <Route path="/account/:gameId/:playerId/:type" element={<Account />} />
              <Route path="/game/:gameId/:playerId/:type" element={<Game />} />
            </Routes>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
      <ToastContainer />
    </>
  )
}

export default App
