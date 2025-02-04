import React from 'react';
import { mdiWhiteBalanceSunny } from '@mdi/js';
import { useEntity } from '@hakit/core';
import BaseCard from '../BaseCard';
import './style.css';

function IlluminanceCard({ config }) {
  const illuminanceSensors = Array.isArray(config) ? config : [config];

  return (
    <BaseCard
      title="光照传感器"
      icon={mdiWhiteBalanceSunny}
      iconColor="var(--color-warning)"
    >
      <div className="illuminance-sensors">
        {illuminanceSensors.map((sensorConfig, index) => {
          const { entity_id, name } = sensorConfig;
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const { state } = useEntity(entity_id);
          
          return (
            <div key={entity_id} className="illuminance-sensor">
              <div className="sensor-name">{name || entity_id}</div>
              <div className="sensor-value">
                <span className="value">{state}</span>
                <span className="unit">lux</span>
              </div>
            </div>
          );
        })}
      </div>
    </BaseCard>
  );
}

export default IlluminanceCard; 