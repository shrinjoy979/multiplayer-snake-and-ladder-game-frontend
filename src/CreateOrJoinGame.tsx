import { useState } from "react";
import { socket } from './socket';
import { useNavigate } from 'react-router-dom';
import { TowerControl as GameController, Users } from 'lucide-react';

function CreateOrJoinGame() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);

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
        socket.emit("joinGame", code);
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