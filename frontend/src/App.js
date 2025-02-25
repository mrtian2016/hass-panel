import '@ant-design/v5-patch-for-react-19';
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { HassConnect } from '@hakit/core';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { LanguageProvider } from './i18n/LanguageContext';
import Bottom from './components/Bottom';
// import Sidebar from './components/Sidebar';
import Home from './pages/home';
import AppRoutes from './routes';
import './App.css';
import { ConfigProvider, theme as antdTheme, message } from 'antd';
import Login from './pages/login';
import InitializePage from './pages/initialize';
import { systemApi } from './utils/api';
import Loading from './components/Loading';

// 将需要使用 useNavigate 的逻辑移到单独的组件中
function MainContent() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [hassConfig, setHassConfig] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const isDesktop = useMediaQuery({ minWidth: 768 });

  const checkAuth = useCallback(async () => {
    if (!localStorage.getItem('hass_panel_token')) {
      setIsLoading(false);
      navigate('/login');
      return;
    }

    try {
      const data = await systemApi.getHassConfig();
      
      if (data.code === 200) {
        setHassConfig({
          hassUrl: data.data.url,
          hassToken: data.data.token
        });
        localStorage.setItem('hass_url', data.data.url);
        setIsAuthenticated(true);
      } else if (data.code === 401) {
        localStorage.removeItem('hass_panel_token');
        navigate('/login');
      }
    } catch (error) {
      console.error('获取 HASS 配置失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setHassConfig, setIsAuthenticated, setIsLoading]);

  const updateHassConfig = async () => {
    try {
      const hassToken = JSON.parse(localStorage.getItem('hassTokens'));
      await systemApi.updateHassConfig({
        hass_url: hassToken.hassUrl,
        hass_token: hassToken.access_token
      });
    } catch (error) {
      console.error('更新 HASS 配置失败:', error);
    }
  }

  const checkInitStatus = useCallback(async () => {
    try {
      const data = await systemApi.checkInitStatus();
      
      if (data.code === 200) {
        if (!data.data.is_initialized) {
          setIsLoading(false);
          navigate('/initialize');
          return;
        }
        // 如果已初始化，检查认证状态
        checkAuth();
      } else {
        message.error('检查系统状态失败');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('检查系统状态失败:', error);
      setIsLoading(false);
      navigate('/initialize');
    }
  }, [navigate, checkAuth]);

  useEffect(() => {
    checkInitStatus();
  }, [checkInitStatus]);

  return (
        <LanguageProvider>
          <Routes>
            <Route path="/initialize" element={<InitializePage />} />
            <Route path="/login" element={<Login />} />
            {isAuthenticated && (
              <Route path="/*" element={
                <HassConnect 
                  hassUrl={hassConfig.hassUrl} 
                  hassToken={hassConfig.hassToken}
                  onReady={async () => {
                    await updateHassConfig();
                  }}
                >
                  <div className="App">
                    <Routes>
                      <Route path="/" element={<Home sidebarVisible={sidebarVisible} setSidebarVisible={setSidebarVisible} />} />
                      {AppRoutes({sidebarVisible, setSidebarVisible})}
                    </Routes>
                    {!isDesktop && <Bottom />}
                  </div>
                </HassConnect>
              } />
            )}
          </Routes>
          {isLoading && <Loading />}
        </LanguageProvider>
   
  );
}

// 创建一个新的包装组件来处理主题配置
function ThemedApp({ children }) {
  const { theme } = useTheme();
  
  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#FFB74D',
          borderRadius: 8,
        },
        components: {
          Slider: {
            railSize: 10
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

// 主应用组件
function App() {
  return (
 
      <Router>
        <ThemeProvider>
          <ThemedApp>
          <MainContent />
        </ThemedApp>
      </ThemeProvider>
      </Router>
    
  );
}

export default App;
