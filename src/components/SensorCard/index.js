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
import { notification } from 'antd';

// 图标映射
const ICON_MAP = {
  mdiThermometer,
  mdiWaterPercent,
};

function SensorCard({ config }) {
  const { theme } = useTheme();
  
  // 检查配置是否存在
  if (!config || !config.sensors) {
    return (
      <BaseCard
        title="温湿度传感器"
        icon={mdiThermometer}
        iconColor={theme === 'dark' ? 'var(--color-text-primary)' : '#4FC3F7'}
      >
        <div className="sensor-data">
          配置信息不完整
        </div>
      </BaseCard>
    );
  }

  // 确保 config.sensors 是数组
  const sensorGroups = Array.isArray(config.sensors) ? config.sensors : [];

  // 动态加载传感器实体
  const sensorEntities = sensorGroups.map(group => {
    const sensors = Object.entries(group.sensors).reduce((acc, [type, sensor]) => {
      try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const entity = useEntity(sensor.entity_id);
        acc[type] = {
          ...sensor,
          entity,
        };
      } catch (error) {
        console.error(`加载传感器实体 ${sensor.entity_id} 失败:`, error);
        notification.error({
          message: '温湿度传感器卡片加载失败',
          description: `传感器 ${sensor.name || sensor.entity_id} 加载失败: ${error.message}`,
          placement: 'topRight',
          duration: 3,
          key: 'SensorCard',
        });
        acc[type] = {
          ...sensor,
          entity: { state: null, error: true },
        };
      }
      return acc;
    }, {});

    return {
      ...group,
      sensors,
    };
  });

  // 安全获取传感器值
  const getSensorValue = (sensor) => {
    if (!sensor.entity || sensor.entity.error || 
        sensor.entity.state === undefined || sensor.entity.state === null) {
      return '- -';
    }
    const unit = sensor.entity.attributes?.unit_of_measurement || '';
    return `${sensor.entity.state} ${unit}`;
  };

  return (
    <BaseCard
      title="温湿度传感器"
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
                    path={ICON_MAP[sensor.icon] || mdiThermometer} 
                    size={1} 
                    color="var(--color-text-primary)" 
                  />
                  <div className="sensor-info">
                    <span className="label">{sensor.name}</span>
                    <span className="value">
                      {getSensorValue(sensor)}
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