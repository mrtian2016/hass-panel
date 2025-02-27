import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  // 获取系统主题
  const getSystemTheme = useCallback(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // 应用主题到文档
  const applyTheme = useCallback((themeValue) => {
    // 如果是系统主题，则应用系统的实际主题（dark 或 light）
    const actualTheme = themeValue === 'system' ? getSystemTheme() : themeValue;
    document.documentElement.setAttribute('data-theme', actualTheme);
  }, [getSystemTheme]);

  useEffect(() => {
    // 检测浏览器的主题偏好
    // const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // const browserTheme = prefersDarkMode ? 'dark' : 'light';
    
    // 从本地存储加载主题设置，如果没有保存过则使用浏览器主题
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
    
    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // 只有当用户设置为"system"时，才跟随系统主题变化
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    
    // 添加监听器
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // 兼容旧版浏览器
      mediaQuery.addListener(handleChange);
    }
    
    // 清理监听器
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [theme, applyTheme]);

  const toggleTheme = useCallback(() => {
    // 在三个选项之间循环：light -> dark -> system -> light
    let newTheme;
    if (theme === 'light') {
      newTheme = 'dark';
    } else if (theme === 'dark') {
      newTheme = 'system';
    } else {
      newTheme = 'light';
    }
    
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  }, [theme, applyTheme]);
  
  // 直接设置特定主题
  const setSpecificTheme = useCallback((newTheme) => {
    if (['light', 'dark', 'system'].includes(newTheme)) {
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      applyTheme(newTheme);
    }
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setSpecificTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 