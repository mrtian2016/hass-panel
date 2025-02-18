import React from 'react';
import './index.css';

const Loading = () => {
  return (
    <div className="app-loading-container">
      <div className="app-loading-spinner">
        <div className="app-loading-circle"></div>
      </div>
      <p className="app-loading-text"></p>
    </div>
  );
};

export default Loading; 