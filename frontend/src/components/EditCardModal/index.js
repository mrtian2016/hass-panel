import React from 'react';
import { Modal, Button, Space } from 'antd';
import Icon from '@mdi/react';
import { mdiEye, mdiClose, mdiCheck } from '@mdi/js';
import ConfigField from '../ConfigField';
import { useLanguage } from '../../i18n/LanguageContext';
import LightOverviewCard from '../LightOverviewCard';

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
        setShowPreview(true);
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
  };

  const handleSave = () => {
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

      {card.type === 'LightOverviewCard' && (
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