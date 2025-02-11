import React from 'react';
import { mdiWhiteBalanceSunny } from '@mdi/js';
import { useEntity } from '@hakit/core';
import { useLanguage } from '../../i18n/LanguageContext';
import BaseCard from '../BaseCard';
import './style.css';

function IlluminanceCard({ config }) {
  const { t } = useLanguage();
  // 从 config.sensors 获取传感器列表
  const sensors = Array.isArray(config.sensors) ? config.sensors : [];

  return (
    <BaseCard
      title={config.title || t('cardTitles.illuminance')}
      icon={mdiWhiteBalanceSunny}
      iconColor="var(--color-warning)"
    >
      <div className="illuminance-sensors">
        {sensors.map((sensor) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const { state, attributes, custom } = useEntity(sensor.entity_id, {returnNullIfNotFound: true});
          if (!state) {
            return (
              <div key={sensor.entity_id} className="illuminance-sensor">
                {sensor.name || attributes?.friendly_name || sensor.entity_id}
                {t('illuminance.loadFailed')}
              </div>
            );
          }
          console.log(custom);

          
          return (
            <div key={sensor.entity_id} className="illuminance-sensor">
              <div className="sensor-name">{sensor.name || attributes?.friendly_name || sensor.entity_id}</div>
              <div className="sensor-value">
                <span className="value">{state}</span>
                <span className="unit">{t('illuminance.unit')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </BaseCard>
  );
}

export default IlluminanceCard; 