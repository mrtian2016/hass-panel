import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, message } from 'antd';
import { configApi } from '../../utils/api';
import { useLanguage } from '../../i18n/LanguageContext';

function VersionListModal({ visible, onCancel, setCards, setHasUnsavedChanges, setShowVersionModal }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (visible) {
      loadVersions();
    }
  }, [visible]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const data = await configApi.getVersions();
      setVersions(data);
    } catch (error) {
      console.error('加载版本列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (filename) => {
    try {
      const configData = await configApi.getVersion(filename);
      
      // 更新卡片配置
      setCards(configData.cards.map(card => ({
        ...card,
        visible: card.visible !== false,
        titleVisible: card.titleVisible !== false
      })));

      // 保存恢复的配置到后端
      await configApi.saveConfig({
        cards: configData.cards,
        layouts: configData.layouts || {
          mobile: { sm: [] },
          desktop: { lg: [], md: [] }
        },
        defaultLayouts: configData.defaultLayouts || configData.layouts || {
          mobile: { sm: [] },
          desktop: { lg: [], md: [] }
        }
      }, false);

      setHasUnsavedChanges(false);
      message.success(t('version.restoreSuccess'));
      setShowVersionModal(false);
    } catch (error) {
      message.error(t('version.restoreFailed'));
    }
  };

  const handleDelete = async (filename) => {
    await configApi.deleteVersion(filename);
    await loadVersions();
  };

  const columns = [
    {
      title: t('version.filename'),
      dataIndex: 'filename',
      key: 'filename',
    },
    {
      title: t('version.lastmod'),
      dataIndex: 'lastmod',
      key: 'lastmod',
    },
    {
      title: t('version.size'),
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: t('version.actions'),
      key: 'actions',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleRestore(record.filename)}>
            {t('version.restore')}
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.filename)}>
            {t('version.delete')}
          </Button>
        </>
      ),
    },
  ];

  return (
    <Modal
      title={t('version.title')}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Table
        columns={columns}
        dataSource={versions}
        rowKey="filename"
        loading={loading}
      />
    </Modal>
  );
}

export default VersionListModal;

