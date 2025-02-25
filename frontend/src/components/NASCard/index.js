import React, { useState } from 'react';
import Icon from '@mdi/react';
import { 
  mdiNas,
  mdiHarddisk,
  mdiDotsHorizontal
} from '@mdi/js';
import { useTheme } from '../../theme/ThemeContext';
import BaseCard from '../BaseCard';
import Modal from '../Modal';
import './style.css';
import { useEntity } from '@hakit/core';
import { notification } from 'antd';
import { useLanguage } from '../../i18n/LanguageContext';
import { safeParseFloat, safeGetState } from '../../utils/helper';
import ServerInfoCommon from '../ServerInfoCommon';

function NASCard({ config }) {
  const titleVisible = config.titleVisible;
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [showDriveModal, setShowDriveModal] = useState(false);
  const debugMode = localStorage.getItem('debugMode') === 'true';
  let entities = {};
  try {
    const mainEntities = Object.entries(config.syno_nas?.main).map(([key, feature]) => ({
      key,
      ...feature,
      // eslint-disable-next-line react-hooks/rules-of-hooks
      entity: useEntity(feature.entity_id, { returnNullIfNotFound: true }),
    }));

    entities = mainEntities.reduce((acc, curr) => {
      acc[curr.key] = curr.entity;
      return acc;
    }, {});
  } catch (error) {
    if (debugMode) {
      notification.error({
        message: t('nas.loadError'),
        description: t('nas.loadErrorDesc') + error.message,
        placement: 'topRight',
        duration: 3,
        key: 'NASCard',
      });
    }
    return (
      <BaseCard 
        title={t('cardTitles.nas')} 
        icon={mdiNas} 
        iconColor={theme === 'dark' ? 'var(--color-text-primary)' : '#4FC3F7'}
      >
        {t('nas.checkConfig')}, {error.message}
      </BaseCard>
    );
  }

  const cpuUsage = safeParseFloat(entities.cpuUsage?.state);
  const memoryUsage = safeParseFloat(entities.memoryUsage?.state);
  const downloadSpeed = (safeParseFloat(entities.downloadSpeed?.state) / 1024).toFixed(2);
  const uploadSpeed = (safeParseFloat(entities.uploadSpeed?.state) / 1024).toFixed(2);

  return (
    <>
      <BaseCard
        title={config.title || t('cardTitles.nas')}
        icon={mdiNas}
        iconColor={theme === 'dark' ? 'var(--color-text-primary)' : '#4FC3F7'}
        titleVisible={titleVisible}
        headerRight={
          <div className="header-right" onClick={() => setShowDriveModal(true)} style={{ cursor: 'pointer' }}>
            <Icon path={mdiDotsHorizontal} size={0.8} />
          </div>
        }
      >
        <div className="nas-data">
          <ServerInfoCommon cpuUsage={cpuUsage} memoryUsage={memoryUsage} uploadSpeed={uploadSpeed} downloadSpeed={downloadSpeed} />
              
              <div className="volume-header">{t('nas.storage.poolStatus')}</div>
              {config.syno_nas?.volumes?.map((volume, index) => {
                let volumeStatus = null;
                let volumeUsage = null;
                let volumeUsagePercent = null;
                let volumeTemp = null;
                let volumeTotal = null;
                try {
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  volumeStatus = useEntity(volume.status.entity_id, { returnNullIfNotFound: true });
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  volumeUsage = useEntity(volume.usage.entity_id, { returnNullIfNotFound: true });
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  volumeUsagePercent = useEntity(volume.usagePercent.entity_id, { returnNullIfNotFound: true });
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  volumeTemp = useEntity(volume.avgTemperature.entity_id, { returnNullIfNotFound: true });
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  volumeTotal = useEntity(volume.total.entity_id, { returnNullIfNotFound: true });
                } catch (error) {
                  if (debugMode) {
                    notification.error({
                      message: t('nas.loadError'),
                      description: t('nas.loadErrorDesc') + (volume.name || volume.entity_id) + ' - ' + error.message,
                      placement: 'topRight',
                      duration: 3,
                      key: 'NASCard',
                    });
                  }
                  return <div>{t('nas.loadFailed')}</div>;
                }
                return (
                  <React.Fragment key={index}>
                    <div className="volume-item">
                      <div className="volume-header-row">
                        <div className="volume-name">
                          <Icon path={mdiHarddisk} size={0.8} />
                          <span className="label">{volume.name}</span>
                        </div>
                        <div className="volume-status-group">
                          <span className="volume-status">
                            {safeGetState(volumeStatus, t('nas.status.unknown')) === "normal" 
                              ? t('nas.status.normal') 
                              : t('nas.status.unknown')}
                          </span>
                          <span className="status-divider">|</span>
                          <span className="volume-temp">
                            {safeGetState(volumeTemp, '0')}{t('nas.labels.unit.temp')}
                          </span>
                        </div>
                      </div>
                      <div className="volume-info">
                        <div className="volume-details">
                          {(() => {
                            const usedSpace = safeParseFloat(volumeUsage?.state);
                            const totalSpace = safeParseFloat(volumeTotal?.state);
                            
                            const formatSpace = (space) => {
                              const v = (space * 1000 * 1000 * 1000 * 1000)/ 1024 / 1024 / 1024 / 1024;
                              if (v < 1) {
                                return `${(v * 1024).toFixed(1)} GB`;
                              }
                              return `${v.toFixed(1)} TB`;
                            };
                            
                            return (
                              <>
                                <span className="used-space">{formatSpace(usedSpace)}</span>
                                <span> / </span>
                                <span>{formatSpace(totalSpace)}</span>
                              </>
                            );
                          })()}
                        </div>
                        <div className="volume-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ width: `${safeParseFloat(volumeUsagePercent?.state)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
      </BaseCard>

      <Modal 
        visible={showDriveModal} 
        onClose={() => setShowDriveModal(false)}
        title={t('nas.storage.deviceStatus')}
        width="600px"
      >
        <div className="nas-drive-modal-content">
          <div className="volume-header">{t('nas.storage.diskStatus')}</div>
          {config.syno_nas?.drives?.map((drive, index) => {  
            let driveStatus = null;
            let driveTemp = null;
            try {
              // eslint-disable-next-line react-hooks/rules-of-hooks
              driveStatus = useEntity(drive.status.entity_id, { returnNullIfNotFound: true });
              // eslint-disable-next-line react-hooks/rules-of-hooks
              driveTemp = drive.temperature ? useEntity(drive.temperature.entity_id, { returnNullIfNotFound: true }) : null;
            } catch (error) {
              console.error(`加载NAS实体 ${drive.entity_id} 失败:`, error);
              if (debugMode) {
                notification.error({
                  message: t('nas.loadError'),
                  description: t('nas.loadErrorDesc') + (drive.name || drive.entity_id) + ' - ' + error.message,
                  placement: 'topRight',
                  duration: 3,
                  key: 'NASCard',
                });
              }
              return <div>{t('nas.loadFailed')}</div>
            }
            
            return (
              <React.Fragment key={index}>
                <div className="nas-drive-item">
                  <div className="nas-drive-metric-label">
                    <Icon path={mdiHarddisk} size={0.8} />
                    <span className="label">{drive.name}</span>
                  </div>
                  <div className="nas-drive-status">
                    <span>
                      {safeGetState(driveStatus, t('nas.status.unknown')) === "normal" 
                        ? t('nas.status.normal') 
                        : t('nas.status.abnormal')}
                    </span>
                    {driveTemp && (
                      <span className="nas-drive-temp">
                        {safeGetState(driveTemp, '0')}{t('nas.labels.unit.temp')}
                      </span>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {config.syno_nas?.m2ssd && config.syno_nas?.m2ssd.length > 0 && (
            <>
              <div className="nas-divider"></div>
              <div className="volume-header">{t('nas.storage.m2Status')}</div>
              {config.syno_nas?.m2ssd?.map((drive, index) => {
                let driveStatus = null;
                let driveTemp = null;
                try {
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  driveStatus = useEntity(drive.status.entity_id, { returnNullIfNotFound: true });
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  driveTemp = useEntity(drive.temperature.entity_id, { returnNullIfNotFound: true });
                } catch (error) {
                  console.error(`加载NAS实体 ${drive.entity_id} 失败:`, error);
                  if (debugMode) {
                    notification.error({
                      message: t('nas.loadError'),
                      description: t('nas.loadErrorDesc') + (drive.name || drive.entity_id) + ' - ' + error.message,
                      placement: 'topRight',
                      duration: 3,
                      key: 'NASCard',
                    });
                  }
                  return <div>{t('nas.loadFailed')}</div>
                }
                
                return (
                  <React.Fragment key={index}>
                    <div className="nas-drive-item">
                      <div className="nas-drive-metric-label">
                        <Icon path={mdiHarddisk} size={0.8} />
                        <span className="label">{drive.name}</span>
                      </div>
                      <div className="nas-drive-status">
                        <span>
                          {safeGetState(driveStatus, t('nas.status.unknown')) === "normal" 
                            ? t('nas.status.normal') 
                            : t('nas.status.abnormal')}
                        </span>
                        <span className="nas-drive-temp">
                          {safeGetState(driveTemp, '0')}{t('nas.labels.unit.temp')}
                        </span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </>
          )}
        </div>
      </Modal>
    </>
  );
}

export default NASCard; 