import React from 'react';
import Icon from '@mdi/react';
import { 
  mdiThermometer,
  mdiWaterPercent,
} from '@mdi/js';
import { useTheme } from '../../theme/ThemeContext';
import BaseCard from '../BaseCard';
import './style.css';
import { useEntity } from '@hakit/core';

// 图标映射
const ICON_MAP = {
  mdiThermometer,
  mdiWaterPercent,
};

function SensorCard({ config }) {
  const { theme } = useTheme();
  
  // 确保 config.sensors 是数组
  const sensorGroups = Array.isArray(config.sensors) ? config.sensors : [];

  // 动态加载传感器实体
  const sensorEntities = sensorGroups.map(group => {
    const sensors = Object.entries(group.sensors).reduce((acc, [type, sensor]) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const entity = useEntity(sensor.entity_id);
      acc[type] = {
        ...sensor,
        entity,
      };
      return acc;
    }, {});

    return {
      ...group,
      sensors,
    };
  });

  return (
    <BaseCard
      title="环境监测"
      icon={mdiThermometer}
      iconColor={theme === 'dark' ? 'var(--color-text-primary)' : '#4FC3F7'}
    >
      <div className="sensor-data">
        {sensorEntities.map(group => (
          <div key={group.id} className="room-sensor">
            <div className="room-name">{group.name}</div>
            <div className="sensor-items">
              {Object.entries(group.sensors).map(([type, sensor]) => (
                <div key={type} className="sensor-item">
                  <Icon 
                    className="sensor-icon"
                    path={ICON_MAP[sensor.icon]} 
                    size={1} 
                    color="var(--color-text-primary)" 
                  />
                  <div className="sensor-info">
                    <span className="label">{sensor.name}</span>
                    <span className="value">
                      {sensor.entity?.state} {sensor.entity?.attributes?.unit_of_measurement}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </BaseCard>
  );
}

export default SensorCard; 