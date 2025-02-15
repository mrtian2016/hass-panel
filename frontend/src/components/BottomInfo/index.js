import { Icon } from '@mdi/react';
import React from 'react';
import { useState, useRef } from 'react';
import { mdiInformationOutline, mdiUpload } from '@mdi/js';
import { useLanguage } from '../../i18n/LanguageContext';
import { compareVersions } from '../../utils/helper';
import { message, Button, Tooltip, Modal } from 'antd';
import { updateApi } from '../../utils/api';
import './style.css';

function BottomInfo() {
  const { t } = useLanguage();
  const [versionInfo, setVersionInfo] = useState(null);
  const [latestVersion, setLatestVersion] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatePackageInfo, setUpdatePackageInfo] = useState(null);
  // const fileInputRef = useRef(null);
  const updateFileRef = useRef(null);
  const [debugMode, setDebugMode] = useState(() => {
    const localDebugMode = localStorage.getItem('debugMode');
    return localDebugMode === 'true';
  });

  // 获取版本信息
  React.useEffect(() => {
    updateApi.getCurrentVersion()
      .then(data => {
        setVersionInfo(data);
      })
      .catch(error => {
        console.error('获取版本信息失败:', error);
      });
  }, []);

  // 检查更新
  const checkUpdate = async () => {
    try {
      setIsChecking(true);
      const response = await updateApi.checkUpdate();
      if (response.code === 200) {
        if (response.message.includes('已经是最新版本')) {
          message.success(t('update.latestVersion'));
          setLatestVersion(null);
        } else {
          const newVersion = response.message.match(/新版本：(.+)$/)?.[1];
          if (newVersion) {
            setLatestVersion({
              version: newVersion,
              updateTime: new Date().toISOString()
            });
            message.info(`${t('update.newVersion')}: ${newVersion}`);
          }
        }
      }
    } catch (error) {
      console.error('检查更新失败:', error);
      message.error(t('update.checkFailed'));
    } finally {
      setIsChecking(false);
    }
  };

  // 处理更新包上传
  const handleUpdatePackageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const result = await updateApi.uploadPackage(file);
      if (result.code === 200) {
        setUpdatePackageInfo(result.data);
        setShowUpdateModal(true);
        message.success(t('update.uploadSuccess'));
      }
    } catch (error) {
      console.error('上传更新包失败:', error);
      message.error(error.message || t('update.uploadFailed'));
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  // 确认更新
  const confirmUpdate = async () => {
    try {
      message.loading({ content: t('update.checking'), key: 'update' });
      const response = await updateApi.applyManualUpdate({
        ...updatePackageInfo
      });

      if (response.code === 200) {
        message.success({
          content: response.message,
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
          content: `${t('update.failed')}: ${response.message}`,
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
    } finally {
      setShowUpdateModal(false);
    }
  };

  // 执行更新
  const handleUpdate = async () => {
    try {
      message.loading({ content: t('update.checking'), key: 'update' });
      const response = await updateApi.checkUpdate();

      if (response.code === 200) {
        message.success({
          content: response.message,
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
          content: `${t('update.failed')}: ${response.message}`,
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
              <>
                <Button
                  type="link"
                  size="small"
                  loading={isChecking}
                  onClick={checkUpdate}
                  style={{ marginLeft: 8, padding: '0 4px' }}
                >
                  {t('update.checkUpdate')}
                </Button>
                <Tooltip title={t('update.uploadPackage')}>
                  <Button
                    type="link"
                    size="small"
                    loading={isUploading}
                    onClick={() => updateFileRef.current?.click()}
                    style={{ padding: '0 4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Icon path={mdiUpload} size={0.8} />
                    {t('update.manualUpdate')}
                  </Button>
                </Tooltip>
                <input
                  type="file"
                  ref={updateFileRef}
                  onChange={handleUpdatePackageUpload}
                  accept=".zip,.tar.gz"
                  style={{ display: 'none' }}
                />
              </>
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

      {/* 更新确认对话框 */}
      <Modal
        title={t('update.confirmUpdate')}
        open={showUpdateModal}
        onOk={confirmUpdate}
        onCancel={() => setShowUpdateModal(false)}
        okText={t('update.confirmUpdate')}
        cancelText={t('update.cancel')}
        okButtonProps={{ type: 'primary' }}
      >
        <p>{t('update.confirmUpdateDesc')}</p>
        {updatePackageInfo && (
          <p>
            {t('update.packageVersion')}: {updatePackageInfo.version}
          </p>
        )}
      </Modal>
    </div>
  );
}

export default BottomInfo;