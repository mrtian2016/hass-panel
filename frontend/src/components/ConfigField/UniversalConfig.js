import { useLanguage } from '../../i18n/LanguageContext';
import { Input, Button, Select } from 'antd';
import './UniversalConfig.css';
function UniversalConfig({ field, value, onChange, allEntities }) {
    const { t } = useLanguage();
    console.log(allEntities);
    const universalEntities = Object.entries(allEntities)
    .map(([entityId, entity]) => ({
      id: entityId,
      name: entity.attributes.friendly_name || entityId
    }));


    return (
        <div className="config-field">
            <label>{field.label}</label>
            <div className="universal-entities-config">
                {(value || []).map((group, groupIndex, groupArray) => (
                    <div key={group.id} className="entity-group-config">
                        <div className="group-header">
                            <Input
                                value={group.name}
                                onChange={(e) => {
                                    const newGroups = [...value];
                                    newGroups[groupIndex] = {
                                        ...group,
                                        name: e.target.value
                                    };
                                    onChange(newGroups);
                                }}
                                placeholder={t('configField.groupName')}
                            />
                            <div className="group-actions">
                                <div className="order-buttons">
                                    <Button
                                        type="primary"
                                        onClick={() => {
                                            if (groupIndex > 0) {
                                                const newGroups = [...value];
                                                [newGroups[groupIndex - 1], newGroups[groupIndex]] = 
                                                    [newGroups[groupIndex], newGroups[groupIndex - 1]];
                                                onChange(newGroups);
                                            }
                                        }}
                                        disabled={groupIndex === 0}
                                    >
                                        ↑ 上移
                                    </Button>
                                    <Button
                                        type="primary"
                                        onClick={() => {
                                            if (groupIndex < groupArray.length - 1) {
                                                const newGroups = [...value];
                                                [newGroups[groupIndex], newGroups[groupIndex + 1]] = 
                                                    [newGroups[groupIndex + 1], newGroups[groupIndex]];
                                                onChange(newGroups);
                                            }
                                        }}
                                        disabled={groupIndex === groupArray.length - 1}
                                    >
                                        ↓ 下移
                                    </Button>
                                </div>
                                <Button
                                    type="primary"
                                    danger
                                    onClick={() => {
                                        const newGroups = [...value];
                                        newGroups.splice(groupIndex, 1);
                                        onChange(newGroups);
                                    }}
                                >
                                    {t('configField.deleteGroup')}
                                </Button>
                            </div>
                        </div>

                        <div className="entities-list">
                            {Object.entries(group.entities || {}).map(([entityId, entity], entityIndex, entityArray) => (
                                <div key={entityId} className="entity-config-item">
                                    <div className="entity-field">
                                        <div className="entity-field-row">
                                            <label>{t('configField.universalCard.name')}</label>
                                            <Input
                                                value={entity.name}
                                                onChange={(e) => {
                                                    const newGroups = [...value];
                                                    newGroups[groupIndex].entities[entityId] = {
                                                        ...entity,
                                                        name: e.target.value
                                                    };
                                                    onChange(newGroups);
                                                }}
                                                placeholder={t('configField.entityName')}
                                            />
                                        </div>

                                    </div>

                                    <div className="entity-select-field">
                                        <label>{t('configField.selectEntity')}</label>
                                        <Select
                                            allowClear
                                            value={entity.entity_id}
                                            onChange={(newEntityId) => {
                                                const newGroups = [...value];
                                                const newEntities = { ...group.entities };
                                                // 删除旧的实体
                                                delete newEntities[entityId];
                                                // 添加新的实体，保持相同的配置
                                                newEntities[newEntityId] = {
                                                    ...entity,
                                                    entity_id: newEntityId
                                                };
                                                newGroups[groupIndex].entities = newEntities;
                                                onChange(newGroups);
                                            }}
                                            showSearch
                                            placeholder={t('configField.selectEntity')}
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                            {
                                                return option.label.toLowerCase().includes(input.toLowerCase());

                                            }
                                              }
                                            options={universalEntities.map((entity) => ({
                                                value: entity.id,
                                                label: entity.name + ' (' + entity.id + ')'
                                            }))}
                                        />
                                    </div>

                                    <div className="entity-actions">
                                        <div className="order-buttons">
                                            <Button
                                                type="primary"
                                                onClick={() => {
                                                    const entries = Object.entries(group.entities || {});
                                                    if (entityIndex > 0) {
                                                        const newEntries = [...entries];
                                                        [newEntries[entityIndex - 1], newEntries[entityIndex]] = 
                                                            [newEntries[entityIndex], newEntries[entityIndex - 1]];
                                                        const newGroups = [...value];
                                                        newGroups[groupIndex].entities = Object.fromEntries(newEntries);
                                                        onChange(newGroups);
                                                    }
                                                }}
                                                disabled={entityIndex === 0}
                                            >
                                                ↑ 上移
                                            </Button>
                                            <Button
                                                type="primary"
                                                onClick={() => {
                                                    const entries = Object.entries(group.entities || {});
                                                    if (entityIndex < entries.length - 1) {
                                                        const newEntries = [...entries];
                                                        [newEntries[entityIndex], newEntries[entityIndex + 1]] = 
                                                            [newEntries[entityIndex + 1], newEntries[entityIndex]];
                                                        const newGroups = [...value];
                                                        newGroups[groupIndex].entities = Object.fromEntries(newEntries);
                                                        onChange(newGroups);
                                                    }
                                                }}
                                                disabled={entityIndex === entityArray.length - 1}
                                            >
                                                ↓ 下移
                                            </Button>
                                        </div>
                                        <Button
                                            type="primary"
                                            onClick={() => {
                                                const newGroups = [...value];
                                                const newEntities = { ...group.entities };
                                                delete newEntities[entityId];
                                                newGroups[groupIndex].entities = newEntities;
                                                onChange(newGroups);
                                            }}
                                            danger
                                        >
                                            {t('configField.deleteEntity')}
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            <Button
                                style={{ width: '100px' }}
                                onClick={() => {
                                    const newGroups = [...value];
                                    const newEntityId = `entity_${Date.now()}`;
                                    newGroups[groupIndex].entities = {
                                        ...group.entities,
                                        [newEntityId]: {
                                            name: '',
                                            entity_id: '',
                                            type: 'sensor',
                                            icon: 'mdiThermometer'
                                        }
                                    };
                                    onChange(newGroups);
                                }}
                                type="primary"
                            >
                                {t('configField.addEntity')}
                            </Button>
                        </div>
                    </div>
                ))}

                <Button
                    style={{ width: '100px' }}
                    onClick={() => {
                        onChange([
                            ...value,
                            {
                                id: `GROUP_${Date.now()}`,
                                name: t('configField.defaultGroupName'),
                                entities: {}
                            }
                        ]);
                    }}
                    type="primary"
                >
                    {t('configField.addGroup')}
                </Button>
            </div>
        </div>
    );
}
export default UniversalConfig;