import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TabBar } from 'antd-mobile';
import {
  AppOutline,
  // MessageOutline,
  // UserOutline,
  SetOutline,
} from 'antd-mobile-icons';
import { useLanguage } from '../../i18n/LanguageContext';
import './style.css';

function Bottom() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const { t } = useLanguage();

  const tabs = [
    {
      key: '/',
      title: t('nav.home'),
      icon: <AppOutline />,
    },
    {
      key: '/config',
      title: t('nav.config'),
      icon: <SetOutline />,
    }
    // {
    //   key: '/message',
    //   title: '消息',
    //   icon: <MessageOutline />,
    // },
    // {
    //   key: '/my',
    //   title: '我的',
    //   icon: <UserOutline />,
    // },
  ];

  return (
    <TabBar activeKey={pathname} onChange={value => navigate(value)}>
      {tabs.map(item => (
        <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
      ))}
    </TabBar>
  );
}

export default Bottom;