import React from 'react';
import { Icon } from '@iconify/react';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';
import './style.css';
import {useEntity} from '@hakit/core';
import { notification } from 'antd';
import BaseCard from '../BaseCard';

function SocketStatusCard({ config }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const debugMode = localStorage.getItem('debugMode') === 'true';

  // 确保 config 是一个对象
  if (!config || typeof config !== 'object') {
    return null;
  }

  const socketEntities = Object.entries(config.sockets || {}).reduce((acc, [key, socketConfig]) => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const entity = useEntity(socketConfig.entity_id);
      
      acc[key] = {
        ...socketConfig,
        entity
      };
      return acc;
    } catch (error) {
      if (debugMode) {
        notification.error({
          message: t('socketStatus.loadError'),
          description: t('socketStatus.loadErrorDesc') + (socketConfig.name || socketConfig.entity_id) + ' - ' + error.message,
          placement: 'topRight',
          duration: 3,
          key: 'SocketStatusCard',
        });
      }
      return acc;
    }
  }, {});

  const toggleSocket = (entity) => {
    entity.service.toggle();
  };

  return (
    <BaseCard
      title={config.title || t('cardTitles.socketStatus')}
      titleVisible={config.titleVisible}
      icon={<Icon 
        icon={'mdi:power-socket'} 
        width={24}
        height={24}
        style={{ marginRight: '8px', verticalAlign: 'bottom' }} 
      />}
      
    >
      <div className="socket-buttons">
        {Object.entries(socketEntities).map(([key, socket]) => (
          <button
            key={key}
            className="socket-button"
            onClick={() => toggleSocket(socket.entity)}
            title={socket.name}
            data-state={socket.entity.state}
          >
            <Icon
              icon={socket.icon || 'mdi:power-socket'}
              width={32}
              height={32}
              color={socket.entity.state === 'on' 
                ? 'var(--color-primary)' 
                : theme === 'dark' 
                  ? 'var(--color-text-secondary)'
                  : 'var(--color-text-light)'
              }
              style={{
                transition: 'all 0.3s ease',
                transform: socket.entity.state === 'on' ? 'scale(1.1)' : 'scale(1)'
              }}
            />
            <span className={`socket-name ${socket.name.length > 4 ? 'long-text' : ''}`}>
              {socket.name}
            </span>
          </button>
        ))}
      </div>
    </BaseCard>
  );
}

export default SocketStatusCard; 