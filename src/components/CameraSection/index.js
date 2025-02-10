import React from 'react';
import { mdiCctv } from '@mdi/js';
import { useTheme } from '../../theme/ThemeContext';
import BaseCard from '../BaseCard';
import CameraCard from '../CameraCard';
import './style.css';
import { useEntity } from '@hakit/core';
import { notification } from 'antd';
function CameraSection({ config }) {
  const { theme } = useTheme();

  const cameraEntities = config.cameras.map(camera => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const entity = useEntity(camera.entity_id);
      return {
        ...camera,
        entity,
      };
    } catch (error) {
      notification.error({
        message: '播放器卡片加载失败',
        description: `监控画面加载失败: ${error.message}`,
        placement: 'topRight',
        duration: 3,
        key: 'CameraSection',
      });
      return {
        ...camera,
        entity: { state: null, error: true },
      };
    }
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