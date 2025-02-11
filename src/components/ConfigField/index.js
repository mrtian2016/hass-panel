import React from 'react';
import { useHass } from '@hakit/core';
import { Select, Input } from 'antd';
// import Icon from '@mdi/react';
// import { mdiDelete, mdiPlus } from '@mdi/js';
import './style.css';
import { useLanguage } from '../../i18n/LanguageContext';

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
      return (
        <div className="config-field">
          <label>{field.label}</label>
          <div className="light-overview-config">
            {Array.isArray(value) && value.map((room, index) => (
              <div key={index} className="light-room-item">
                <div className="room-field">
                  <label>{t('configField.roomName')}</label>
                  <Input
                    value={room.name}
                    onChange={(e) => handleLightOverviewChange(index, 'name', e.target.value)}
                    placeholder={t('configField.placeholderRoomName')}
                  />
                </div>
                
                <div className="room-field">
                  <label>{t('configField.selectEntity')}</label>
                  <Select
                    allowClear
                    value={room.entity_id}
                    onChange={(value) => handleLightOverviewChange(index, 'entity_id', value)}
                    showSearch
                    placeholder={t('configField.selectEntityPlaceholder')}
                    optionFilterProp="children"
                    style={{ width: '100%' }}
                  >
                    {getFilteredEntities('light.*|switch.*').map(entity => (
                      <Select.Option key={entity.id} value={entity.id}>
                        {entity.name} ({entity.id})
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                <div className="room-field">
                  <label>{t('configField.buttonPositionLeft')}</label>
                  <Input
                    value={room.position?.left}
                    onChange={(e) => handleLightOverviewChange(index, 'position', { ...room.position, left: e.target.value })}
                    placeholder={t('configField.placeholderPositionLeft')}
                  />
                </div>

                <div className="room-field">
                  <label>{t('configField.buttonPositionTop')}</label>
                  <Input
                    value={room.position?.top}
                    onChange={(e) => handleLightOverviewChange(index, 'position', { ...room.position, top: e.target.value })}
                    placeholder={t('configField.placeholderPositionTop')}
                  />
                </div>

                <div className="room-field">
                  <label>{t('configField.lightEffectImage')}</label>
                  <Input
                    value={room.image}
                    onChange={(e) => handleLightOverviewChange(index, 'image', e.target.value)}
                    placeholder={t('configField.placeholderLightEffectImage')}
                  />
                </div>

                <button onClick={() => handleDeleteRoom(index)}>{t('configField.deleteButton')}</button>
              </div>
            ))}
          </div>
          <button onClick={handleAddRoom}>{t('configField.addButton')}</button>
        </div>
      );

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
      const lightEntities = getFilteredEntities('light.*|switch.*');
      
      return (
        <div className="config-field">
          <label>{field.label}</label>
          <div className="lights-config">
            {Object.entries(value || {}).map(([key, light], index, array) => (
              <div key={key} className="light-item">
                <div className="light-item-content">
                  <Input
                    type="text"
                    value={light.name || null}
                    onChange={(e) => {
                      onChange({
                        ...value,
                        [key]: {
                          ...light,
                          name: e.target.value
                        }
                      });
                    }}
                    placeholder={t('configField.lightName')}
                  />
                  <Select
                    allowClear
                    value={light.entity_id || null}
                    onChange={(selectedValue) => {
                      const currentValue = typeof value === 'object' ? value : {};
                      onChange({
                        ...currentValue,
                        [key]: {
                          ...light,
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
                    options={lightEntities.map(entity => ({
                      value: entity.id,
                      label: entity.name + ' (' + entity.id + ')'
                    }))}
                  />
                </div>
                <div className="light-item-actions">
                  <div className="order-buttons">
                    <button
                      className="order-button"
                      onClick={() => {
                        const entries = Object.entries(value || {});
                        if (index > 0) {
                          const newEntries = [...entries];
                          [newEntries[index - 1], newEntries[index]] = [newEntries[index], newEntries[index - 1]];
                          onChange(Object.fromEntries(newEntries));
                        }
                      }}
                      disabled={index === 0}
                    >
                      ↑ 上移
                    </button>
                    <button
                      className="order-button"
                      onClick={() => {
                        const entries = Object.entries(value || {});
                        if (index < entries.length - 1) {
                          const newEntries = [...entries];
                          [newEntries[index], newEntries[index + 1]] = [newEntries[index + 1], newEntries[index]];
                          onChange(Object.fromEntries(newEntries));
                        }
                      }}
                      disabled={index === array.length - 1}
                    >
                      ↓ 下移
                    </button>
                  </div>
                  <button
                    className="delete-button"
                    onClick={() => {
                      const currentValue = typeof value === 'object' ? value : {};
                      const newValue = { ...currentValue };
                      delete newValue[key];
                      onChange(newValue);
                    }}
                  >
                    {t('configField.deleteButton')}
                  </button>
                </div>
              </div>
            ))}
            <button
              className="add-button"
              onClick={() => {
                const newKey = 'light_' + Date.now();
                const currentValue = typeof value === 'object' ? value : {};
                onChange({
                  ...currentValue,
                  [newKey]: {
                    entity_id: '',
                    name: '',
                    room: ''
                  }
                });
              }}
            >
              {t('configField.addButton')}
            </button>
          </div>
        </div>
      );

    case 'cameras-config':
      const cameraEntities = getFilteredEntities('camera.*');
      
      return (
        <div className="config-field">
          <label>{field.label}</label>
          <div className="cameras-config">
            {(value || []).map((camera, index) => (
              <div key={index} className="camera-item">
                <Input
                  type="text"
                  value={camera.name || null}
                  onChange={(e) => {
                    const newCameras = [...value];
                    newCameras[index] = {
                      ...camera,
                      name: e.target.value
                    };
                    onChange(newCameras);
                  }}
                  placeholder={t('configField.cameraName')}
                />
                <Select
                  allowClear
                  value={camera.entity_id || null}
                  onChange={(selectedValue) => {
                    const newCameras = [...value];
                    newCameras[index] = {
                      ...camera,
                      entity_id: selectedValue
                    };
                    onChange(newCameras);
                  }}
                  showSearch
                  placeholder={t('configField.selectEntity')}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={cameraEntities.map(entity => ({
                    value: entity.id,
                    label: entity.name + ' (' + entity.id + ')'
                  }))}
                />
                <Input
                  type="text"
                  value={camera.stream_url || null}
                  onChange={(e) => {
                    const newCameras = [...value];
                    newCameras[index] = {
                      ...camera,
                      stream_url: e.target.value
                    };
                    onChange(newCameras);
                  }}
                  placeholder={t('configField.streamUrl')}
                />
                
                <button
                  onClick={() => {
                    const newCameras = [...value];
                    newCameras.splice(index, 1);
                    onChange(newCameras);
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
                    stream_url: '',
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
      const nasEntities = getFilteredEntities('sensor.*');
      const nasMainFields = [
        { key: 'cpuTemp', name: t('configField.cpuTemp') },
        { key: 'cpuUsage', name: t('configField.cpuUsage') },
        { key: 'memoryUsage', name: t('configField.memoryUsage') },
        { key: 'uploadSpeed', name: t('configField.uploadSpeed') },
        { key: 'downloadSpeed', name: t('configField.downloadSpeed') }
      ];

      const volumeFields = [
        { key: 'status', name: t('configField.status') },
        { key: 'usage', name: t('configField.volumeUsage') },
        { key: 'total', name: t('configField.volumeTotal') },
        { key: 'usagePercent', name: t('configField.volumeUsedPercent') },
        { key: 'avgTemperature', name: t('configField.volumeAvgTemp') }
      ];

      const driveFields = [
        { key: 'status', name: t('configField.status') },
        { key: 'temperature', name: t('configField.temperature') }
      ];

      const m2ssdFields = [
        { key: 'status', name: t('configField.status') },
        { key: 'temperature', name: t('configField.temperature') }
      ];
      
      return (
        <div className="config-field">
          <label>{field.label}</label>
          <div className="nas-config">
            <div className="nas-section">
              <h4>{t('configField.mainInfo')}</h4>
              {nasMainFields.map(nasField => {
                const currentValue = value.main?.[nasField.key] || {};
                
                return (
                  <div key={nasField.key} className="nas-field">
                    <span className="field-name">{nasField.name}</span>
                    <Select
                      allowClear
                      value={currentValue.entity_id || null}
                      onChange={(selectedValue) => {
                        onChange({
                          ...value,
                          main: {
                            ...(value.main || {}),
                            [nasField.key]: {
                              entity_id: selectedValue,
                              name: nasField.name
                            }
                          }
                        });
                      }}
                      showSearch
                      placeholder={`${t('configField.selectEntity')}`}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={nasEntities.map(entity => ({
                        value: entity.id,
                        label: entity.name + ' (' + entity.id + ')'
                      }))}
                    />
                  </div>
                );
              })}
            </div>

            <div className="nas-section">
              <h4>{t('configField.volumes')}</h4>
              {(value.volumes || []).map((volume, volumeIndex) => (
                <div key={volumeIndex} className="volume-config">
                  <Input
                    type="text"
                    value={volume.name || null}
                    onChange={(e) => {
                      const newVolumes = [...(value.volumes || [])];
                      newVolumes[volumeIndex] = {
                        ...volume,
                        name: e.target.value
                      };
                      onChange({
                        ...value,
                        volumes: newVolumes
                      });
                    }}
                    placeholder={`${t('configField.storagePoolName')}`}
                  />
                  {volumeFields.map(field => {
                    const currentValue = volume[field.key] || {};
                    
                    return (
                      <div key={field.key} className="volume-field">
                        <span className="field-name">{field.name}</span>
                        <Select
                          allowClear
                          value={currentValue.entity_id || null}
                          onChange={(selectedValue) => {
                            const newVolumes = [...(value.volumes || [])];
                            newVolumes[volumeIndex] = {
                              ...volume,
                              [field.key]: {
                                entity_id: selectedValue,
                                name: field.name
                              }
                            };
                            onChange({
                              ...value,
                              volumes: newVolumes
                            });
                          }}
                          showSearch
                          placeholder={`${t('configField.selectEntity')}`}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                          options={nasEntities.map(entity => ({
                            value: entity.id,
                            label: entity.name + ' (' + entity.id + ')'
                          }))}
                        />
                      </div>
                    );
                  })}
                  <button
                    onClick={() => {
                      const newVolumes = [...(value.volumes || [])];
                      newVolumes.splice(volumeIndex, 1);
                      onChange({
                        ...value,
                        volumes: newVolumes
                      });
                    }}
                  >
                    {t('configField.deleteButton')}
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  onChange({
                    ...value,
                    volumes: [
                      ...(value.volumes || []),
                      {
                        name: '',
                        status: {},
                        usage: {},
                        total: {},
                        usagePercent: {},
                        avgTemperature: {}
                      }
                    ]
                  });
                }}
              >
                {t('configField.addButton')}
              </button>
            </div>

            <div className="nas-section">
              <h4>{t('configField.drives')}</h4>
              {(value.drives || []).map((drive, driveIndex) => (
                <div key={driveIndex} className="drive-config">
                  <Input
                    type="text"
                    value={drive.name || null}
                    onChange={(e) => {
                      const newDrives = [...(value.drives || [])];
                      newDrives[driveIndex] = {
                        ...drive,
                        name: e.target.value
                      };
                      onChange({
                        ...value,
                        drives: newDrives
                      });
                    }}
                    placeholder={`${t('configField.driveName')}`}
                  />
                  {driveFields.map(field => {
                    const currentValue = drive[field.key] || {};
                    
                    return (
                      <div key={field.key} className="drive-field">
                        <span className="field-name">{field.name}</span>
                        <Select
                          allowClear
                          value={currentValue.entity_id || null}
                          onChange={(selectedValue) => {
                            const newDrives = [...(value.drives || [])];
                            newDrives[driveIndex] = {
                              ...drive,
                              [field.key]: {
                                entity_id: selectedValue,
                                name: field.name
                              }
                            };
                            onChange({
                              ...value,
                              drives: newDrives
                            });
                          }}
                          showSearch
                          placeholder={t('configField.selectEntity')}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                          options={nasEntities.map(entity => ({
                            value: entity.id,
                            label: entity.name + ' (' + entity.id + ')'
                          }))}
                        />
                      </div>
                    );
                  })}
                  <button
                    onClick={() => {
                      const newDrives = [...(value.drives || [])];
                      newDrives.splice(driveIndex, 1);
                      onChange({
                        ...value,
                        drives: newDrives
                      });
                    }}
                  >
                    {t('configField.deleteButton')}
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  onChange({
                    ...value,
                    drives: [
                      ...(value.drives || []),
                      {
                        name: '',
                        status: {},
                        temperature: {}
                      }
                    ]
                  });
                }}
              >
                {t('configField.addButton')}
              </button>
            </div>

            <div className="nas-section">
              <h4>{t('configField.m2ssd')}</h4>
              {(value.m2ssd || []).map((ssd, ssdIndex) => (
                <div key={ssdIndex} className="m2ssd-config">
                  <Input
                    type="text"
                    value={ssd.name || null}
                    onChange={(e) => {
                      const newSsds = [...(value.m2ssd || [])];
                      newSsds[ssdIndex] = {
                        ...ssd,
                        name: e.target.value
                      };
                      onChange({
                        ...value,
                        m2ssd: newSsds
                      });
                    }}
                    placeholder={`${t('configField.ssdName')}`}
                  />
                  {m2ssdFields.map(field => {
                    const currentValue = ssd[field.key] || {};
                    
                    return (
                      <div key={field.key} className="m2ssd-field">
                        <span className="field-name">{field.name}</span>
                        <Select
                          allowClear
                          value={currentValue.entity_id || null}
                          onChange={(selectedValue) => {
                            const newSsds = [...(value.m2ssd || [])];
                            newSsds[ssdIndex] = {
                              ...ssd,
                              [field.key]: {
                                entity_id: selectedValue,
                                name: field.name
                              }
                            };
                            onChange({
                              ...value,
                              m2ssd: newSsds
                            });
                          }}
                          showSearch
                          placeholder={t('configField.selectEntity')}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                          options={nasEntities.map(entity => ({
                            value: entity.id,
                            label: entity.name + ' (' + entity.id + ')'
                          }))}
                        />
                      </div>
                    );
                  })}
                  <button
                    onClick={() => {
                      const newSsds = [...(value.m2ssd || [])];
                      newSsds.splice(ssdIndex, 1);
                      onChange({
                        ...value,
                        m2ssd: newSsds
                      });
                    }}
                  >
                    {t('configField.deleteButton')}
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  onChange({
                    ...value,
                    m2ssd: [
                      ...(value.m2ssd || []),
                      {
                        name: '',
                        status: {},
                        temperature: {}
                      }
                    ]
                  });
                }}
              >
                {t('configField.addButton')}
              </button>
            </div>
          </div>
        </div>
      );

    case 'scripts-config':
      const scriptEntities = getFilteredEntities('script.*');
      const scriptIcons = ['log-out', 'log-in', 'clapperboard', 'moon'];
      
      return (
        <div className="config-field">
          <label>{field.label}</label>
          <div className="scripts-config">
            {(value || []).map((script, index) => (
              <div key={index} className="script-item">
                <Input
                  type="text"
                  value={script.name || null}
                  onChange={(e) => {
                    const newScripts = [...value];
                    newScripts[index] = {
                      ...script,
                      name: e.target.value
                    };
                    onChange(newScripts);
                  }}
                  placeholder={`${t('configField.scriptName')}`}
                />
                <Select
                  allowClear
                  value={script.entity_id || null}
                  onChange={(selectedValue) => {
                    const newScripts = [...value];
                    newScripts[index] = {
                      ...script,
                      entity_id: selectedValue
                    };
                    onChange(newScripts);
                  }}
                  showSearch
                  placeholder={t('configField.selectEntity')}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={scriptEntities.map(entity => ({
                    value: entity.id,
                    label: entity.name + ' (' + entity.id + ')'
                  }))}
                />
                <Select
                  allowClear
                  value={script.icon || null}
                  onChange={(selectedValue) => {
                    const newScripts = [...value];
                    newScripts[index] = {
                      ...script,
                      icon: selectedValue
                    };
                    onChange(newScripts);
                  }}
                  showSearch
                  placeholder={t('configField.selectIcon')}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={scriptIcons.map(icon => ({
                    value: icon,
                    label: icon
                  }))}
                />
                <button
                  onClick={() => {
                    const newScripts = [...value];
                    newScripts.splice(index, 1);
                    onChange(newScripts);
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
                    name: '',
                    entity_id: '',
                    icon: ''
                  }
                ]);
              }}
            >
              {t('configField.addButton')}
            </button>
          </div>
        </div>
      );

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
        { key: 'todayUsage', name: t('configField.todayUsage') },
        { key: 'yesterdayUsage', name: t('configField.yesterdayUsage') },
        { key: 'monthUsage', name: t('configField.monthUsage') },
        { key: 'lastMonthUsage', name: t('configField.lastMonthUsage') },
        { key: 'yearlyUsage', name: t('configField.yearlyUsage') },
        { key: 'dailyHistory', name: t('configField.dailyHistory') }
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
      
    default:
      return null;
  }
}

export default ConfigField; 