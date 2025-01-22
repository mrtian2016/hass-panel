import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { HassConnect } from '@hakit/core';
import { ThemeProvider } from './theme/ThemeContext';
import Bottom from './components/Bottom';
import Sidebar from './components/Sidebar';
import Routes from './routes';
import './App.css';

function App() {
  const isDesktop = useMediaQuery({ minWidth: 768 });

  return (
    <ThemeProvider>
      <HassConnect 
        hassUrl={process.env.REACT_APP_HASS_URL} 
        hassToken={process.env.REACT_APP_HASS_TOKEN}
      >
        <BrowserRouter>
          <div className="App">
            {isDesktop && <Sidebar />}
            <Routes />
            {!isDesktop && <Bottom />}
          </div>
        </BrowserRouter>
      </HassConnect>
    </ThemeProvider>
  );
}

export default App;
