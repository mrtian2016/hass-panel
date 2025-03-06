import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@mdi/react';
import { mdiCog } from '@mdi/js';
import './style.css';

function My() {
  const navigate = useNavigate();
  
  return (
    <div className="my-page">
      <div className="menu-list">
        <div className="menu-item" onClick={() => navigate('/config')}>
          <Icon path={mdiCog} size={14} />
          <span>卡片配置</span>
        </div>
      </div>
    </div>
  );
}

export default My;