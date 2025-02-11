import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '@mdi/react';
import {
  mdiHome,
  // mdiMessage,
  // mdiAccount,
  mdiCog,
} from '@mdi/js';
import { useLanguage } from '../../i18n/LanguageContext';
import './style.css';

function Sidebar({ visible }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const { t } = useLanguage();

  const menuItems = [
    {
      key: '/',
      title: t('nav.home'),
      icon: mdiHome,
    },
    // {
    //   key: '/message',
    //   title: '消息',
    //   icon: mdiMessage,
    // },
    // {
    //   key: '/my',
    //   title: '我的',
    //   icon: mdiAccount,
    // },
    {
      key: '/config',
      title: t('nav.config'),
      icon: mdiCog,
    },
  ];

  return (
    <div className={`sidebar ${visible ? '' : 'hidden'}`}>
      <div className="menu-items">
        {menuItems.map(item => (
          <button
            key={item.key}
            className={`menu-item ${pathname === item.key ? 'active' : ''}`}
            onClick={() => navigate(item.key)}
            title={item.title}
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