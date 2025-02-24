import React from 'react';
import { useHass } from '@hakit/core';
import { Select, Input } from 'antd';
import './style.css';
import { useLanguage } from '../../i18n/LanguageContext';
import LightOverviewConfig from './LightOverviewConfig';
import LightsConfig from './LightsConfig';
import SocketConfig from './SocketConfig';
import NasConfig from './NasConfig';
import ScriptsConfig from './ScriptsConfig';
import CameraConfig from './CameraConfig';
import UniversalConfig from './UniversalConfig';
import { configApi } from '../../utils/api';

function ConfigField({ field, value, onChange }) {
  const { getAllEntities } = useHass();
  const allEntities = getAllEntities();
  const { t } = useLanguage();
  // 过滤并格式化实体列表
  const getFilteredEntities = (filter) => {
    return Object.entries(allEntities)
      .filter(([entityId]) => entityId.match(filter))
      .map(([entityId, entity]) => ({
        id: entityId,
        name: entity.attributes.friendly_name || entityId
      }));
  };

  // 处理房间灯光配置的变更
  const handleLightOverviewChange = (index, key, newValue) => {
    const newRooms = [...value];
    if (!newRooms[index]) {
      newRooms[index] = {};
    }
    newRooms[index][key] = newValue;
    onChange(newRooms);
  };

  // {t('configField.addButton')}新的房间灯光
  const handleAddRoom = () => {
    onChange([...value, {
      name: '',
      entity_id: '',
      position: { top: '50%', left: '50%' },
      image: ''
    }]);
  };

  // {t('configField.deleteButton')}房间灯光
  const handleDeleteRoom = (index) => {
    const newRooms = value.filter((_, i) => i !== index);
    onChange(newRooms);
  };
  
  switch (field.type) {
    case 'text':
      return (
        <div className="config-field">
          <div className="config-field-row">
            <label>{field.label}</label>
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        </div>
      );
      
    case 'image':
      return (
        <div className="config-field">
          <div className="config-field-row">
            <label>{field.label}</label>
            <div className="upload-field">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    try {
                      const result = await configApi.uploadImage(file);
                      onChange(result.file_path);
                    } catch (error) {
                      console.error('上传失败:', error);
                    }
                  }
                }}
                style={{ display: 'none' }}
                id={`image-upload-${field.key}`}
              />
              <Input 
                value={value || ''}
                placeholder={field.placeholder || t('fields.placeholderImage')}
                readOnly
                addonAfter={
                  <label htmlFor={`image-upload-${field.key}`} style={{ cursor: 'pointer' }}>
                    {t('fields.uploadImage')}
                  </label>
                }
              />
            </div>
          </div>
        </div>
      );
      
    case 'entity':
      const entities = getFilteredEntities(field.filter);
      return (
        <div className="config-field">
          <div className="config-field-row">
            <label>{field.label}</label>
            <Select
              allowClear
              value={value}
              onChange={onChange}
              showSearch
              placeholder={t('configField.selectEntity')}
              optionFilterProp="children"
              style={{ width: '100%' }}
            >
              {entities.map(entity => (
                <Select.Option key={entity.id} value={entity.id}>
                  {entity.name} ({entity.id})
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      );

    case 'light-overview-config':
      return <LightOverviewConfig 
        field={field}
        value={value}
        handleLightOverviewChange={handleLightOverviewChange}
        getFilteredEntities={getFilteredEntities}
        handleDeleteRoom={handleDeleteRoom}
        handleAddRoom={handleAddRoom} />

    case 'entity-multiple':
      const availableEntities = getFilteredEntities(field.filter);
      const selectedEntities = value || [];
      
      return (
        <div className="config-field">
          <label>{field.label}</label>
          <div className="entity-list">
            {selectedEntities.map((entityId, index) => (
              <div key={entityId} className="entity-item">
                <span>{allEntities[entityId]?.attributes?.friendly_name || entityId}</span>
                <button
                  onClick={() => {
                    const newEntities = [...selectedEntities];
                    newEntities.splice(index, 1);
                    onChange(newEntities);
                  }}
                >
                  {t('configField.deleteButton')}
                </button>
              </div>
            ))}
            <Select
              allowClear
              value=""
              onChange={(value) => {
                if (value) {
                  onChange([...selectedEntities, value]);
                }
              }}
              showSearch
              placeholder={t('configField.selectEntity')}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={availableEntities
                .filter(entity => !selectedEntities.includes(entity.id))
                .map(entity => ({
                  value: entity.id,
                  label: entity.name + ' (' + entity.id + ')'
                }))}
            />
          </div>
        </div>
      );

    case 'sensor-group':
      const sensorEntities = getFilteredEntities('sensor.*');
      return (
        <div className="config-field">
          <label>{field.label}</label>
          <div className="sensor-config-groups">
            {(value || []).map((group, groupIndex) => (
              <div key={group.id} className="sensor-config-group">
                <Input
                  type="text"
                  value={group.name || null}
                  onChange={(e) => {
                    const newGroups = [...(value || [])];
                    newGroups[groupIndex] = {
                      ...group,
                      name: e.target.value
                    };
                    onChange(newGroups);
                  }}
                  placeholder={t('configField.placeholderRoomName')}
                />
                <div className="sensor-config-list">
                  {Object.entries(group.sensors || {}).map(([type, sensor]) => (
                    <div key={type} className="sensor-config-item">
                      <span className="sensor-config-type">{sensor.name}</span>
                      <Select
                        allowClear
                        value={sensor.entity_id || null}
                        onChange={(selectedValue) => {
                          const newGroups = [...(value || [])];
                          newGroups[groupIndex] = {
                            ...group,
                            sensors: {
                              ...group.sensors,
                              [type]: {
                                ...sensor,
                                entity_id: selectedValue
                              }
                            }
                          };
                          onChange(newGroups);
                        }}
                        showSearch
                        placeholder={`${t('configField.selectEntityPlaceholder')}`}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={sensorEntities.map(entity => ({
                          value: entity.id,
                          label: entity.name + ' (' + entity.id + ')'
                        }))}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const newGroups = [...(value || [])];
                    newGroups.splice(groupIndex, 1);
                    onChange(newGroups);
                  }}
                >
                  {t('configField.deleteButton')}
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                onChange([
                  ...(value || []),
                  {
                    id: 'ROOM_' + Date.now(),
                    name: '',
                    sensors: {
                      temperature: {
                        entity_id: '',
                        name: t('configField.temperature'),
                        icon: 'mdiThermometer'
                      },
                      humidity: {
                        entity_id: '',
                        name: t('configField.humidity'),
                        icon: 'mdiWaterPercent'
                      }
                    }
                  }
                ]);
              }}
            >
              {t('configField.addButton')}
            </button>
          </div>
        </div>
      );

    case 'lights-config':
      return <LightsConfig field={field} value={value} onChange={onChange} getFilteredEntities={getFilteredEntities} />

    case 'socket-config':
      return <SocketConfig field={field} value={value} onChange={onChange} getFilteredEntities={getFilteredEntities} />

    case 'cameras-config':
      return <CameraConfig field={field} value={value} onChange={onChange} getFilteredEntities={getFilteredEntities} />

    case 'media-players':
      const mediaPlayerEntities = getFilteredEntities('media_player.*');
      
      return (
        <div className="config-field">
          <label>{field.label}</label>
          <div className="media-players-config">
            {(value || []).map((player, index) => (
              <div key={index} className="media-player-item">
                <Input
                  type="text"
                  value={player.name || null}
                  onChange={(e) => {
                    const newPlayers = [...value];
                    newPlayers[index] = {
                      ...player,
                      name: e.target.value
                    };
                    onChange(newPlayers);
                  }}
                  placeholder={t('configField.playerName')}
                />
                <Select
                  allowClear
                  value={player.entity_id || null}
                  onChange={(selectedValue) => {
                    const newPlayers = [...value];
                    newPlayers[index] = {
                      ...player,
                      entity_id: selectedValue
                    };
                    onChange(newPlayers);
                  }}
                  showSearch
                  placeholder={t('configField.selectEntity')}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={mediaPlayerEntities.map(entity => ({
                    value: entity.id,
                    label: entity.name + ' (' + entity.id + ')'
                  }))}
                />
                <button
                  onClick={() => {
                    const newPlayers = [...value];
                    newPlayers.splice(index, 1);
                    onChange(newPlayers);
                  }}
                >
                  {t('configField.deleteButton')}
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                onChange([
                  ...(value || []),
                  {
                    entity_id: '',
                    name: '',
                    room: ''
                  }
                ]);
              }}
            >
              {t('configField.addButton')}
            </button>
          </div>
        </div>
      );

    case 'curtains-config':
      const curtainEntities = getFilteredEntities('cover.*');
      
      return (
        <div className="config-field">
          <label>{field.label}</label>
          <div className="curtains-config">
            {(value || []).map((curtain, index) => (
              <div key={index} className="curtain-item">
                <Input
                  type="text"
                  value={curtain.name || null}
                  onChange={(e) => {
                    const newCurtains = [...value];
                    newCurtains[index] = {
                      ...curtain,
                      name: e.target.value
                    };
                    onChange(newCurtains);
                  }}
                  placeholder={t('configField.curtainName')}
                />
                <Select
                  allowClear
                  value={curtain.entity_id || null}
                  onChange={(selectedValue) => {
                    const newCurtains = [...value];
                    newCurtains[index] = {
                      ...curtain,
                      entity_id: selectedValue
                    };
                    onChange(newCurtains);
                  }}
                  showSearch
                  placeholder={t('configField.selectEntity')}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={curtainEntities.map(entity => ({
                    value: entity.id,
                    label: entity.name + ' (' + entity.id + ')'
                  }))}
                />
                <button
                  onClick={() => {
                    const newCurtains = [...value];
                    newCurtains.splice(index, 1);
                    onChange(newCurtains);
                  }}
                >
                  {t('configField.deleteButton')}
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                onChange([
                  ...(value || []),
                  {
                    entity_id: '',
                    name: '',
                    room: ''
                  }
                ]);
              }}
            >
              {t('configField.addButton')}
            </button>
          </div>
        </div>
      );

    case 'router-config':
      const routerEntities = getFilteredEntities('sensor.*');
      const routerFields = [
        { key: 'cpuTemp', name: t('configField.cpuTemp') },
        { key: 'uptime', name: t('configField.uptime') },
        { key: 'cpuUsage', name: t('configField.cpuUsage') },
        { key: 'memoryUsage', name: t('configField.memoryUsage') },
        { key: 'onlineUsers', name: t('configField.onlineUsers') },
        { key: 'networkConnections', name: t('configField.networkConnections') },
        { key: 'wanIp', name: t('configField.wanIp') },
        { key: 'wanDownloadSpeed', name: t('configField.downloadSpeed') },
        { key: 'wanUploadSpeed', name: t('configField.uploadSpeed') }
      ];
      
      return (
        <div className="config-field">
          <label>{field.label}</label>
          <div className="router-config">
            {routerFields.map(routerField => {
              const currentValue = value?.[routerField.key] || {};
              
              return (
                <div key={routerField.key} className="router-field">
                  <span className="field-name">{routerField.name}</span>
                  <Select
                    allowClear
                    value={currentValue.entity_id || null}
                    onChange={(selectedValue) => {
                      onChange({
                        ...value,
                        [routerField.key]: {
                          entity_id: selectedValue,
                          name: routerField.name
                        }
                      });
                    }}
                    showSearch
                    placeholder={t('configField.selectEntity')}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={routerEntities.map(entity => ({
                      value: entity.id,
                      label: entity.name + ' (' + entity.id + ')'
                    }))}
                  />
                </div>
              );
            })}
          </div>
        </div>
      );

    case 'nas-config':
      return <NasConfig field={field} value={value} onChange={onChange} getFilteredEntities={getFilteredEntities} />

    case 'scripts-config':
      return <ScriptsConfig field={field} value={value} onChange={onChange} getFilteredEntities={getFilteredEntities} />

    case 'waterpuri-config':
      const waterPuriEntities = getFilteredEntities('sensor.*');
      const waterPuriFields = [
        { key: 'temperature', name: t('configField.temperature') },
        { key: 'tds_in', name: t('configField.tdsIn') },
        { key: 'tds_out', name: t('configField.tdsOut') },
        { key: 'pp_filter_life', name: t('configField.ppFilterLife') },
        { key: 'ro_filter_life', name: t('configField.roFilterLife') },
        { key: 'status', name: t('configField.status') }
      ];
      
      return (
        <div className="config-field">
          <label>{field.label}</label>
          <div className="waterpuri-config">
            {waterPuriFields.map(waterPuriField => {
              const currentValue = value?.[waterPuriField.key] || {};
              
              return (
                <div key={waterPuriField.key} className="waterpuri-field">
                  <span className="field-name">{waterPuriField.name}</span>
                  <Select
                    allowClear
                    value={currentValue.entity_id || null}
                    onChange={(selectedValue) => {
                      onChange({
                        ...value,
                        [waterPuriField.key]: {
                          entity_id: selectedValue,
                          name: waterPuriField.name
                        }
                      });
                    }}
                    showSearch
                    placeholder={t('configField.selectEntity')}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={waterPuriEntities.map(entity => ({
                      value: entity.id,
                      label: entity.name + ' (' + entity.id + ')'
                    }))}
                  />
                </div>
              );
            })}
          </div>
        </div>
      );

    case 'electricity-config':
      const electricityEntities = getFilteredEntities('sensor.*');
      const electricityFields = [
        { key: 'currentPower', name: t('configField.currentPower') },
        { key: 'voltage', name: t('configField.voltage') },
        { key: 'electric_current', name: t('configField.electricCurrent') },
        { key: 'totalUsage', name: t('configField.totalUsage') },
        { key: 'todayUsage', name: t('configField.todayUsage') },
      ];
      
      return (
        <div className="config-field">
          <label>{field.label}</label>
          <div className="electricity-config">
            {electricityFields.map(electricityField => {
              const currentValue = value?.[electricityField.key] || {};
              
              return (
                <div key={electricityField.key} className="electricity-field">
                  <span className="field-name">{electricityField.name}</span>
                  <Select
                    allowClear
                    value={currentValue.entity_id || null}
                    onChange={(selectedValue) => {
                      onChange({
                        ...value,
                        [electricityField.key]: {
                          entity_id: selectedValue,
                          name: electricityField.name
                        }
                      });
                    }}
                    showSearch
                    placeholder={t('configField.selectEntity')}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={electricityEntities.map(entity => ({
                      value: entity.id,
                      label: entity.name + ' (' + entity.id + ')'
                    }))}
                  />
                </div>
              );
            })}
          </div>
        </div>
      );

    case 'climate-features':
      const featureEntities = getFilteredEntities('switch.*');
      const predefinedFeatures = {
        eco: {
          name: t('configField.eco'),
          icon: 'mdiLeaf',
          disableWhen: {
            state: 'off'
          }
        },
        sleep: {
          name: t('configField.sleep'),
          icon: 'mdiPowerSleep',
          disableWhen: {
            state: 'off'
          }
        },
        heater: {
          name: t('configField.heater'),
          icon: 'mdiHeatingCoil',
          disableWhen: {
            state: 'off'
          },
          enableWhen: {
            mode: 'heat'
          }
        },
        unStraightBlowing: {
          name: t('configField.unStraightBlowing'),
          icon: 'mdiAirPurifier',
          disableWhen: {
            state: 'off'
          },
          enableWhen: {
            mode: 'cool'
          }
        },
        // 新风
        newAir: {
          name: t('configField.newAir'),
          icon: 'mdiAirPurifier',
          disableWhen: {
            state: 'off'
          }
        }
      };
      
      return (
        <div className="config-field">
          <label>{field.label}</label>
          <div className="climate-features">
            {Object.entries(value || {}).map(([type, feature]) => (
              <div key={type} className="climate-feature">
                <div className="feature-header">
                  <Select
                    allowClear
                    value={feature.name || null}
                    onChange={(selectedName) => {
                      // 根据选择的名称找到对应的预定义功能
                      const selectedFeatureKey = Object.entries(predefinedFeatures).find(
                        ([_, f]) => f.name === selectedName
                      )?.[0];
                      
                      if (selectedFeatureKey) {
                        const predefinedFeature = predefinedFeatures[selectedFeatureKey];
                        onChange({
                          ...value,
                          [type]: {
                            ...feature,
                            name: predefinedFeature.name,
                            icon: predefinedFeature.icon,
                            disableWhen: predefinedFeature.disableWhen,
                            enableWhen: predefinedFeature.enableWhen
                          }
                        });
                      }
                    }}
                    showSearch
                    placeholder={t('configField.selectFeature')}
                    optionFilterProp="children"
                    options={Object.values(predefinedFeatures).map(f => ({
                      value: f.name,
                      label: f.name
                    }))}
                  />
                
              
                    <Select
                      allowClear
                      value={feature.entity_id || null}
                      onChange={(selectedValue) => {
                        onChange({
                          ...value,
                          [type]: {
                            ...feature,
                            entity_id: selectedValue
                          }
                        });
                      }}
                      showSearch
                      placeholder={t('configField.selectEntity')}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={featureEntities.map(entity => ({
                        value: entity.id,
                        label: entity.name + ' (' + entity.id + ')'
                      }))}
                    />
                 
                </div>
                 <button
                    onClick={() => {
                      const newValue = { ...value };
                      delete newValue[type];
                      onChange(newValue);
                    }}
                  >
                    {t('configField.deleteButton')}
                  </button>
              </div>
            ))}
            <button
              className="add-btn"
              onClick={() => {
                const newKey = `feature_${Date.now()}`;
                onChange({
                  ...value,
                  [newKey]: {
                    entity_id: '',
                    name: '',
                    icon: '',
                    disableWhen: {
                      state: 'off'
                    }
                  }
                });
              }}
            >
              {t('configField.addButton')}
            </button>
          </div>
        </div>
      );

    case 'illuminance-config':
      const illuminanceEntities = getFilteredEntities('sensor.*');
      
      return (
        <div className="config-field">
          <label>{field.label}</label>
          <div className="illuminance-config">
            {(value || []).map((sensor, index) => (
              <div key={index} className="illuminance-item">
                <div className="config-field-row">
                  <span className="field-name">{t('configField.sensorName')}</span>
                  <Input
                    type="text"
                    value={sensor.name || null}
                    onChange={(e) => {
                      const newSensors = [...value];
                      newSensors[index] = {
                        ...sensor,
                        name: e.target.value
                      };
                      onChange(newSensors);
                    }}
                    placeholder={t('configField.sensorName')}
                  />
                </div>
                <div className="config-field-row">
                  <span className="field-name">{t('configField.sensorEntity')}</span>
                  <Select
                    allowClear
                    value={sensor.entity_id || null}
                    onChange={(selectedValue) => {
                      const newSensors = [...value];
                      newSensors[index] = {
                        ...sensor,
                        entity_id: selectedValue
                      };
                      onChange(newSensors);
                    }}
                    showSearch
                    placeholder={t('configField.selectEntity')}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={illuminanceEntities.map(entity => ({
                      value: entity.id,
                      label: entity.name + ' (' + entity.id + ')'
                    }))}
                  />
                </div>
                <button
                  className="delete-btn"
                  onClick={() => {
                    const newSensors = [...value];
                    newSensors.splice(index, 1);
                    onChange(newSensors);
                  }}
                >
                  {t('configField.deleteButton')}
                </button>
              </div>
            ))}
          </div>
          <button
            className="add-btn"
            onClick={() => {
              onChange([
                ...(value || []),
                {
                  entity_id: '',
                  name: '',
                }
              ]);
            }}
          >
            {t('configField.addButton')}
          </button>
        </div>
      );

    case 'universal-entities':
      return <UniversalConfig field={field} value={value} onChange={onChange} getFilteredEntities={getFilteredEntities} />

    case 'persons-config':
      const personEntities = getFilteredEntities('person.*');
      
      return (
        <div className="config-field">
          <label>{field.label}</label>
          <div className="persons-config">
            {(value || []).map((person, index) => (
              <div key={index} className="person-item">
                <div className="person-item-row">
                  <Select
                    allowClear
                    value={person.entity_id || null}
                    onChange={(selectedValue) => {
                      const newPersons = [...value];
                      newPersons[index] = {
                        ...person,
                        entity_id: selectedValue
                      };
                      onChange(newPersons);
                    }}
                    showSearch
                    placeholder={t('configField.selectEntity')}
                    optionFilterProp="children"
                    style={{ flex: 1 }}
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={personEntities.map(entity => ({
                      value: entity.id,
                      label: entity.name + ' (' + entity.id + ')'
                    }))}
                  />
                  <button
                    className="delete-btn"
                    style={{ marginTop: '0' }}
                    onClick={() => {
                      const newPersons = [...value];
                      newPersons.splice(index, 1);
                      onChange(newPersons);
                    }}
                  >
                    {t('configField.deleteButton')}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            className="add-btn"
            onClick={() => {
              onChange([
                ...(value || []),
                {
                  entity_id: ''
                }
              ]);
            }}
          >
            {t('configField.addButton')}
          </button>
        </div>
      );

    default:
      return null;
  }
}

export default ConfigField; 