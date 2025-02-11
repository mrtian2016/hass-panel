import React from 'react';
import { useEntity } from '@hakit/core';
import { mdiWaterPump } from '@mdi/js';
import { useLanguage } from '../../i18n/LanguageContext';
import BaseCard from '../BaseCard';
import './style.css';
import { notification } from 'antd';

function WaterPurifierCard({ config }) {
  const { t } = useLanguage();
  
  const temperature = useEntity(config.waterpuri?.temperature?.entity_id || '', {returnNullIfNotFound: true});
  const tdsIn = useEntity(config.waterpuri?.tds_in?.entity_id || '', {returnNullIfNotFound: true});
  const tdsOut = useEntity(config.waterpuri?.tds_out?.entity_id || '', {returnNullIfNotFound: true});
  const ppFilterLife = useEntity(config.waterpuri?.pp_filter_life?.entity_id || '', {returnNullIfNotFound: true});
  const roFilterLife = useEntity(config.waterpuri?.ro_filter_life?.entity_id || '', {returnNullIfNotFound: true});
  const status = useEntity(config.waterpuri?.status?.entity_id || '', {returnNullIfNotFound: true});

  if (!temperature || !tdsIn || !tdsOut || !ppFilterLife || !roFilterLife || !status) {
    notification.error({
      message: t('waterPurifier.loadError'),
      description: t('waterPurifier.loadErrorDesc') + 
        (config.waterpuri?.temperature?.entity_id || 
         config.waterpuri?.tds_in?.entity_id || 
         config.waterpuri?.tds_out?.entity_id || 
         config.waterpuri?.pp_filter_life?.entity_id || 
         config.waterpuri?.ro_filter_life?.entity_id || 
         config.waterpuri?.status?.entity_id),
      placement: 'topRight',
      duration: 3,
      key: 'WaterPurifierCard',
    });
  }

  return (
    <BaseCard
      title={config.title || t('cardTitles.waterpurifier')}
      icon={mdiWaterPump}
      iconColor="var(--color-primary)"
      headerRight={
        <div className="device-status">
          {status?.state}
        </div>
      }
    >
      <div className="water-purifier-content">
        <div className="tds-display">
          <div className="tds-value">{tdsOut?.state || '0'}</div>
          <div className="tds-label">
            <span>{t('waterPurifier.tds.pure')}</span>
            <span className={tdsOut?.state < 50 ? 'good' : 'warning'}>
              {tdsOut?.state < 50 
                ? t('waterPurifier.tds.purityHigh') 
                : t('waterPurifier.tds.purityLow')}
            </span>
          </div>
          <div className="water-info">
            <div className="info-item">
              <span className="label">{t('waterPurifier.temperature')}:</span>
              <span className="value">
                {temperature?.state || '0'}{t('waterPurifier.unit.temp')}
              </span>
            </div>
            <div className="info-item">
              <span className="label">{t('waterPurifier.tds.tap')}:</span>
              <span className="value">{tdsIn?.state || '0'}</span>
            </div>
          </div>
        </div>

        <div className="filter-status">
          <div className="filter-item">
            <div className="filter-number">1</div>
            <div className="filter-info">
              <div className="filter-name">{t('waterPurifier.filter.ppc')}</div>
              <div className="filter-life-bar">
                <div 
                  className="life-remaining" 
                  style={{width: `${ppFilterLife?.state || 0}%`}}
                />
              </div>
              <div className="life-percentage">
                {t('waterPurifier.filter.lifeRemaining').replace('%1', ppFilterLife?.state || 0)}
              </div>
            </div>
          </div>

          <div className="filter-item">
            <div className="filter-number">2</div>
            <div className="filter-info">
              <div className="filter-name">{t('waterPurifier.filter.ro')}</div>
              <div className="filter-life-bar">
                <div 
                  className="life-remaining" 
                  style={{width: `${roFilterLife?.state || 0}%`}}
                />
              </div>
              <div className="life-percentage">
                {t('waterPurifier.filter.lifeRemaining').replace('%1', roFilterLife?.state || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>
  );
}

export default WaterPurifierCard; 