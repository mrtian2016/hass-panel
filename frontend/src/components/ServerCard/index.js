import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiNas,
  mdiHarddisk,
  mdiDotsHorizontal,
  mdiServer,
  mdiClock,
  mdiCpu64Bit,
  mdiTemperatureCelsius
} from '@mdi/js';
import { useTheme } from '../../theme/ThemeContext';
import BaseCard from '../BaseCard';
import Modal from '../Modal';
import './style.css';
import { useEntity } from '@hakit/core';
import { notification} from 'antd';
import { useLanguage } from '../../i18n/LanguageContext';
import { safeParseFloat, safeGetState } from '../../utils/helper';
import ServerInfoRow from '../ServerInfoRow';
function calculateDaysSince(dateTimeString) {
  if (!dateTimeString || dateTimeString === '-') return '-';

  try {
    // 解析日期时间字符串
    let bootTime = new Date(dateTimeString);
    
    // 检查日期是否有效
    if (isNaN(bootTime.getTime())) {
      console.error('无效的日期格式:', dateTimeString);
      return dateTimeString;
    }
    
    // 检查日期是否在未来
    const now = new Date();
    if (bootTime > now) {
      // 如果日期在未来，可能是时区问题，尝试调整
      bootTime = new Date(bootTime.getTime() - 8 * 60 * 60 * 1000);
      
      // 如果调整后仍在未来，返回特殊消息
      if (bootTime > now) {
        return '时间未到';
      }
    }
    
    const timeDiff = now - bootTime;
    
    // 确保时间差为正数
    if (timeDiff < 0) {
      return '刚刚启动';
    }
    
    // 计算天数、小时和分钟
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    // 根据时间长短返回不同格式
    if (days > 0) {
      return `${days}天${hours}小时${minutes}分钟`;
    } else if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    } else if (minutes > 0) {
      return `${minutes}分钟`;
    } else {
      return '刚刚启动';
    }
  } catch (error) {
    console.error('计算开机时间失败:', error);
    return dateTimeString;
  }
}

