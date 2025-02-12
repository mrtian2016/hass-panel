import React, { useState, useRef } from 'react';
import Icon from '@mdi/react';
import { 
  mdiCeilingLight,
  mdiLightbulbGroup,
} from '@mdi/js';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';
import './style.css';
import {useEntity} from '@hakit/core';
import Modal from '../Modal';
import LightControl from '../LightOverviewCard/LightControl';
import { notification } from 'antd';
function LightStatusCard({ config }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [showControl, setShowControl] = useState(false);
  const [selectedLight, setSelectedLight] = useState(null);
  const pressTimer = useRef(null);
  const debugMode = localStorage.getItem('debugMode') === 'true';
  // 确保 config 是一个对象
  if (!config || typeof config !== 'object') {
    return null;
  }

  const lightEntities = Object.entries(config.lights).reduce((acc, [key, lightConfig]) => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const entity = useEntity(lightConfig.entity_id);
      
      acc[key] = {
        ...lightConfig,
        entity,
        isLight: lightConfig.entity_id.startsWith('light.')
      };
      return acc;
    } catch (error) {
      if (debugMode) {
        notification.error({
          message: t('lightStatus.loadError'),
          description: t('lightStatus.loadErrorDesc') + (lightConfig.name || lightConfig.entity_id) + ' - ' + error.message,
          placement: 'topRight',
          duration: 3,
          key: 'LightStatusCard',
        });
      }
      return acc;
    }
  }, {});

  const activeLights = Object.values(lightEntities).filter(light => light.entity.state === 'on').length;
  const totalLights = Object.keys(lightEntities).length;

  const toggleLight = (entity) => {
    entity.service.toggle()
  };

  const handlePressStart = (light) => {
    // 只有 light 类型的实体才支持长按
    if (!light.isLight) return;
    
    pressTimer.current = setTimeout(() => {
      setSelectedLight(light);
      setShowControl(true);
    }, 500); // 500ms 长按触发
  };

  const handlePressEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };

  const handleTouchStart = (light, e) => {
    // 只有 light 类型的实体才阻止默认事件和支持长按
    if (!light.isLight) return;
    
    e.preventDefault();
    handlePressStart(light);
  };

  return (
    <div className="light-status-card">
      <div className="card-header">
        <h3>
          <Icon 
            path={mdiLightbulbGroup} 
            size={1} 
            color={theme === 'dark' ? 'var(--color-text-primary)' : '#FFB74D'}
            style={{ marginRight: '8px', verticalAlign: 'bottom' }} 
          />
          {config.title || t('cardTitles.lightStatus')}
        </h3>
        <span className="light-summary">
          {t('lightStatus.activeLights').replace('%1', activeLights).replace('%2', totalLights)}
        </span>
      </div>
      <div className="light-buttons" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        padding: '20px',
        justifyContent: 'center'
      }}>
        {Object.entries(lightEntities).map(([key, light]) => (
          <button
            key={key}
            className={`light-button ${!light.isLight ? 'switch-entity' : ''}`}
            onClick={() => toggleLight(light.entity)}
            onMouseDown={() => handlePressStart(light)}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            onTouchStart={(e) => handleTouchStart(light, e)}
            onTouchEnd={handlePressEnd}
            title={`${light.name}${!light.isLight ? t('lightStatus.switchEntity') : ''}`}
          >
            <Icon
              path={mdiCeilingLight}
              size={1.5}
              color={light.entity.state === 'on' 
                ? 'var(--color-secondary)' 
                : theme === 'dark' 
                  ? '#999999'
                  : 'var(--color-text-light)'
              }
            />
            <span className={`light-name ${light.name.length > 4 ? 'long-text' : ''}`}>
              {light.name}
            </span>
          </button>
        ))}
      </div>

      <Modal
        visible={showControl}
        onClose={() => setShowControl(false)}
        title={selectedLight?.name}
        width="350px"
      >
        {selectedLight && selectedLight.isLight && (
          <LightControl 
            lightEntity={selectedLight.entity}
            onClose={() => setShowControl(false)}
          />
        )}
      </Modal>
    </div>
  );
}

export default LightStatusCard; 