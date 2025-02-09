import React, { useState } from 'react';
import Icon from '@mdi/react';
import { 
  mdiNas,
  mdiHarddisk,
  mdiDownload,
  mdiUpload,
  mdiDotsHorizontal
} from '@mdi/js';
import { useTheme } from '../../theme/ThemeContext';
import BaseCard from '../BaseCard';
import Modal from '../Modal';
import './style.css';
import { useEntity } from '@hakit/core';

function CircularProgress({ value, label, color = 'var(--color-primary)' }) {
  const viewBoxSize = 200;  // 用于 SVG viewBox
  const strokeWidth = viewBoxSize * 0.08;  // 笔画宽度设为 viewBox 的 8%
  const radius = viewBoxSize / 2;  // 半径为 viewBox 的一半
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="circular-progress-container">
      <div className="circular-progress">
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          width="100%"
          height="100%"
        >
          <circle
            stroke="var(--color-border)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="progress-content">
          <span className="progress-value">{value}%</span>
        </div>
      </div>
      <span className="progress-label">{label}</span>
    </div>
  );
}

function NASCard({ config }) {
  const { theme } = useTheme();
  const [showDriveModal, setShowDriveModal] = useState(false);
  let entities = {};
  try {

    const mainEntities = Object.entries(config.syno_nas?.main).map(([key, feature]) => ({
      key,
      ...feature,
      // eslint-disable-next-line react-hooks/rules-of-hooks
      entity: useEntity(feature.entity_id),
    }));

    entities = mainEntities.reduce((acc, curr) => {
      acc[curr.key] = curr.entity;
      return acc;
    }, {});
  } catch (error) {
    console.error('NASCard 组件错误:', error);
    return <BaseCard title="NAS监控" icon={mdiNas} iconColor={theme === 'dark' ? 'var(--color-text-primary)' : '#4FC3F7'} >
      出现错误，请检查配置，{error.message}
    </BaseCard>
  }

  const cpuUsage = parseFloat(entities.cpuUsage?.state || 0);
  const memoryUsage = parseFloat(entities.memoryUsage?.state || 0);
  const downloadSpeed = (parseFloat(entities.downloadSpeed?.state || 0) / 1024).toFixed(2);
  const uploadSpeed = (parseFloat(entities.uploadSpeed?.state || 0) / 1024).toFixed(2);

  return (
    <>
      <BaseCard
        title="NAS监控"
        icon={mdiNas}
        iconColor={theme === 'dark' ? 'var(--color-text-primary)' : '#4FC3F7'}
        headerRight={
          <div className="header-right" onClick={() => setShowDriveModal(true)} style={{ cursor: 'pointer' }}>
            <Icon path={mdiDotsHorizontal} size={0.8} />
          </div>
        }
      >
        <div className="nas-data">
          <div className="usage-section">
            <CircularProgress value={cpuUsage} label="CPU" />
            <CircularProgress value={memoryUsage} label="内存" />
          </div>
          
          <div className="metrics-section">
            <div className="network-speeds">
              <div className="speed-row">
                <div className="speed-item">
                  <Icon path={mdiUpload} size={0.8} />
                  <span className="speed-value">{uploadSpeed}<span> MB/s</span></span>
                </div>
                <div className="speed-item">
                  <Icon path={mdiDownload} size={0.8} />
                  <span className="speed-value">{downloadSpeed}<span> MB/s</span></span>
                </div>
              </div>
              <div className="divider"></div>
              
              <div className="volume-header">存储池状态</div>
              {config.syno_nas?.volumes?.map((volume, index) => {
                
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const volumeStatus = useEntity(volume.status.entity_id);
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const volumeUsage = useEntity(volume.usage.entity_id);
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const volumeUsagePercent = useEntity(volume.usagePercent.entity_id);
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const volumeTemp = useEntity(volume.avgTemperature.entity_id);
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const volumeTotal = useEntity(volume.total.entity_id);
                
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
                            {volumeStatus?.state === "normal" ? "正常" : volumeStatus?.state || '未知'}
                          </span>
                          <span className="status-divider">|</span>
                          <span className="volume-temp">{volumeTemp?.state || '0'}°C</span>
                        </div>
                      </div>
                      <div className="volume-info">
                        <div className="volume-details">
                          {(() => {
                            const usedSpace = parseFloat(volumeUsage?.state || 0);
                            const totalSpace = parseFloat(volumeTotal?.state || 0);
                            
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
                              style={{ width: `${volumeUsagePercent?.state || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </BaseCard>

      <Modal 
        visible={showDriveModal} 
        onClose={() => setShowDriveModal(false)}
        title="存储设备状态"
        width="600px"
      >
        <div className="drive-modal-content">
          <div className="volume-header">硬盘状态</div>
          {config.syno_nas?.drives?.map((drive, index) => {  
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const driveStatus = useEntity(drive.status.entity_id);
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const driveTemp = drive.temperature ? useEntity(drive.temperature.entity_id) : null;
            
            return (
              <React.Fragment key={index}>
                <div className="speed-item">
                  <div className="metric-label">
                    <Icon path={mdiHarddisk} size={0.8} />
                    <span className="label">{drive.name}</span>
                  </div>
                  <div className="drive-status">
                    <span>{driveStatus?.state === "normal" ? "正常" : "异常" || '未知'}</span>
                    {driveTemp && (
                      <span className="drive-temp">{driveTemp.state || '0'}°C</span>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {config.syno_nas?.m2ssd && config.syno_nas?.m2ssd.length > 0 && (
            <>
              <div className="divider"></div>
              <div className="volume-header">M.2 SSD状态</div>
              {config.syno_nas?.m2ssd?.map((drive, index) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const driveStatus = useEntity(drive.status.entity_id);
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const driveTemp = useEntity(drive.temperature.entity_id);
                
                return (
                  <React.Fragment key={index}>
                    <div className="speed-item">
                      <div className="metric-label">
                        <Icon path={mdiHarddisk} size={0.8} />
                        <span className="label">{drive.name}</span>
                      </div>
                      <div className="drive-status">
                        <span>{driveStatus?.state === "normal" ? "正常" : "异常" || '未知'}</span>
                        <span className="drive-temp">{driveTemp?.state || '0'}°C</span>
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