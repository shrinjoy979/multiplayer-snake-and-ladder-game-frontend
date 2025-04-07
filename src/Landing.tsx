import { useEffect, ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import "./css/Landing.css";
import { Dice5, Coins, Users, Shield, ArrowRight } from 'lucide-react';
import { SignInButton, SignOutButton, useUser } from '@clerk/clerk-react';
import axios from "axios";

function LandingPage() {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const serverURL = import.meta.env.VITE_ENVIRONMENT === 'LOCAL' ? import.meta.env.VITE_LOCAL_SERVER_URL : import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    if (user) {
      axios
        .post(`${serverURL}/api/save-user`, {
          id: user?.id,
          name: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress,
          profileImage: 'testing',
        })
        .then((response: any) => {
          console.log("User saved successfully:", response.data);
        })
        .catch((error: any) => {
          console.error("Error saving user:", error.response?.data || error.message);
        });
    }
  }, [user, serverURL]);

  return (
    <div className="min-vh-100">
      <header className="container py-5">
        <nav className="d-flex justify-content-between align-items-center mb-5">
          <div className="d-flex align-items-center gap-2">
            <Dice5 className="text-yellow" size={32} />
            <span className="fs-4 fw-bold text-white">SnakesWin</span>
          </div>
          <div className="d-flex gap-3">
          {isSignedIn ? (
              <>
                <span className="text-white d-flex align-items-center">Welcome, {user.fullName}</span>
                <SignOutButton>
                  <button className="btn text-white">Sign out</button>
                </SignOutButton>

                <button className="btn btn-yellow" onClick={() => navigate('/game')}>Play Now</button>
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="btn text-white">Login</button>
                </SignInButton>

                <SignInButton mode="modal">
                  <button className="btn btn-yellow">Play Now</button>
                </SignInButton>
              </>
            )}
          </div>
        </nav>

        <div className="row align-items-center gy-4">
          <div className="col-md-6 text-center text-md-start">
            <h1 className="display-4 fw-bold text-white mb-4">
              Play Snakes & Ladders
              <span className="d-block text-yellow">Win SOLANA!</span>
            </h1>
            <p className="lead text-white-50 mb-4">
              Experience the classic game with a modern twist. Compete with players worldwide and win big with Solana.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-md-start">
              {isSignedIn ?
                <button className="btn btn-yellow btn-lg d-flex align-items-center justify-content-center gap-2" onClick={() => navigate('/game')}>
                  Start Playing <ArrowRight size={20} />
                </button>
              :
                <SignInButton mode="modal">
                  <button className="btn btn-yellow btn-lg d-flex align-items-center justify-content-center gap-2">Start Playing</button>
                </SignInButton>
              }
              <a href='#learnMore'> <button className="btn btn-outline-light btn-lg">Learn More</button></a>
            </div>
          </div>
          <div className="col-md-6">
            <img 
              src="https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&q=80&w=600"
              alt="Dice Game"
              className="img-fluid rounded-4 shadow"
            />
          </div>
        </div>
      </header>

      <section className="py-5 bg-purple-dark" id="learnMore">
        <div className="container">
          <h2 className="text-center text-white mb-5">Why Choose SnakesWin?</h2>
          <div className="row g-4">
            <div className="col-md-6">
              <FeatureCard 
                icon={<Coins size={32} />}
                title="Solana Integration"
                description="Use Solana for lightning-fast crypto transactions."
              />
            </div>
            <div className="col-md-6">
              <FeatureCard 
                icon={<Users size={32} />}
                title="Multiplayer"
                description="Compete with players from around the world in real-time."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-purple-dark">
        <div className="container text-center">
          <div className="d-flex align-items-center justify-content-center gap-2 mb-4">
            <Shield className="text-yellow" size={32} />
            <h2 className="mb-0 text-white">Secure Gaming</h2>
          </div>
          <p className="text-white-50 mx-auto" style={{ maxWidth: '600px' }}>
            Your security is our priority. All transactions are encrypted and protected. 
            We are licensed and regulated to ensure fair play.
          </p>
        </div>
      </section>

      <footer className="py-4 footer">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <Dice5 className="text-yellow" size={24} />
              <span className="text-white">SnakesWin</span>
            </div>
            <p className="text-white-50 mb-0 small">
              © 2024 SnakesWin. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: ReactElement;
  title: string;
  description: string;
}) {
  return (
    <div className="feature-card h-100 p-4 rounded-4 text-center">
      <div className="text-yellow mb-3">{icon}</div>
      <h3 className="fs-5 fw-semibold text-white mb-2">{title}</h3>
      <p className="text-white-50 mb-0">{description}</p>
    </div>
  );
}

export default LandingPage;
