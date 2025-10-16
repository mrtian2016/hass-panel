import React from 'react';
import { useHass } from '@hakit/core';
import { AutoComplete, Input, Button } from 'antd';
import './style.css';
import { useLanguage } from '../../i18n/LanguageContext';
import LightOverviewConfig from './LightOverviewConfig';
import LightsConfig from './LightsConfig';
import SocketConfig from './SocketConfig';
import NasConfig from './NasConfig';
import ScriptsConfig from './ScriptsConfig';
import CameraConfig from './CameraConfig';
import UniversalConfig from './UniversalConfig';
import PVEConfig from './PVEConfig';
import ServerConfig from './ServerConfig';
import SensorGroup from './SensorGroup';
import ClimateFeaturesConfig from './ClimateFeaturesConfig';
import { configApi } from '../../utils/api';
import DailyQuoteConfig from './DailyQuoteConfig';
import WashingMachineConfig from './WashingMachineConfig';


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
            <AutoComplete
              allowClear
              value={value}
              onChange={onChange}
              showSearch
              placeholder={t('configField.selectEntity')}
              optionFilterProp="children"
              style={{ width: '100%' }}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={entities.map(entity => ({
                value: entity.id,
                label: entity.name + ' (' + entity.id + ')'
              }))}
            />
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
                <Button
                  type="primary"
                  danger
                  onClick={() => {
                    const newEntities = [...selectedEntities];
                    newEntities.splice(index, 1);
                    onChange(newEntities);
                  }}
                >
                  {t('configField.deleteButton')}
                </Button>
              </div>
            ))}
            <AutoComplete
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
      return <SensorGroup field={field} value={value} onChange={onChange} getFilteredEntities={getFilteredEntities} />

    case 'lights-config':
      return <LightsConfig field={field} value={value} onChange={onChange} getFilteredEntities={getFilteredEntities} />

    case 'socket-config':
      return <SocketConfig field={field} value={value} onChange={onChange} getFilteredEntities={getFilteredEntities} />

    case 'cameras-config':
      return <CameraConfig field={field} value={value} onChange={onChange} getFilteredEntities={getFilteredEntities} />

    case 'washing-machine-config':
      return <WashingMachineConfig field={field} value={value} onChange={onChange} getFilteredEntities={getFilteredEntities} />

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
                <AutoComplete
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
                <Button
                  type="primary"
                  style={{ width: '100px' }}  
                  danger
                  onClick={() => {
                    const newPlayers = [...value];
                    newPlayers.splice(index, 1);
                    onChange(newPlayers);
                  }}
                >
                  {t('configField.deleteButton')}
                </Button>
              </div>
            ))}
            <Button
              style={{ width: '100px' }}
              type="primary"
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
            </Button>
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
                <AutoComplete
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
                <Button 
                  type="primary"
                  style={{ width: '100px' }}
                  danger
                  onClick={() => {
                    const newCurtains = [...value];
                    newCurtains.splice(index, 1);
                    onChange(newCurtains);
                  }}
                >
                  {t('configField.deleteButton')}
                </Button>
              </div>
            ))}
            <Button
              style={{ width: '100px' }}
              type="primary"
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
            </Button>
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
            <div className="router-field">
              <span className="field-name">{t('configField.routerName')}</span>
              <Input
                value={value?.routerName || ''}
                onChange={(e) => {
                  onChange({
                    ...value,
                    routerName: e.target.value
                  });
                }}
                placeholder={t('configField.routerName')}
              />
            </div>
            {routerFields.map(routerField => {
              const currentValue = value?.[routerField.key] || {};

              return (
                <div key={routerField.key} className="router-field">
                  <span className="field-name">{routerField.name}</span>
                  <AutoComplete
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
    case 'server-config':
      return <ServerConfig field={field} value={value} onChange={onChange} getFilteredEntities={getFilteredEntities} />
    case 'pve-config':
      return <PVEConfig field={field} value={value} onChange={onChange} getFilteredEntities={getFilteredEntities} />

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
                  <AutoComplete
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
        { key: 'yesterdayUsage', name: t('configField.yesterdayUsage') },
        { key: 'monthlyUsage', name: t('configField.monthlyUsage') },
        { key: 'yearlyUsage', name: t('configField.yearlyUsage') },
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
                  <AutoComplete
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
      return <ClimateFeaturesConfig field={field} value={value} onChange={onChange} getFilteredEntities={getFilteredEntities} />

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
                  <AutoComplete
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
                <Button
                  style={{ width: '100px' }}
                  type="primary"
                  danger
                  onClick={() => {
                    const newSensors = [...value];
                    newSensors.splice(index, 1);
                    onChange(newSensors);
                  }}
                >
                  {t('configField.deleteButton')}
                </Button>
              </div>
            ))}
          </div>
          <Button
            style={{ width: '100px' ,marginTop: '10px'}}
            type="primary"
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
          </Button>
        </div>
      );

    case 'universal-entities':
      return <UniversalConfig field={field} value={value} onChange={onChange} allEntities={allEntities} />

    case 'persons-config':
      const personEntities = getFilteredEntities('person.*');

      return (
        <div className="config-field">
          <label>{field.label}</label>
          <div className="persons-config">
            {(value || []).map((person, index) => (
              <div key={index} className="person-item">
                <div className="person-item-row">
                  <AutoComplete
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
                  <Button
                    type="primary"
                    danger
                    style={{ marginTop: '0' }}
                    onClick={() => {
                      const newPersons = [...value];
                      newPersons.splice(index, 1);
                      onChange(newPersons);
                    }}
                  >
                    {t('configField.deleteButton')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button
            type="primary"
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
          </Button>
        </div>
      );

    case 'quotes-config':
      return <DailyQuoteConfig field={field} value={value} onChange={onChange} />

    case 'group-select':
      const { groups = [] } = field;
      const groupOptions = [
        { id: 'default', name: t('groups.default') },
        ...groups.sort((a, b) => a.order - b.order)
      ];

      return (
        <div className="config-field">
          <div className="config-field-row">
            <label>{field.label || t('groups.selectGroup')}</label>
            <AutoComplete
              allowClear
              value={value || 'default'}
              onChange={onChange}
              placeholder={t('groups.selectGroup')}
              options={groupOptions.map(group => ({
                value: group.id,
                label: group.name
              }))}
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default ConfigField; 