function PVECard({ config }) {
  const titleVisible = config.titleVisible;
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [showDriveModal, setShowDriveModal] = useState(false);
  const debugMode = localStorage.getItem('debugMode') === 'true';
  let entities = {};
  console.log(config);
  const serverName = config.server?.serverName;
  console.log(config,serverName);
  try {
    const mainEntities = Object.entries(config.server?.main).map(([key, feature]) => ({
      key,
      ...feature,
      // eslint-disable-next-line react-hooks/rules-of-hooks
      entity: useEntity(feature.entity_id, { returnNullIfNotFound: true }),
    }));
    console.log(mainEntities);
    entities = mainEntities.reduce((acc, curr) => {
      acc[curr.key] = curr.entity;
      return acc;
    }, {});
  } catch (error) {
    if (debugMode) {
      notification.error({
        message: t('server.loadError'),
        description: t('server.loadErrorDesc') + error.message,
        placement: 'topRight',
        duration: 3,
        key: 'NASCard',
      });
    }
    return (
      <BaseCard
        title={t('cardTitles.server')}
        icon={mdiNas}
        iconColor={theme === 'dark' ? 'var(--color-text-primary)' : '#4FC3F7'}
      >
        {t('server.checkConfig')}, {error.message}
      </BaseCard>
    );
  }

  const cpuUsage = safeParseFloat(entities.cpuUsage?.state).toFixed(1);
  const memoryUsage = safeParseFloat(entities.memoryUsage?.state).toFixed(1);
  const downloadSpeed = (safeParseFloat(entities.downloadSpeed?.state)).toFixed(2);
  const uploadSpeed = (safeParseFloat(entities.uploadSpeed?.state)).toFixed(2);

  // 定义服务器信息项
  const serverInfoItems = [
    {
      icon: mdiTemperatureCelsius,
      label: t('server.labels.cpuTemp'),
      value: `${safeGetState(entities.cpuTemp, '0')}°C`
    },
    {
      icon: mdiCpu64Bit,
      label: t('server.labels.threads'),
      value: safeGetState(entities.threads)
    },
    {
      icon: mdiClock,
      label: t('server.labels.uptime'),
      value: calculateDaysSince(safeGetState(entities.uptime, '-'))
    }
  ];

  return (
    <>
      <BaseCard
        title={config.title || t('cardTitles.server')}
        icon={mdiServer}
        iconColor={theme === 'dark' ? 'var(--color-text-primary)' : '#333'}
        titleVisible={titleVisible}
        
      >
        <ServerInfoRow cpuUsage={cpuUsage} memoryUsage={memoryUsage} uploadSpeed={uploadSpeed} downloadSpeed={downloadSpeed} title={serverName} serverInfoItems={serverInfoItems} />
        
      </BaseCard>

      <Modal
        visible={showDriveModal}
        onClose={() => setShowDriveModal(false)}
        title={t('server.deviceStatus')}
        width="860px"
      >
        <div className="pve-drive-modal-content">

          <div className="pve-drive-section">
            <div className="pve-section-header">{t('server.storage.diskStatus')}</div>
            <div className="pve-drive-grid">
              {config.server?.drives?.map((drive, index) => {
                let driveStatus = null;
                let driveTemp = null;
                let drivePowerOnTime = null;
                let drivePowerCycleCount = null;
                let driveDiskSize = null;

                try {
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  driveStatus = useEntity(drive.status?.entity_id, { returnNullIfNotFound: true });
                  console.log(driveStatus);
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  driveTemp = useEntity(drive.temperature?.entity_id, { returnNullIfNotFound: true });
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  drivePowerOnTime = useEntity(drive.powerOnTime?.entity_id, { returnNullIfNotFound: true });
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  drivePowerCycleCount = useEntity(drive.powerCycleCount?.entity_id, { returnNullIfNotFound: true });
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  driveDiskSize = useEntity(drive.diskSize?.entity_id, { returnNullIfNotFound: true });

                  console.log(driveDiskSize);
                } catch (error) {
                  if (debugMode) {
                    notification.error({
                      message: t('server.loadError'),
                      description: t('server.loadErrorDesc') + (drive.name || '') + ' - ' + error.message,
                      placement: 'topRight',
                      duration: 3,
                    });
                  }
                  return null;
                }

                return (
                  <div key={index} className="pve-drive-item">
                    <div className="pve-drive-header">
                      <div className="pve-drive-title">
                        <Icon path={mdiHarddisk} size={0.8} className="pve-drive-icon" />
                        <span className="pve-drive-name">{drive.name}</span>
                        {driveDiskSize && (
                          <span className="pve-drive-size">({safeParseFloat(driveDiskSize.state, '0').toFixed(2)} {driveDiskSize?.attributes?.unit_of_measurement})</span>
                        )}
                      </div>
                      <div className="pve-drive-status-container">
                        <span className={`pve-drive-status ${safeGetState(driveStatus, 'unknown').toLowerCase()}`}>
                          {safeGetState(driveStatus, t('server.status.unknown')) === 'off' ? t('server.status.normal') : t('server.status.abnormal')}
                        </span>
                        {driveTemp && (
                          <span className="pve-drive-temperature">{safeGetState(driveTemp, '0')}°C</span>
                        )}
                      </div>
                    </div>

                    <div className="pve-drive-details">
                      {drivePowerOnTime && (
                        <div className="pve-drive-detail-item">
                          <span className="pve-detail-label">{t('server.labels.powerOnTime')}</span>
                          <span className="pve-detail-value">{safeGetState(drivePowerOnTime, '0')} {t('server.labels.unit.hours')}</span>
                        </div>
                      )}
                      {drivePowerCycleCount && (
                        <div className="pve-drive-detail-item">
                          <span className="pve-detail-label">{t('server.labels.powerCycleCount')}</span>
                          <span className="pve-detail-value">{safeGetState(drivePowerCycleCount, '0')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default PVECard; 