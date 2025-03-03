import React from 'react';
import { Modal, Button, Space, message } from 'antd';
import Icon from '@mdi/react';
import { mdiClose, mdiCheck } from '@mdi/js';
import ConfigField from '../ConfigField';
import { useLanguage } from '../../i18n/LanguageContext';
import LightOverviewCard from '../LightOverviewCard';
import './style.css';
function EditCardModal({ 
  visible, 
  onClose, 
  card, 
  cardTypes, 
  onSave,
  showPreview,
  setShowPreview,
  previewConfig,
  setPreviewConfig
}) {
  const { t } = useLanguage();
  const [config, setConfig] = React.useState(card?.config || {});

  React.useEffect(() => {
    if (card) {
      setConfig(card.config);
      if (card.type === 'LightOverviewCard') {
        setPreviewConfig(card.config);
        // setShowPreview(true);
      }
    }
  }, [card, setPreviewConfig, setShowPreview]);

  const handleConfigChange = (key, value) => {
    const newConfig = {
      ...config,
      [key]: value
    };
    setConfig(newConfig);
    if (card?.type === 'LightOverviewCard') {
      setPreviewConfig(newConfig);
    }
    // 如果编辑了已经存在的卡片 那么就删掉本地的布局，因为结构可能已经变化 卡片高度需要重新计算了
    if (card?.id) {
      // 获取移动端和桌面端的布局
      const mobileLayouts = JSON.parse(localStorage.getItem('mobile-dashboard-layouts') || '{}');
      const desktopLayouts = JSON.parse(localStorage.getItem('desktop-dashboard-layouts') || '{}');

      // 遍历所有断点（lg、md、sm等）
      ['lg', 'md', 'sm'].forEach(breakpoint => {
        // 移动端布局
        if (mobileLayouts[breakpoint]) {
          mobileLayouts[breakpoint] = mobileLayouts[breakpoint].filter(item => item.i !== card.id.toString());
        }
        // 桌面端布局
        if (desktopLayouts[breakpoint]) {
          desktopLayouts[breakpoint] = desktopLayouts[breakpoint].filter(item => item.i !== card.id.toString());
        }
      });

      // 保存更新后的布局
      localStorage.setItem('mobile-dashboard-layouts', JSON.stringify(mobileLayouts));
      localStorage.setItem('desktop-dashboard-layouts', JSON.stringify(desktopLayouts));
    }
  };

  const handleSave = () => {
    if (card.type === 'CameraCard') {
      const cameras = config.cameras;
      let hasError = false;
      
      cameras.forEach(camera => {
        if (camera.stream_url?.startsWith('onvif://') && camera.url_type === 'auto' && (!camera.onvif_username || !camera.onvif_password)) {
          message.error(t('configField.onvifCredentialsRequired'));
          hasError = true;
        }
      });

      if (hasError) {
        return;
      }
    }
    
    onSave({
      ...card,
      config
    });

    handleClose();
  };

  const handleClose = () => {
    setShowPreview(false);
    onClose();
  };

  if (!card) return null;

  const cardType = cardTypes[card.type];

  const footer = (
    <Space>
      {card.type === 'LightOverviewCard' && (
        <Button 
          onClick={() => setShowPreview(true)}
          style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
        >
          {t('config.preview')}
        </Button>
      )}

      <Button 
        onClick={handleClose}
        style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
      >
        {t('config.cancel')}
      </Button>
      <Button 
        type="primary"
        icon={<Icon path={mdiCheck} size={0.8} />}
        onClick={handleSave}
        style={{ background: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
      >
        {t('config.save')}
      </Button>
    </Space>
  );

  return (
    <>
      <Modal
        title={`${t('config.edit')} ${cardType.name}`}
        open={visible}
        onCancel={handleClose}
        footer={footer}
        width={800}
      >
        <div className="edit-card-content">
          {cardType.fields.map(field => (
            <ConfigField
              key={field.key}
              field={field}
              value={config[field.key]}
              onChange={(value) => handleConfigChange(field.key, value)}
            />
          ))}
        </div>
      </Modal>

      {card.type === 'LightOverviewCard' && showPreview && (
        <div className={`preview-container ${showPreview ? 'visible' : ''}`}>
          <button
            className="close-preview"
            onClick={() => setShowPreview(false)}
          >
            <Icon path={mdiClose} size={1} />
          </button>
          <LightOverviewCard
            key={JSON.stringify(previewConfig)}
            config={previewConfig}
          />
        </div>
      )}
    </>
  );
}

export default EditCardModal; 