import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TabBar } from 'antd-mobile';
import {
  AppOutline,
  MessageOutline,
  UserOutline,
} from 'antd-mobile-icons';
import './style.css';

function Bottom() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const tabs = [
    {
      key: '/',
      title: '首页',
      icon: <AppOutline />,
    },
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