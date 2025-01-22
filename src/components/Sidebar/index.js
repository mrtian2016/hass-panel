import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '@mdi/react';
import {
  mdiHome,
  mdiMessage,
  mdiAccount,
} from '@mdi/js';
import './style.css';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const menuItems = [
    {
      key: '/',
      title: '首页',
      icon: mdiHome,
    },
    {
      key: '/message',
      title: '消息',
      icon: mdiMessage,
    },
    {
      key: '/my',
      title: '我的',
      icon: mdiAccount,
    },
  ];

  return (
    <div className="sidebar">
      <div className="menu-items">
        {menuItems.map(item => (
          <button
            key={item.key}
            className={`menu-item ${pathname === item.key ? 'active' : ''}`}
            onClick={() => navigate(item.key)}
          >
            <Icon path={item.icon} size={1} />
            <span className="menu-title">{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Sidebar; 