import { Progress } from 'antd';
import { Icon } from '@mdi/react';
import { mdiUpload, mdiDownload } from '@mdi/js';
import { useLanguage } from '../../i18n/LanguageContext';
import './style.css';
function ServerInfoCommon({ cpuUsage, memoryUsage, uploadSpeed, downloadSpeed }) {
  const { t } = useLanguage();
  return <>
  {(Boolean(cpuUsage)&&Boolean(memoryUsage))&&
    <div className="server-usage-section">
      <div className="server-progress-item">
        <Progress
          type="circle"
          percent={Number(cpuUsage)}
          strokeWidth={10}
          strokeColor={'var(--color-primary)'}
          format={(percent) => (
            <div className="server-progress-content">
              <span className="server-progress-value">{percent}%</span>
              <span className="server-progress-label">CPU</span>
            </div>
          )}
        />
      </div>
      <div className="server-progress-item">
        <Progress
          type="circle"
          percent={Number(memoryUsage)}
          strokeWidth={10}
          strokeColor={'var(--color-primary)'}
          format={(percent) => (
            <div className="server-progress-content">
              <span className="server-progress-value">{percent}%</span>
              <span className="server-progress-label">{t('pve_server.labels.memory')}</span>
            </div>
          )}
        />
      </div>
    </div>
    }
    <div className="server-metrics-section">
      <div className="server-network-speeds">
        <div className="server-speed-row">
          <div className="server-speed-item">
            <Icon path={mdiUpload} size={0.8} />
            <span className="server-speed-value">
              {uploadSpeed}<span> {t('nas.labels.unit.speed')}</span>
            </span>
          </div>
          <div className="server-speed-item">
            <Icon path={mdiDownload} size={0.8} />
            <span className="server-speed-value">
              {downloadSpeed}<span> {t('nas.labels.unit.speed')}</span>
            </span>
          </div>
        </div>
        <div className="server-divider"></div>
      </div>
    </div>
  </>;
}

export default ServerInfoCommon;
