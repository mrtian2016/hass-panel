import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, List, message, Popconfirm } from 'antd';
import Icon from '@mdi/react';
import { mdiDelete, mdiPencil, mdiPlus, mdiArrowUp, mdiArrowDown } from '@mdi/js';
import { useLanguage } from '../../i18n/LanguageContext';
import './style.css';

function GroupManager({ visible, onCancel, groups, onSave }) {
  const { t } = useLanguage();
  const [localGroups, setLocalGroups] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (visible) {
      // 过滤掉内置的"全部"分组，只显示用户自定义的分组
      setLocalGroups([...groups].sort((a, b) => a.order - b.order));
    }
  }, [visible, groups]);

  const handleAdd = () => {
    if (!newGroupName.trim()) {
      message.warning(t('groups.nameRequired'));
      return;
    }

    const maxOrder = localGroups.length > 0 ? Math.max(...localGroups.map(g => g.order)) : -1;
    const newGroup = {
      id: newGroupName.trim(),
      name: newGroupName.trim(),
      order: maxOrder + 1
    };

    setLocalGroups([...localGroups, newGroup]);
    setNewGroupName('');
    setIsAdding(false);
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
  };

  const handleSaveEdit = () => {
    if (!editingGroup.name.trim()) {
      message.warning(t('groups.nameRequired'));
      return;
    }

    setLocalGroups(localGroups.map(g =>
      g.id === editingGroup.id ? { ...editingGroup } : g
    ));
    setEditingGroup(null);
  };

  const handleDelete = (groupId) => {
    setLocalGroups(localGroups.filter(g => g.id !== groupId));
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;

    const newGroups = [...localGroups];
    [newGroups[index - 1], newGroups[index]] = [newGroups[index], newGroups[index - 1]];

    // 重新分配 order
    newGroups.forEach((group, idx) => {
      group.order = idx;
    });

    setLocalGroups(newGroups);
  };

  const handleMoveDown = (index) => {
    if (index === localGroups.length - 1) return;

    const newGroups = [...localGroups];
    [newGroups[index], newGroups[index + 1]] = [newGroups[index + 1], newGroups[index]];

    // 重新分配 order
    newGroups.forEach((group, idx) => {
      group.order = idx;
    });

    setLocalGroups(newGroups);
  };

  const handleSave = () => {
    onSave(localGroups);
    onCancel();
  };

  return (
    <Modal
      title={t('groups.manage')}
      open={visible}
      onCancel={onCancel}
      onOk={handleSave}
      okText={t('config.save')}
      cancelText={t('config.cancel')}
      width={600}
      className="group-manager-modal"
    >
      <div className="group-manager-content">
        {/* 添加分组 */}
        {isAdding ? (
          <div className="group-add-form">
            <Input
              placeholder={t('groups.namePlaceholder')}
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onPressEnter={handleAdd}
              autoFocus
            />
            <Button type="primary" onClick={handleAdd} style={{ marginLeft: 8 }}>
              {t('config.confirm')}
            </Button>
            <Button onClick={() => { setIsAdding(false); setNewGroupName(''); }} style={{ marginLeft: 8 }}>
              {t('config.cancel')}
            </Button>
          </div>
        ) : (
          <Button
            type="dashed"
            icon={<Icon path={mdiPlus} size={14} />}
            onClick={() => setIsAdding(true)}
            block
            style={{ marginBottom: 16 }}
          >
            {t('groups.add')}
          </Button>
        )}

        {/* 分组列表 */}
        <List
          className="group-list"
          dataSource={localGroups}
          locale={{ emptyText: t('groups.default') }}
          renderItem={(group, index) => (
            <List.Item
              key={group.id}
              className="group-list-item"
              actions={[
                <Button
                  key="up"
                  type="text"
                  size="small"
                  icon={<Icon path={mdiArrowUp} size={14} />}
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                />,
                <Button
                  key="down"
                  type="text"
                  size="small"
                  icon={<Icon path={mdiArrowDown} size={14} />}
                  onClick={() => handleMoveDown(index)}
                  disabled={index === localGroups.length - 1}
                />,
                <Button
                  key="edit"
                  type="text"
                  size="small"
                  icon={<Icon path={mdiPencil} size={14} />}
                  onClick={() => handleEdit(group)}
                />,
                <Popconfirm
                  key="delete"
                  title={t('groups.deleteConfirm')}
                  onConfirm={() => handleDelete(group.id)}
                  okText={t('config.confirm')}
                  cancelText={t('config.cancel')}
                >
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<Icon path={mdiDelete} size={14} />}
                  />
                </Popconfirm>
              ]}
            >
              {editingGroup && editingGroup.id === group.id ? (
                <div className="group-edit-form">
                  <Input
                    value={editingGroup.name}
                    onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                    onPressEnter={handleSaveEdit}
                    autoFocus
                  />
                  <Button type="primary" onClick={handleSaveEdit} size="small" style={{ marginLeft: 8 }}>
                    {t('config.confirm')}
                  </Button>
                  <Button onClick={() => setEditingGroup(null)} size="small" style={{ marginLeft: 8 }}>
                    {t('config.cancel')}
                  </Button>
                </div>
              ) : (
                <div className="group-name">{group.name}</div>
              )}
            </List.Item>
          )}
        />
      </div>
    </Modal>
  );
}

export default GroupManager;
