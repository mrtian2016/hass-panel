import React from 'react';
import { useIcon } from '@hakit/core';
import { useEntity } from '@hakit/core';
function MdiArrowCollapseHorizontal() {
  const icon = useIcon('mdi:arrow-collapse-horizontal');
  return <div>{icon}</div>
}

function MdiArrowExpandHorizontal() {
  const icon = useIcon('mdi:arrow-expand-horizontal');
  return <div>{icon}</div>
}

function MdiStop() {
  const icon = useIcon('mdi:stop');
  return <div>{icon}</div>
}

function CurtainItem({ entity_id, name }) {
  const curtain = useEntity(entity_id);
  const position = curtain?.attributes?.current_position || 0; // 0-100
  const currentPosition = 50 - (position / 2); // 将0-100的范围映射到50-0的范围

  return (
    <div className="curtain-content">
      <div className="curtain-visualization">
        <div className="curtain-name">{name}</div>
        
        <div className="curtain-visual">
          <div className="curtain-panel left" style={{
            width: `${currentPosition}%`
          }} />
          <div className="curtain-panel right" style={{
            width: `${currentPosition}%`,
            '--handle-visibility': position === 0 ? 'hidden' : 'visible'
          }} />
        </div>

        <div className="curtain-side">
          <div className="curtain-controls">
            <button 
              className="control-button"
              onClick={() => curtain.service.openCover()}
              disabled={curtain.state === 'open'}
            >
              <MdiArrowExpandHorizontal />
            </button>
            <button 
              className="control-button"
              onClick={() => curtain.service.stopCover()}
            >
              <MdiStop />
            </button>
            <button 
              className="control-button"
              onClick={() => curtain.service.closeCover()}
              disabled={curtain.state === 'closed'}
            >
              <MdiArrowCollapseHorizontal />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurtainItem; 