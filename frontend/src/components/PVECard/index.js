import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiNas,
  mdiHarddisk,
  mdiDotsHorizontal,
  mdiServer,
  mdiAccountGroup,
  mdiLanConnect,
  mdiPlayCircleOutline,
  mdiPowerStandby,
  mdiRefreshCircle,
  mdiStopCircleOutline,
  mdiClockOutline,
  mdiClock,
  mdiTemperatureCelsius
} from '@mdi/js';
import { useTheme } from '../../theme/ThemeContext';
import BaseCard from '../BaseCard';
import Modal from '../Modal';
import './style.css';
import { useEntity } from '@hakit/core';
import { notification, Progress, message } from 'antd';
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
  const nodeName = config.pve_server.nodeName;
  const optionClickHandler = (entity, option, isRunning) => {
    switch (option) {
      case 'start':
        message.success(t('pve_server.vms.actions.startSuccess'));
        entity.service.press();
        break;
      case 'stop':
        message.success(t('pve_server.vms.actions.stopSuccess'));
        entity.service.press();
        break;
      case 'restart':
        message.success(t('pve_server.vms.actions.restartSuccess'));
        entity.service.press();
        break;
      case 'shutdown':
        message.success(t('pve_server.vms.actions.shutdownSuccess'));
        entity.service.press();
        break;
      default:
        break;
    }
  }
  try {
    const mainEntities = Object.entries(config.pve_server?.main).map(([key, feature]) => ({
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
        message: t('pve_server.loadError'),
        description: t('pve_server.loadErrorDesc') + error.message,
        placement: 'topRight',
        duration: 3,
        key: 'NASCard',
      });
    }
    return (
      <BaseCard
        title={t('cardTitles.pve_server')}
        icon={mdiNas}
        iconColor={theme === 'dark' ? 'var(--color-text-primary)' : '#4FC3F7'}
      >
        {t('pve_server.checkConfig')}, {error.message}
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
      icon: mdiAccountGroup,
      label: t('pve_server.labels.vmCount'),
      value: safeGetState(entities.vmCount, '0')
    },
    {
      icon: mdiLanConnect,
      label: t('pve_server.labels.containerCount'),
      value: safeGetState(entities.containerCount, '0')
    },
    {
      icon: mdiTemperatureCelsius,
      label: t('pve_server.labels.cpuTemp'),
      value: `${safeGetState(entities.cpuTemp, '0')}°C`
    },
    {
      icon: mdiServer,
      label: t('pve_server.labels.status'),
      value: safeGetState(entities.status, t('pve_server.status.unknown')) === 'on' ? t('pve_server.status.normal') : t('pve_server.status.abnormal'),
      className: `pve-status-${safeGetState(entities.status, 'unknown').toLowerCase()}`
    },
    {
      icon: mdiClock,
      label: t('pve_server.labels.uptime'),
      value: calculateDaysSince(safeGetState(entities.lastBoot, '-'))
    }
  ];

  return (
    <>
      <BaseCard
        title={config.title || t('cardTitles.pve_server')}
        icon={mdiServer}
        iconColor={theme === 'dark' ? 'var(--color-text-primary)' : '#333'}
        titleVisible={titleVisible}
        headerRight={
          <div className="pve-header-right" onClick={() => setShowDriveModal(true)} style={{ cursor: 'pointer' }}>
            <Icon path={mdiDotsHorizontal} size={0.8} />
          </div>
        }
      >
        <ServerInfoRow cpuUsage={cpuUsage} memoryUsage={memoryUsage} uploadSpeed={uploadSpeed} downloadSpeed={downloadSpeed} title={nodeName} serverInfoItems={serverInfoItems} />
        
      </BaseCard>

      <Modal
        visible={showDriveModal}
        onClose={() => setShowDriveModal(false)}
        title={t('pve_server.deviceStatus')}
        width="860px"
      >
        <div className="pve-drive-modal-content">
          <div className="pve-drive-section">
            <div className="pve-section-header">{t('pve_server.vms.title')}</div>
            <div className="pve-vm-grid">
              {config.pve_server?.vms?.map((vm, index) => {
           
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  const vmStatus = useEntity(vm.status?.entity_id || '', { returnNullIfNotFound: true });
                  
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  const vmCpuUsage = useEntity(vm.cpuUsage?.entity_id || '', { returnNullIfNotFound: true });
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  const vmMemoryUsage = useEntity(vm.memoryUsage?.entity_id || '', { returnNullIfNotFound: true });
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  const vmStartOption = useEntity(vm.startOption?.entity_id || '', { returnNullIfNotFound: true });
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  const vmStopOption = useEntity(vm.stopOption?.entity_id || '', { returnNullIfNotFound: true });
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  const vmRestartOption = useEntity(vm.restartOption?.entity_id || '', { returnNullIfNotFound: true });
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  const vmShutdownOption = useEntity(vm.shutdownOption?.entity_id || '', { returnNullIfNotFound: true });
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  const lastBoot = useEntity(vm.lastBoot?.entity_id || '', { returnNullIfNotFound: true });
                

                const vmCpuUsageValue = parseFloat(safeGetState(vmCpuUsage, '0')).toFixed(2);
                const vmMemoryUsageValue = parseFloat(safeGetState(vmMemoryUsage, '0')).toFixed(2);
                const running_status   =['running', 'on', 'started', 'started_at']
                const statusText = running_status.includes(safeGetState(vmStatus, '')) ?
                  t('pve_server.status.running') : t('pve_server.status.stopped');
                const isVmRunning = Boolean(running_status.find(status => safeGetState(vmStatus, '') === status));
                console.log(isVmRunning, 'vmStatus');

                return (
                  <div key={index} className="pve-vm-item">
                    <div className="pve-vm-header">
                      <div className="pve-vm-name">
                        <Icon path={mdiServer} size={0.8} className="pve-vm-name-icon" />
                        {vm.name}
                      </div>
                      <div className="pve-vm-actions">
                        {vmStartOption && (
                          <div className={`pve-vm-action-btn ${isVmRunning ? 'pve-disabled' : ''}`}
                            onClick={() => optionClickHandler(vmStartOption, 'start', isVmRunning)}
                            title={t('pve_server.vms.actions.start')}>
                            <Icon path={mdiPlayCircleOutline} size={0.8} />
                          </div>
                        )}
                        {vmShutdownOption && (
                          <div className={`pve-vm-action-btn ${!isVmRunning ? 'pve-disabled' : ''}`}
                            onClick={() => optionClickHandler(vmShutdownOption, 'shutdown', isVmRunning)}
                            title={t('pve_server.vms.actions.shutdown')}>
                            <Icon path={mdiPowerStandby} size={0.8} />
                          </div>
                        )}
                        {vmRestartOption && (
                          <div className={`pve-vm-action-btn ${!isVmRunning ? 'pve-disabled' : ''}`}
                            onClick={() => optionClickHandler(vmRestartOption, 'restart', isVmRunning)}
                            title={t('pve_server.vms.actions.restart')}>
                            <Icon path={mdiRefreshCircle} size={0.8} />
                          </div>
                        )}
                        {vmStopOption && (
                          <div className={`pve-vm-action-btn ${!isVmRunning ? 'pve-disabled' : ''}`}
                            onClick={() => optionClickHandler(vmStopOption, 'stop', isVmRunning)}
                            title={t('pve_server.vms.actions.stop')}>
                            <Icon path={mdiStopCircleOutline} size={0.8} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="pve-vm-status-row">
                      <div className={`pve-vm-status-badge`} style={{color: statusText === t('pve_server.status.running') ? 'var(--color-success)' : 'var(--color-error)'}}>
                        {statusText}
                      </div>
                      {isVmRunning && lastBoot && (
                        <div className="pve-vm-uptime">
                          <Icon path={mdiClockOutline} size={0.6} />
                          {calculateDaysSince(safeGetState(lastBoot, '-'))}
                        </div>
                      )}
                    </div>
                    <div className="pve-vm-usage-info">
                      <div className="pve-vm-usage-progress">
                        <div className="pve-vm-resource-info">
                          <span className="pve-vm-resource-label">CPU</span>
                          <span className="pve-vm-resource-value">{vmCpuUsageValue}%</span>
                        </div>
                        <Progress
                          percent={Number(vmCpuUsageValue)}
                          showInfo={false}
                          size="small"
                          strokeColor={'var(--color-primary)'}
                        />
                      </div>
                      <div className="pve-vm-usage-progress">
                        <div className="pve-vm-resource-info">
                          <span className="pve-vm-resource-label">{t('pve_server.labels.memory')}</span>
                          <span className="pve-vm-resource-value">{vmMemoryUsageValue}%</span>
                        </div>
                        <Progress
                          percent={Number(vmMemoryUsageValue)}
                          showInfo={false}
                          size="small"
                          strokeColor={'var(--color-primary)'}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {config.pve_server?.drives && (
            <div className="pve-drive-section">
              <div className="pve-section-header">{t('pve_server.storage.diskStatus')}</div>
              <div className="pve-drive-grid">
                {config.pve_server?.drives?.map((drive, index) => {
                let driveStatus = null;
                let driveTemp = null;
                let drivePowerOnTime = null;
                let drivePowerCycleCount = null;
                let driveDiskSize = null;

                try {
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  driveStatus = useEntity(drive.status?.entity_id, { returnNullIfNotFound: true });
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  driveTemp = useEntity(drive.temperature?.entity_id, { returnNullIfNotFound: true });
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  drivePowerOnTime = useEntity(drive.powerOnTime?.entity_id, { returnNullIfNotFound: true });
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  drivePowerCycleCount = useEntity(drive.powerCycleCount?.entity_id, { returnNullIfNotFound: true });
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  driveDiskSize = useEntity(drive.diskSize?.entity_id, { returnNullIfNotFound: true });

                } catch (error) {
                  if (debugMode) {
                    notification.error({
                      message: t('pve_server.loadError'),
                      description: t('pve_server.loadErrorDesc') + (drive.name || '') + ' - ' + error.message,
                      placement: 'topRight',
                      duration: 3,
                    });
                  }
                  return null;
                }

                return  (
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
                          {safeGetState(driveStatus, t('pve_server.status.unknown')) === 'off' ? t('pve_server.status.normal') : t('pve_server.status.abnormal')}
                        </span>
                        {driveTemp && (
                          <span className="pve-drive-temperature">{safeGetState(driveTemp, '0')}°C</span>
                        )}
                      </div>
                    </div>

                    <div className="pve-drive-details">
                      {drivePowerOnTime && (
                        <div className="pve-drive-detail-item">
                          <span className="pve-detail-label">{t('pve_server.labels.powerOnTime')}</span>
                          <span className="pve-detail-value">{safeGetState(drivePowerOnTime, '0')} {t('pve_server.labels.unit.hours')}</span>
                        </div>
                      )}
                      {drivePowerCycleCount && (
                        <div className="pve-drive-detail-item">
                          <span className="pve-detail-label">{t('pve_server.labels.powerCycleCount')}</span>
                          <span className="pve-detail-value">{safeGetState(drivePowerCycleCount, '0')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

export default PVECard; 