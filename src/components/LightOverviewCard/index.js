import React from 'react';
import { mdiHomeFloorG } from '@mdi/js';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';
import BaseCard from '../BaseCard';
import FloorPlan from './FloorPlan';
import './style.css';
import { useEntity } from '@hakit/core';
import { notification } from 'antd';

function LightOverviewCard({ config }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const debugMode = localStorage.getItem('debugMode') === 'true';

  if (!config || !config.rooms) {
    console.warn('LightOverviewCard: Missing config or rooms');
    return null;
  }

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
      if (debugMode) {
        notification.error({
          message: t('lightOverview.loadError'),
          description: `${t('lightOverview.loadErrorDesc')} ${room.entity_id}`,
          placement: 'topRight',
          duration: 3,
          key: 'LightOverviewCard',
        });
      }
      return {
        ...room,
        entity: { state: null, error: true },
      };
    }
  });

  const lightStates = {
    background: config.background || '',
    rooms: lightEntities
  };

  return (
    <BaseCard
      title={config.title || t('cardTitles.lightOverview')}
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