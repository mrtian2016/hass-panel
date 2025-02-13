import React, { useState, useEffect } from 'react';
import { Modal, List, Button, Space, message } from 'antd';
import { fetchVersionList, restoreVersion, deleteVersion } from '../../utils/webdav';
import { useLanguage } from '../../i18n/LanguageContext';

const VersionListModal = ({ visible, onCancel, setCards, setHasUnsavedChanges, setShowVersionModal }) => {
    const { t } = useLanguage();
    const [versionList, setVersionList] = useState([]);
    const [loadingVersions, setLoadingVersions] = useState(true);

    useEffect(() => {
        const fetchVersions = async () => {
            try {
                const versions = await fetchVersionList();
                setVersionList(versions);
                setLoadingVersions(false);
            } catch (error) {
                message.error('获取版本列表失败: ' + error.message);
                setLoadingVersions(false);
            }
        };
        fetchVersions();
    }, []);

    return (
        <Modal
            title={t('webdav.versionList')}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={600}
        >
            <div className="version-list">
                {loadingVersions ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        {t('loading')}...
                    </div>
                ) : (
                    <List
                        dataSource={versionList}
                        renderItem={item => (
                            <List.Item
                                actions={[
                                    <Space>
                                        <Button
                                            type="link"
                                            onClick={async () => {
                                                try {
                                                    const configData = await restoreVersion(item.filename);
                                                    setCards(configData.cards.map(card => ({
                                                        ...card,
                                                        visible: card.visible !== false
                                                    })));
                                                    setHasUnsavedChanges(true);
                                                    message.success('恢复配置成功');
                                                    setShowVersionModal(false);
                                                } catch (error) {
                                                    message.error('恢复配置失败: ' + error.message);
                                                }
                                            }}
                                        >
                                            {t('webdav.restoreVersion')}
                                        </Button>
                                        {item.filename !== 'config.json' && (
                                            <Button
                                                type="link"
                                                danger
                                                onClick={() => {
                                                    Modal.confirm({
                                                        title: t('webdav.confirmDelete'),
                                                        content: `${t('webdav.confirmDeleteVersion')} ${item.basename}?`,
                                                        okText: t('confirm'),
                                                        cancelText: t('cancel'),
                                                        onOk: async () => {
                                                            try {
                                                                await deleteVersion(item.filename);
                                                                const versions = await fetchVersionList();
                                                                setVersionList(versions);
                                                                message.success('删除版本成功');
                                                            } catch (error) {
                                                                message.error('删除版本失败: ' + error.message);
                                                            }
                                                        }
                                                    });
                                                }}
                                            >
                                                {t('webdav.delete')}
                                            </Button>
                                        )}
                                    </Space>
                                ]}
                            >
                                <List.Item.Meta
                                    title={
                                        <Space>
                                            <span>{item.basename}</span>
                                            <span style={{ color: '#999', fontSize: '12px' }}>({item.size})</span>
                                        </Space>
                                    }
                                    description={`${t('webdav.lastModified')}: ${item.lastmod}`}
                                />
                            </List.Item>
                        )}
                    />
                )}
            </div>
        </Modal>
    );
};

export default VersionListModal;

