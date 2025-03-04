import React from 'react';
import { mdiCctv } from '@mdi/js';
import { useLanguage } from '../../i18n/LanguageContext';
import BaseCard from '../BaseCard';
import CameraCard from '../CameraCard';
import './style.css';
import { useCamera } from '@hakit/core';
import { notification } from 'antd';

function CameraSection({ config, titleVisible }) {
  const { t } = useLanguage();
  const debugMode = localStorage.getItem('debugMode') === 'true';

  const cameraEntities = config.cameras.map(camera => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const entity = useCamera(camera.entity_id,{stream:true});
      return {
        ...camera,
        entity,
      };
    } catch (error) {
      if (debugMode) {
        notification.error({
          message: t('camera.loadError'),
          description: `${t('camera.loadErrorDesc')} ${error.message}`,
          placement: 'topRight',
          duration: 3,
          key: 'CameraSection',
        });
      }
      return {
        ...camera,
        entity: { state: null, error: true },
      };
    }
  });
  if (!cameraEntities || cameraEntities.length === 0) return null;

  return (
    <BaseCard
      title={config.title || t('cardTitles.camera')}
      titleVisible={titleVisible}
      icon={mdiCctv}
    >
      <div className="cameras-grid">
        {cameraEntities.map((camera) => (
          <CameraCard 
            key={camera.entity_id} 
            camera={camera.entity} 
            streamUrl={camera.stream_url}
            playUrl={camera.play_url}
            name={camera.name}
          />
        ))}
      </div>
    </BaseCard>
  );
}

export default CameraSection; 