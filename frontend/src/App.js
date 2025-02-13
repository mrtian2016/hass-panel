import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { HassConnect } from '@hakit/core';
import { ThemeProvider } from './theme/ThemeContext';
import { LanguageProvider } from './i18n/LanguageContext';
import Bottom from './components/Bottom';
import Sidebar from './components/Sidebar';
import Home from './pages/home';
import AppRoutes from './routes';
import './App.css';

function App() {
  const [sidebarVisible, setSidebarVisible] = useState(() => {
    const saved = localStorage.getItem('sidebar-visible');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // 保存侧边栏状态到 localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-visible', JSON.stringify(sidebarVisible));
  }, [sidebarVisible]);

  const isDesktop = useMediaQuery({ minWidth: 768 });

  return (
    <ThemeProvider>
      <LanguageProvider>
        <HassConnect 
          hassUrl={window.env?.REACT_APP_HASS_URL} 
          hassToken={window.env?.REACT_APP_HASS_TOKEN}
        >
          <Router>
            <div className="App">
              {isDesktop && <Sidebar visible={sidebarVisible} />}
              <Routes>
                <Route path="/" element={<Home sidebarVisible={sidebarVisible} setSidebarVisible={setSidebarVisible} />} />
                {AppRoutes()}
              </Routes>
              {!isDesktop && <Bottom />}
            </div>
          </Router>
        </HassConnect>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
