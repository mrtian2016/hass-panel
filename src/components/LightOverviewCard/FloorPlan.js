import React, { useState, useRef } from 'react';
import Icon from '@mdi/react';
import { mdiCeilingLight } from '@mdi/js';
import Modal from '../Modal';
import LightControl from './LightControl';

function FloorPlan({ lights }) {
  const [showControl, setShowControl] = useState(false);
  const [selectedLight, setSelectedLight] = useState(null);
  const pressTimer = useRef(null);

  const isLightEntity = (entityId) => {
    return entityId?.startsWith('light.');
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
        alt="房间布局" 
        className="base-layer"
      />
      
      {lights.rooms.map((light) => {
        if (!light.image) return null;

        const isLight = isLightEntity(light.entity?.entity_id);

        return (
          <React.Fragment key={light.entity?.entity_id}>
            <img
              src={light.image}
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
                path={mdiCeilingLight}
                size={1}
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