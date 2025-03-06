import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

// 根据屏幕尺寸动态调整根字体大小
const adjustRootFontSize = () => {
  const width = window.innerWidth;
  const html = document.documentElement;
  
  // 判断是否为移动设备
  const isMobile = width <= 768;
  
  let fontSize;
  if (isMobile) {
    // 移动端：基于375px设计稿
    fontSize = width / 375;
  } else {
    // PC端：基于1920px设计稿
    fontSize = width / 1920;
  }
  
  // 四舍五入到小数点后三位，保持精确度同时避免频繁的微小变化
  fontSize = Math.round(fontSize * 1000) / 1000;
  
  // 设置根字体大小
  html.style.fontSize = `${fontSize}px`;
  
  console.log('屏幕尺寸变化，当前宽度:', width, '根字体大小:', fontSize + 'px', isMobile ? '移动端' : 'PC端');
};

// 初始调用
adjustRootFontSize();

// 添加窗口大小变化的监听
window.addEventListener('resize', adjustRootFontSize);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 注册 Service Worker 以支持 PWA
serviceWorkerRegistration.register({
  onSuccess: registration => {
    console.log('PWA is ready');
  },
  onUpdate: registration => {
    const waitingServiceWorker = registration.waiting;
    if (waitingServiceWorker) {
      waitingServiceWorker.addEventListener("statechange", event => {
        if (event.target.state === "activated") {
          window.location.reload();
        }
      });
      waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
    }
  },
});

// 如果需要测量性能，可以传入一个函数来记录结果
reportWebVitals();
