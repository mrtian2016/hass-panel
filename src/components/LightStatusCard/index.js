import React, { useState, useRef } from 'react';
import Icon from '@mdi/react';
import { 
  mdiCeilingLight,
  mdiLightbulbGroup,
} from '@mdi/js';
import { useTheme } from '../../theme/ThemeContext';
import './style.css';
import {useEntity} from '@hakit/core';
import Modal from '../Modal';
import LightControl from '../LightOverviewCard/LightControl';

function LightStatusCard({ config }) {
  const { theme } = useTheme();
  const [showControl, setShowControl] = useState(false);
  const [selectedLight, setSelectedLight] = useState(null);
  const pressTimer = useRef(null);
  
  // 确保 config 是一个对象
  if (!config || typeof config !== 'object') {
    return null;
  }

  const lightEntities = Object.entries(config.lights).reduce((acc, [key, lightConfig]) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const entity = useEntity(lightConfig.entity_id);
    
    acc[key] = {
      ...lightConfig,
      entity,
      // 判断实体类型
      isLight: lightConfig.entity_id.startsWith('light.')
    };
    return acc;
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
          照明状态
        </h3>
        <span className="light-summary">
          {activeLights} / {totalLights} 个灯开启
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
            title={`${light.name}${!light.isLight ? ' (开关)' : ''}`}
            style={{ 
              width: '100%',
              aspectRatio: '1',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-small)',
              background: 'var(--color-background)',
              cursor: 'pointer',
              transition: 'all 0.3s',
              opacity: light.isLight ? 1 : 0.8
            }}
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
            <span className="light-name" style={{ marginTop: '5px' }}>
              {light.name.replace('灯', '')}
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