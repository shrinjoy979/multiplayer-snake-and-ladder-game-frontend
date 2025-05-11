import { useState } from "react";
import { socket } from './socket';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { TowerControl as GameController, Users, CheckCircle2 } from 'lucide-react';

function CreateOrJoinGame() {
    const { user } = useUser();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [network, setNetwork] = useState<'mainnet' | 'devnet'>('devnet');

    const handleCreateGame = () => {
      setLoading(true);
      socket.emit("createGame");
    };

    socket.on("gameCreated", ({ gameId }: { gameId: string }) => {
      setLoading(false);
      navigate(`/account/${gameId}/${socket.id}/create`);
    });

    const handleJoinGame = () => {
      const code = prompt("Enter the game code");
      if (code) {
        setLoading(true);
        socket.emit("joinGame", code, user?.id);
        setLoading(false);
        navigate(`/account/${code}/${socket.id}/join`);
      }
    };

    return (
      <>
        {loading ? (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center bg-dark bg-opacity-75" style={{ zIndex: 9999 }}>
            <div className="spinner-border text-light" role="status" />
            <p className="mt-3 text-white">Setting things up...</p>
          </div>
          ) :
          <div className="container min-vh-100 d-flex align-items-center justify-content-center py-4">
            <div className="glass-card rounded-4 p-5 shadow-lg" style={{ maxWidth: '450px' }}>

              <div className="d-flex justify-content-center mb-4 gap-2">
                {/* <button
                  onClick={() => {
                    setNetwork('mainnet');
                  }}
                  className={`btn btn-sm px-4 py-2 rounded-pill d-flex align-items-center gap-2 ${
                    network === 'mainnet' ? 'bg-success text-dark fw-semibold' : 'btn-outline-secondary text-white'
                  }`}
                  disabled
                >
                  <CheckCircle2 size={16} />
                  Mainnet
                </button> */}

                <button
                  onClick={() => {
                    setNetwork('devnet');
                  }}
                  className={`btn btn-sm px-4 py-2 rounded-pill d-flex align-items-center gap-2 ${
                    network === 'devnet' ? 'bg-success text-dark fw-semibold' : 'btn-outline-secondary text-white'
                  }`}
                >
                  <CheckCircle2 size={16} />
                  Devnet
                </button>
              </div>

              <h1 className="display-6 fw-bold text-center text-white mb-4">
                SnakesWin
              </h1>

              <div className="d-flex flex-column gap-4">
                <button
                  onClick={handleCreateGame}
                  className="btn btn-custom-purple btn-lg w-100 d-flex align-items-center justify-content-center gap-2 text-light"
                >
                  <span className="icon-container">
                    <GameController size={24} />
                  </span>
                  <span>Create Game</span>
                </button>

                <div className="d-flex align-items-center gap-3">
                  <hr className="flex-grow-1 opacity-25" />
                  <span className="text-white-50">OR</span>
                  <hr className="flex-grow-1 opacity-25" />
                </div>

                <button
                  onClick={handleJoinGame}
                  className="btn btn-custom-indigo btn-lg w-100 d-flex align-items-center justify-content-center gap-2 text-light"
                >
                  <span className="icon-container">
                    <Users size={24} />
                  </span>
                  <span>Join Game</span>
                </button>
              </div>

              <p className="text-white-50 text-center small mt-4 mb-0">
                Connect with friends and start playing!
              </p>
            </div>
          </div>
        }
      </>
  );
}

export default CreateOrJoinGame;