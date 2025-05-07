import './css/RecentResult.css';

const sampleFlips = [
  { user: 'DAa3...2vV6', amount: '0.5', result: 'doubled', time: '7 mins ago' },
  { user: 'DAa3...2vV6', amount: '2', result: 'lost', time: '8 mins ago' },
  { user: 'DAa3...2vV6', amount: '0.1', result: 'lost', time: '8 mins ago' },
  { user: '3f7s...L5Jr', amount: '0.1', result: 'doubled', time: 'an hr ago' },
  { user: 'DU8D...WshM', amount: '0.5', result: 'lost', time: '2 hrs ago' },
  { user: 'DU8D...WshM', amount: '0.25', result: 'doubled', time: '2 hrs ago' },
  { user: 'DU8D...WshM', amount: '0.5', result: 'lost', time: '2 hrs ago' },
];

function RecentResult() {
  return (
    <div className="recent-flips bg-purple-dark py-4">
      <div className="container">
        <h4 className="text-white mb-4">Recent Result</h4>
        <div className="flip-list">
          {sampleFlips.map((flip, index) => (
            <div key={index} className="flip-entry">
              <span className="flip-user text-blue">{flip.user}</span>
              <span className="flip-action">
                bet <span className="text-gold">{flip.amount} SOL</span> and 
                <span className={flip.result === 'doubled' ? 'text-green' : 'text-red'}> {flip.result}.</span>
              </span>
              <span className="flip-time text-white-50">{flip.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecentResult;
