import React from 'react';
import Icon from '@mdi/react';
import {
  mdiRouterNetwork,
  mdiTemperatureCelsius,
  // mdiCpu64Bit,
  mdiClock,
  mdiAccountMultiple,
  mdiEthernet,
  mdiIpNetwork,
  mdiDownload,
  mdiUpload,
} from '@mdi/js';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';
import BaseCard from '../BaseCard';
import './style.css';
import { useEntity } from '@hakit/core';
import { safeParseFloat, safeGetState } from '../../utils/helper';
function CircularProgress({ value, label, color = 'var(--color-primary)' }) {
  // 使用相对单位定义尺寸
  const viewBoxSize = 200;  // 用于 SVG viewBox
  const strokeWidth = viewBoxSize * 0.08;  // 笔画宽度设为 viewBox 的 6%
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



function RouterCard({ config }) {
  console.log(config);
  const titleVisible = config.titleVisible;
  const { theme } = useTheme();
  const { t } = useLanguage();
  const routerEntities = Object.entries(config.router).map(([key, feature]) => ({
    key,
    ...feature,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    entity: feature.entity_id ? useEntity(feature.entity_id, { returnNullIfNotFound: true }) : null,
  }));

  // 将 routerEntities 数组转换为以 key 为键的对象
  const entities = routerEntities.reduce((acc, curr) => {
    acc[curr.key] = curr.entity;
    return acc;
  }, {});

  // 使用安全解析函数处理所有数值
  const cpuUsage = safeParseFloat(entities.cpuUsage?.state);
  const memoryUsage = safeParseFloat(entities.memoryUsage?.state);
  const wanDownloadSpeed = safeParseFloat(entities.wanDownloadSpeed?.state).toFixed(2);
  const wanUploadSpeed = safeParseFloat(entities.wanUploadSpeed?.state).toFixed(2);
  const onlineUsers = safeGetState(entities.onlineUsers);
  const networkConnections = safeGetState(entities.networkConnections);
  const cpuTemp = safeGetState(entities.cpuTemp);
  const wanIp = safeGetState(entities.wanIp, '-');
  const uptime = safeGetState(entities.uptime);

  return (
    <BaseCard
      title={config.title || t('cardTitles.router')}
      icon={mdiRouterNetwork}
      iconColor={theme === 'dark' ? 'var(--color-text-primary)' : '#4FC3F7'}
      titleVisible={titleVisible}
    >
      <div className="router-data">
        {(Boolean(cpuUsage) || Boolean(memoryUsage)) && <div className="usage-section">
          <CircularProgress value={cpuUsage} label="CPU" />
          <CircularProgress value={memoryUsage} label={t('router.memory')} />
        </div>}

        <div className="metrics-section">
          <div className="network-speeds">
             <div className="speed-row">
              <div className="speed-item">
                <Icon path={mdiUpload} size={0.8} />
                <span className="speed-value">
                  {wanUploadSpeed}<span> {t('router.unit.speed')}</span>
                </span>
              </div>
              <div className="speed-item">
                <Icon path={mdiDownload} size={0.8} />
                <span className="speed-value">
                  {wanDownloadSpeed}<span> {t('router.unit.speed')}</span>
                </span>
              </div>
            </div>
            <div className="divider"></div>
            {Boolean(onlineUsers) && <div className="speed-item">
              <div className="metric-label">
                <Icon path={mdiAccountMultiple} size={0.8} />
                <span className="label">{t('router.metrics.onlineDevices')}</span>
              </div>
              <span>{onlineUsers}</span>
            </div>}
            
            {Boolean(networkConnections) && <div className="speed-item">
              <div className="metric-label">
                <Icon path={mdiEthernet} size={0.8} />
                <span className="label">{t('router.metrics.connections')}</span>
              </div>
              <span>{networkConnections}</span>
            </div>}
            {Boolean(cpuTemp) && <div className="speed-item">
              <div className="metric-label">
                <Icon path={mdiTemperatureCelsius} size={0.8} />
                <span className="label">{t('router.metrics.cpuTemp')}</span>
              </div>
              <span>{cpuTemp}{t('router.unit.temp')}</span>
            </div>}
            {Boolean(wanIp !== '-') && <div className="speed-item">
              <div className="metric-label">
                <Icon path={mdiIpNetwork} size={0.8} />
                <span className="label">{t('router.metrics.publicIp')}</span>
              </div>
              <span>{wanIp}</span>
            </div>}
            {Boolean(uptime) && <div className="speed-item">
              <div className="metric-label">
                <Icon path={mdiClock} size={0.8} />
                <span className="label">{t('router.metrics.uptime')}</span>
              </div>
              <span>{uptime}</span>
            </div>}
          </div>
        </div>
      </div>
    </BaseCard>
  );
}

export default RouterCard; 