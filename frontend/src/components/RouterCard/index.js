import React from 'react';
import {
  mdiRouterNetwork,
  mdiTemperatureCelsius,
  mdiClock,
  mdiAccountMultiple,
  mdiEthernet,
  mdiIpNetwork,
} from '@mdi/js';
import { useLanguage } from '../../i18n/LanguageContext';
import BaseCard from '../BaseCard';
import './style.css';
import { useEntity } from '@hakit/core';
import { safeParseFloat, safeGetState } from '../../utils/helper';
import ServerInfoRow from '../ServerInfoRow';

/**
 * Renders a router performance card displaying key status metrics.
 *
 * This functional component maps over provided router configuration details to retrieve and format performance data such as CPU usage, memory usage, WAN speeds, online device count, network connections, CPU temperature, public IP, and uptime. It then displays these metrics within a base card along with a server information row.
 *
 * @param {Object} config - Configuration for the router card.
 * @param {boolean} config.titleVisible - Determines whether the card title is visible.
 * @param {string} [config.title] - Custom title for the card; defaults to a translated title if omitted.
 * @param {Object} config.router - Object mapping metric keys to their respective feature configurations.
 *
 * @returns {JSX.Element} A React element representing the router performance and status card.
 */
function RouterCard({ config }) {
  const titleVisible = config.titleVisible;
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
  const cpuUsage = safeParseFloat(entities.cpuUsage?.state).toFixed(1);
  const memoryUsage = safeParseFloat(entities.memoryUsage?.state).toFixed(1);
  const wanDownloadSpeed = safeParseFloat(entities.wanDownloadSpeed?.state).toFixed(2);
  const wanUploadSpeed = safeParseFloat(entities.wanUploadSpeed?.state).toFixed(2);
  const onlineUsers = safeGetState(entities.onlineUsers);
  const networkConnections = safeGetState(entities.networkConnections);
  const cpuTemp = safeGetState(entities.cpuTemp);
  const wanIp = safeGetState(entities.wanIp, '-');
  const uptime = safeGetState(entities.uptime);

  const serverInfoItems = [
    {
      icon: mdiAccountMultiple,
      label: t('router.metrics.onlineDevices'),
      value: onlineUsers,
    },
    {
      icon: mdiEthernet,
      label: t('router.metrics.connections'),
      value: networkConnections,
    },
    {
      icon: mdiTemperatureCelsius,
      label: t('router.metrics.cpuTemp'),
      value: `${cpuTemp}°C`,
    },
    {
      icon: mdiIpNetwork,
      label: t('router.metrics.publicIp'),
      value: wanIp,
    },
    {
      icon: mdiClock,
      label: t('router.metrics.uptime'),
      value: uptime,
    },
  ];

  return (
    <BaseCard
      title={config.title || t('cardTitles.router')}
      icon={mdiRouterNetwork}
      titleVisible={titleVisible}
    >
      <ServerInfoRow cpuUsage={cpuUsage} memoryUsage={memoryUsage} uploadSpeed={wanUploadSpeed} downloadSpeed={wanDownloadSpeed} title={config.router?.routerName} serverInfoItems={serverInfoItems} />
  
    </BaseCard>
  );
}

export default RouterCard; 