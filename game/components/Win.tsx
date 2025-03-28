import React from 'react';

interface WinProps {
  onShare: () => void;
  graph?: React.ReactNode;
}

const Win: React.FC<WinProps> = ({ onShare, graph }) => {
  const [shared, setShared] = React.useState(false);

  const shareImage = () => {
    setShared(true);
    onShare();
  };

  return (
    <>
      <div id="win-card" style={{ textAlign: 'center' }}>
        <h1>Congratulations, you win!</h1>
        <div id="win-button-container">
          <button className="win-button" onClick={shareImage}>
            {shared ? 'Shared!' : 'Share your journey'}
          </button>
        </div>
      </div>
      {graph && <div style={{ marginTop: '20px' }}>{graph}</div>}
    </>
  );
};

export default Win;
