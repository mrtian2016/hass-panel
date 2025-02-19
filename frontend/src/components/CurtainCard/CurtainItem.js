import React from 'react';
import { useIcon } from '@hakit/core';
import { useEntity } from '@hakit/core';
import { notification } from 'antd';
import { useLanguage } from '../../i18n/LanguageContext';

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
  const { t } = useLanguage();
  const curtain = useEntity(entity_id || '', {returnNullIfNotFound: true});
  const debugMode = localStorage.getItem('debugMode') === 'true';
  if (!curtain) {
    if (debugMode) {
      notification.error({
        message: t('curtain.loadError'),
        description: `${t('curtain.loadErrorDesc')} ${entity_id}`,
        placement: 'topRight',
        duration: 3,
        key: 'CurtainItem',
      });
    }
    return <div>{t('curtain.loadFailed')}</div>
  }
  
  const position = curtain?.attributes?.current_position || 0;
  const currentPosition = 50 - (position / 2) + 50;

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
              className="curtain-control-button"
              onClick={() => curtain.service.openCover()}
              disabled={curtain.state === 'open'}
              title={t('curtain.open')}
            >
              <MdiArrowExpandHorizontal />
            </button>
            <button 
              className="curtain-control-button"
              onClick={() => curtain.service.stopCover()}
              title={t('curtain.stop')}
            >
              <MdiStop />
            </button>
            <button 
              className="curtain-control-button"
              onClick={() => curtain.service.closeCover()}
              disabled={curtain.state === 'closed'}
              title={t('curtain.close')}
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