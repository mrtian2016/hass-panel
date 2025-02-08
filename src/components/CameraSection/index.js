import React from 'react';
import { mdiCctv } from '@mdi/js';
import { useTheme } from '../../theme/ThemeContext';
import BaseCard from '../BaseCard';
import CameraCard from '../CameraCard';
import './style.css';
import { useEntity } from '@hakit/core';
function CameraSection({ config }) {
  const { theme } = useTheme();

  const cameraEntities = config.cameras.map(camera => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const entity = useEntity(camera.entity_id);
    return {
      ...camera,
      entity,
    };
  });
  if (!cameraEntities || cameraEntities.length === 0) return null;

  return (
    <BaseCard
      title="监控画面"
      icon={mdiCctv}
      iconColor={theme === 'dark' ? 'var(--color-text-primary)' : '#E57373'}
    >
      <div className="cameras-grid">
        {cameraEntities.map((camera) => (
          <CameraCard 
            key={camera.entity_id} 
            camera={camera.entity} 
            streamUrl={camera.stream_url}
            name={camera.name}
          />
        ))}
      </div>
    </BaseCard>
  );
}

export default CameraSection; 