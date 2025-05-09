import { useEffect, useState } from 'react';
import './css/RecentResult.css';
import axios from 'axios';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface PaymentResult {
  id: string;
  user_id: string;
  amount: number | string; // You can also use string if it's BigInt serialized
  status: 'Win' | 'Lost' | string;
  createdAt: string; // ISO string from backend
}

function RecentResult() {
  const [results, setResults] = useState<PaymentResult[]>([]);
  const serverURL =
    import.meta.env.VITE_ENVIRONMENT === 'LOCAL'
      ? import.meta.env.VITE_LOCAL_SERVER_URL
      : import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    axios
      .get(`${serverURL}/api/all-recent-results`)
      .then((response) => {
        console.log(response.data.payments);
        setResults(response.data.payments || []);
      })
      .catch((error) => {
        console.log('error in getting winner details', error);
      });
  }, []);

  return (
    <div className="recent-flips bg-purple-dark py-4">
      <div className="container">
        <h4 className="text-white mb-4">Recent Result</h4>
        <div className="flip-list">
          {results.map((data, index) => (
            <div key={index} className="flip-entry">
              <span className="flip-user text-blue">{data.user_id.substring(0, 15) + "....."}</span>
              <span className="flip-action">
                <span className={data.status === 'Win' ? 'text-green' : 'text-red'}>
                  {data.status} {'  '}
                </span>
                <span className="text-gold">{Number(data.amount) / LAMPORTS_PER_SOL} SOL</span>
              </span>
              <span className="flip-time text-white-50">
                {new Date(data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecentResult;
