import { Routes, Route } from "react-router-dom";
import LandingPage from './Landing';
import './App.css';
import Game from "./Game";
import Account from "./Account";

function App() {

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/game" element={<Game />} />
      <Route path="/account" element={<Account />} />
    </Routes>
  )
}

export default App
