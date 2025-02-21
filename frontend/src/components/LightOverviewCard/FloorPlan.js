import React, { useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import Modal from '../Modal';
import LightControl from './LightControl';
import { useLanguage } from '../../i18n/LanguageContext';

function FloorPlan({ lights }) {
  const { t } = useLanguage();
  const [showControl, setShowControl] = useState(false);
  const [selectedLight, setSelectedLight] = useState(null);
  const pressTimer = useRef(null);

  // 确保 lights 和必要的属性存在
  if (!lights || !lights.background || !lights.rooms) {
    console.warn('FloorPlan: Missing required props');
    return null;
  }

  const isLightEntity = (entityId) => {
    return entityId?.startsWith('light.') || entityId?.startsWith('switch.');
  };

  const handlePressStart = (light) => {
    // 只有 light 类型的实体才支持长按
    if (!isLightEntity(light.entity?.entity_id)) return;

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
    // 只有 light 类型的实体才阻止默认事件
    if (isLightEntity(light.entity?.entity_id)) {
      e.preventDefault();
      handlePressStart(light);
    }
  };

  return (
    <div className="floor-plan">
      <img 
        src={lights.background}
        alt={t('lightOverview.floorPlan.roomLayout')}
        className="base-layer"
      />
      
      {lights.rooms.map((light) => {

        const isLight = isLightEntity(light.entity?.entity_id);

        return (
          <React.Fragment key={light.entity?.entity_id}>
            <img
              src={light.image || lights.background}
              alt={light.name}
              className={`light-layer ${light.state === 'on' ? 'active' : ''}`}
              style={{ pointerEvents: 'none' }}
            />
            <button
              className={`room-light-button ${light.state === 'on' ? 'active' : ''}`}
              style={{
                position: 'absolute',
                ...light.position
              }}
              onClick={() => light.entity?.service.toggle()}
              onMouseDown={() => isLight && handlePressStart(light)}
              onMouseUp={isLight ? handlePressEnd : undefined}
              onMouseLeave={isLight ? handlePressEnd : undefined}
              onTouchStart={(e) => isLight && handleTouchStart(light, e)}
              onTouchEnd={isLight ? handlePressEnd : undefined}
              title={light.name}
            >
              <Icon 
                icon={light.icon || 'mdi:ceiling-light'}
                width={22}
                height={22}
                className="light-icon"
              />
            </button>
          </React.Fragment>
        );
      })}

      <Modal
        visible={showControl}
        onClose={() => setShowControl(false)}
        title={selectedLight?.name}
        width="350px"
      >
        {selectedLight && (
          <LightControl 
            lightEntity={selectedLight.entity}
            onClose={() => setShowControl(false)}
          />
        )}
      </Modal>
    </div>
  );
}

export default FloorPlan; 