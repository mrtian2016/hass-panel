import { Icon } from '@mdi/react';
import React from 'react';
import { useState } from 'react';
import { mdiInformationOutline } from '@mdi/js';
import { useLanguage } from '../../i18n/LanguageContext';
import { compareVersions } from '../../utils/helper';
import { message, Button, Tooltip } from 'antd';
import './style.css';
function BottomInfo() {
  const { t } = useLanguage();
  const [versionInfo, setVersionInfo] = useState(null);
  const [latestVersion, setLatestVersion] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [debugMode, setDebugMode] = useState(() => {
    const localDebugMode = localStorage.getItem('debugMode');
    return localDebugMode === 'true';
  });
  // 添加获取版本信息的函数
  React.useEffect(() => {
    fetch('./version.json')
      .then(response => response.json())
      .then(data => {
        setVersionInfo(data);
      })
      .catch(error => {
        console.error('获取版本信息失败:', error);
      });
  }, []);


  // 修改检查更新的函数
  const checkUpdate = async () => {
    try {
      setIsChecking(true);
      const response = await fetch('https://api.github.com/repos/mrtian2016/hass-panel/releases/latest');
      const data = await response.json();
      if (data && data.tag_name) {
        // 只有当新版本号大于当前版本时才设置新版本
        if (compareVersions(data.tag_name, versionInfo?.version) > 0) {
          setLatestVersion({
            version: data.tag_name,
            updateTime: new Date().toISOString()
          });
          message.info(`${t('update.newVersion')}: ${data.tag_name}`);
        } else {
          message.success(t('update.latestVersion'));
          setLatestVersion(null);
        }
      }
    } catch (error) {
      console.error('检查更新失败:', error);
      message.error(t('update.checkFailed'));
    } finally {
      setIsChecking(false);
    }
  };
  // 添加执行更新的函数
  const handleUpdate = async () => {
    try {
      message.loading({ content: t('update.checking'), key: 'update' });
      const response = await fetch('./api/update');
      const result = await response.json();

      if (result.code === 200) {
        message.success({
          content: result.message,
          key: 'update',
          duration: 5
        });
        setTimeout(() => {
          message.loading({
            content: t('update.complete'),
            key: 'update'
          });
          window.location.reload();
        }, 3000);

      } else {
        message.error({
          content: `${t('update.failed')}: ${result.message}`,
          key: 'update',
          duration: 5
        });
      }
    } catch (error) {
      message.error({
        content: `${t('update.failed')}: ${error.message}`,
        key: 'update',
        duration: 5
      });
    }
  };

  return (
    <div className='bottom-buttons'>
        {versionInfo && (
          <div className="version-info">
            <Icon path={mdiInformationOutline} size={0.8} />
            <span>
              {t('currentVersion')}: {versionInfo.version}
              {latestVersion && compareVersions(latestVersion.version, versionInfo.version) > 0 ? (
                <Tooltip title={`${t('update.newVersion')}: ${latestVersion.version}`}>
                  <Button
                    type="link"
                    size="small"
                    onClick={handleUpdate}
                    style={{ marginLeft: 8, padding: '0 4px' }}
                  >
                    {t('update.updateToNew')}
                  </Button>
                </Tooltip>
              ) : (
                <Button
                  type="link"
                  size="small"
                  loading={isChecking}
                  onClick={checkUpdate}
                  style={{ marginLeft: 8, padding: '0 4px' }}
                >
                  {t('update.checkUpdate')}
                </Button>
              )}
            </span>

          </div>

        )}
        <span>
          <Button
            type="link"
            size="small"
            onClick={() => {
              localStorage.setItem('debugMode', !debugMode);
              setDebugMode(!debugMode);
            }}
            title={t('config.debug')}
          >
            {t('config.debug')}: {debugMode ? t('config.debugOn') : t('config.debugOff')}
          </Button>
        </span>
      </div>
  );
}

export default BottomInfo;