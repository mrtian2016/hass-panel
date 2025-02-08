import React from 'react';
import { useEntity } from '@hakit/core';
import { mdiWaterPump } from '@mdi/js';
import BaseCard from '../BaseCard';
import './style.css';

function WaterPurifierCard({ config }) {
  const temperature = useEntity(config.waterpuri.temperature.entity_id);
  const tdsIn = useEntity(config.waterpuri.tds_in.entity_id);
  const tdsOut = useEntity(config.waterpuri.tds_out.entity_id);
  const ppFilterLife = useEntity(config.waterpuri.pp_filter_life.entity_id);
  const roFilterLife = useEntity(config.waterpuri.ro_filter_life.entity_id);
  const status = useEntity(config.waterpuri.status.entity_id);
  

 

  return (
    <BaseCard
      title="米家净水器 800G"
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
            <span>净水TDS</span>
            <span className={tdsOut?.state < 50 ? 'good' : 'warning'}>
              {tdsOut?.state < 50 ? '纯度高' : '纯度低'}
            </span>
          </div>
          <div className="water-info">
            <div className="info-item">
              <span className="label">进水水温:</span>
              <span className="value">{temperature?.state || '0'}°C</span>
            </div>
            <div className="info-item">
              <span className="label">自来水TDS:</span>
              <span className="value">{tdsIn?.state || '0'}</span>
            </div>
          </div>
        </div>

        <div className="filter-status">
          <div className="filter-item">
            <div className="filter-number">1</div>
            <div className="filter-info">
              <div className="filter-name">PPC复合滤芯</div>
              <div className="filter-life-bar">
                <div 
                  className="life-remaining" 
                  style={{width: `${ppFilterLife?.state || 0}%`}}
                />
              </div>
              <div className="life-percentage">{ppFilterLife?.state || 0}%</div>
            </div>
          </div>

          <div className="filter-item">
            <div className="filter-number">2</div>
            <div className="filter-info">
              <div className="filter-name">RO反渗透滤芯</div>
              <div className="filter-life-bar">
                <div 
                  className="life-remaining" 
                  style={{width: `${roFilterLife?.state || 0}%`}}
                />
              </div>
              <div className="life-percentage">{roFilterLife?.state || 0}%</div>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>
  );
}

export default WaterPurifierCard; 