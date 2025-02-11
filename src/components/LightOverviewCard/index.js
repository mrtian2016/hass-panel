import React from 'react';
import { mdiHomeFloorG } from '@mdi/js';
import { useTheme } from '../../theme/ThemeContext';
import BaseCard from '../BaseCard';
import FloorPlan from './FloorPlan';
import './style.css';
import { useEntity } from '@hakit/core';
import { notification } from 'antd';
function LightOverviewCard({ config }) {
  console.log('LightOverviewCard config:', config);
  const { theme } = useTheme();

  // 确保 config 和 config.rooms 存在
  if (!config || !config.rooms) {
    console.warn('LightOverviewCard: Missing config or rooms');
    return null;
  }

  // 为每个房间创建实体 hooks
  const lightEntities = config.rooms.filter(room => room && room.entity_id && room.position).map(room => {
    
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const entity = useEntity(room.entity_id);
      return {
        ...room,
        entity,
        state: entity?.state
      };
    } catch (error) {
      notification.error({
        message: '房间概览灯光加载失败',
        description: `房间概览灯光加载失败,实体ID: ${room.entity_id} 未找到`,
        placement: 'topRight',
        duration: 3,
        key: 'LightOverviewCard',
      });
      return {
        ...room,
        entity: { state: null, error: true },
      };
    }
  });

  // 构建传递给 FloorPlan 的数据
  const lightStates = {
    background: config.background || '',  // 添加默认空字符串
    rooms: lightEntities
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