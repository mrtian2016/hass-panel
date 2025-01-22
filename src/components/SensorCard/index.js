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
  temperature: mdiThermometer,
  humidity: mdiWaterPercent,
};

function SensorCard({ config }) {
  // 动态加载传感器实体
  const sensorEntities = config.map(room => {
    const sensors = Object.entries(room.sensors).reduce((acc, [type, sensor]) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const entity = useEntity(sensor.entity_id);
      acc[type] = {
        ...sensor,
        entity,
      };
      return acc;
    }, {});

    return {
      ...room,
      sensors,
    };
  });

  const { theme } = useTheme();

  return (
    <BaseCard
      title="环境监测"
      icon={mdiThermometer}
      iconColor={theme === 'dark' ? 'var(--color-text-primary)' : '#4FC3F7'}
    >
      <div className="sensor-data">
        {sensorEntities.map(room => (
          <div key={room.id} className="room-sensor">
            <div className="room-name">{room.name}</div>
            <div className="sensor-items">
              {Object.entries(room.sensors).map(([type, sensor]) => (
                <div key={type} className="sensor-item">
                  <Icon 
                    className="sensor-icon"
                    path={ICON_MAP[type]} 
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