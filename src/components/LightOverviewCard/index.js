import React from 'react';
import { mdiHomeFloorG } from '@mdi/js';
import { useTheme } from '../../theme/ThemeContext';
import BaseCard from '../BaseCard';
import FloorPlan from './FloorPlan';
import './style.css';
import { useEntity } from '@hakit/core';

function LightOverviewCard({ config }) {
  const { theme } = useTheme();

  // 为每种类型的实体创建单独的 hooks
  const lightEntities = config.rooms.map(light => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const entity = useEntity(light.entity_id);
    return {
      ...light,
      entity,
    };
  });

  // 修改 lightStates 的构建方式
  const lightStates = {
    background: config.background,
    rooms: lightEntities.map(light => ({
      entity: light.entity,
      state: light.entity?.state,
      name: light.name,
      position: light.position,
      image: light.image
    }))
  };
  return (
    <BaseCard
      title="房间状态"
      icon={mdiHomeFloorG}
      iconColor={theme === 'dark' ? 'var(--color-text-primary)' : '#FFB74D'}
    >
      <div className="light-overview">
        <FloorPlan lights={lightStates} />
      </div>
    </BaseCard>
  );
}

export default LightOverviewCard; 