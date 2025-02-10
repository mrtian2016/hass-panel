import React from 'react';
import { useHass } from '@hakit/core';
import { Select, Input } from 'antd';
// import Icon from '@mdi/react';
// import { mdiDelete, mdiPlus } from '@mdi/js';
import './style.css';

function ConfigField({ field, value, onChange }) {
  const { getAllEntities } = useHass();
  const allEntities = getAllEntities();
  
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

  // 添加新的房间灯光
  const handleAddRoom = () => {
    onChange([...value, {
      name: '',
      entity_id: '',
      position: { top: '50%', left: '50%' },
      image: ''
    }]);
  };

  // 删除房间灯光
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
              value={value}
              onChange={onChange}
              showSearch
              placeholder="选择实体"
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
                  <label>房间名称</label>
                  <Input
                    value={room.name}
                    onChange={(e) => handleLightOverviewChange(index, 'name', e.target.value)}
                    placeholder="输入房间名称"
                  />
                </div>
                
                <div className="room-field">
                  <label>灯光实体</label>
                  <Select
                    value={room.entity_id}
                    onChange={(value) => handleLightOverviewChange(index, 'entity_id', value)}
                    showSearch
                    placeholder="选择灯光实体"
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
                  <label>按钮位置 - 左边距</label>
                  <Input
                    value={room.position?.left}
                    onChange={(e) => handleLightOverviewChange(index, 'position', { ...room.position, left: e.target.value })}
                    placeholder="例如: 50%"
                  />
                </div>

                <div className="room-field">
                  <label>按钮位置 - 上边距</label>
                  <Input
                    value={room.position?.top}
                    onChange={(e) => handleLightOverviewChange(index, 'position', { ...room.position, top: e.target.value })}
                    placeholder="例如: 50%"
                  />
                </div>

                <div className="room-field">
                  <label>灯光效果图片</label>
                  <Input
                    value={room.image}
                    onChange={(e) => handleLightOverviewChange(index, 'image', e.target.value)}
                    placeholder="输入图片URL"
                  />
                </div>

                <button onClick={() => handleDeleteRoom(index)}>删除</button>
              </div>
            ))}
          </div>
          <button onClick={handleAddRoom}>添加</button>
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
                  删除
                </button>
              </div>
            ))}
            <Select
              value=""
              onChange={(value) => {
                if (value) {
                  onChange([...selectedEntities, value]);
                }
              }}
              showSearch
              placeholder="添加实体"
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
                  placeholder="房间名称"
                />
                <div className="sensor-config-list">
                  {Object.entries(group.sensors || {}).map(([type, sensor]) => (
                    <div key={type} className="sensor-config-item">
                      <span className="sensor-config-type">{sensor.name}</span>
                      <Select
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
                        placeholder={`选择${type === 'temperature' ? '温度' : '湿度'}传感器`}
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
                  删除
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
                        name: '温度',
                        icon: 'mdiThermometer'
                      },
                      humidity: {
                        entity_id: '',
                        name: '湿度',
                        icon: 'mdiWaterPercent'
                      }
                    }
                  }
                ]);
              }}
            >
              添加
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
                    placeholder="灯光名称"
                  />
                  <Select
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
                    placeholder="选择灯光实体"
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
                    删除
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
              添加
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
                  placeholder="摄像头名称"
                />
                <Select
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
                  placeholder="选择摄像头实体"
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
                  placeholder="流地址"
                />
                
                <button
                  onClick={() => {
                    const newCameras = [...value];
                    newCameras.splice(index, 1);
                    onChange(newCameras);
                  }}
                >
                  删除
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
              添加
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
                  placeholder="播放器名称"
                />
                <Select
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
                  placeholder="选择播放器实体"
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
                  删除
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
              添加
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
                  placeholder="窗帘名称"
                />
                <Select
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
                  placeholder="选择窗帘实体"
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
                  删除
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
              添加
            </button>
          </div>
        </div>
      );

    case 'router-config':
      const routerEntities = getFilteredEntities('sensor.*');
      const routerFields = [
        { key: 'sysName', name: '系统名称' },
        { key: 'sysDesc', name: '系统描述' },
        { key: 'cpuTemp', name: 'CPU温度' },
        { key: 'uptime', name: '运行时间' },
        { key: 'cpuUsage', name: 'CPU使用率' },
        { key: 'memoryUsage', name: '内存占用' },
        { key: 'onlineUsers', name: '在线用户' },
        { key: 'networkConnections', name: '网络连接数' },
        { key: 'wanIp', name: 'WAN IP' },
        { key: 'wanDownloadSpeed', name: 'WAN 下载' },
        { key: 'wanUploadSpeed', name: 'WAN 上传' }
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
                    placeholder="选择实体"
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
        { key: 'cpuTemp', name: 'CPU温度' },
        { key: 'cpuUsage', name: 'CPU使用率' },
        { key: 'memoryUsage', name: '内存占用' },
        { key: 'uploadSpeed', name: '上传速度' },
        { key: 'downloadSpeed', name: '下载速度' }
      ];

      const volumeFields = [
        { key: 'status', name: '状态' },
        { key: 'usage', name: '使用空间' },
        { key: 'total', name: '总空间' },
        { key: 'usagePercent', name: '使用率' },
        { key: 'avgTemperature', name: '平均温度' }
      ];

      const driveFields = [
        { key: 'status', name: '状态' },
        { key: 'temperature', name: '温度' }
      ];

      const m2ssdFields = [
        { key: 'status', name: '状态' },
        { key: 'temperature', name: '温度' }
      ];
      
      return (
        <div className="config-field">
          <label>{field.label}</label>
          <div className="nas-config">
            <div className="nas-section">
              <h4>主要信息</h4>
              {nasMainFields.map(nasField => {
                const currentValue = value.main?.[nasField.key] || {};
                
                return (
                  <div key={nasField.key} className="nas-field">
                    <span className="field-name">{nasField.name}</span>
                    <Select
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
                      placeholder="选择实体"
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
              <h4>存储池</h4>
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
                    placeholder="存储池名称"
                  />
                  {volumeFields.map(field => {
                    const currentValue = volume[field.key] || {};
                    
                    return (
                      <div key={field.key} className="volume-field">
                        <span className="field-name">{field.name}</span>
                        <Select
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
                          placeholder={`选择${field.name}`}
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
                    删除
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
                添加
              </button>
            </div>

            <div className="nas-section">
              <h4>硬盘</h4>
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
                    placeholder="硬盘名称"
                  />
                  {driveFields.map(field => {
                    const currentValue = drive[field.key] || {};
                    
                    return (
                      <div key={field.key} className="drive-field">
                        <span className="field-name">{field.name}</span>
                        <Select
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
                          placeholder={`选择${field.name}`}
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
                    删除
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
                添加
              </button>
            </div>

            <div className="nas-section">
              <h4>M.2 SSD</h4>
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
                    placeholder="SSD名称"
                  />
                  {m2ssdFields.map(field => {
                    const currentValue = ssd[field.key] || {};
                    
                    return (
                      <div key={field.key} className="m2ssd-field">
                        <span className="field-name">{field.name}</span>
                        <Select
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
                          placeholder={`选择${field.name}`}
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
                    删除
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
                添加
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
                  placeholder="脚本名称"
                />
                <Select
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
                  placeholder="选择脚本实体"
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
                  placeholder="选择图标"
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
                  删除
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
              添加
            </button>
          </div>
        </div>
      );

    case 'waterpuri-config':
      const waterPuriEntities = getFilteredEntities('sensor.*');
      const waterPuriFields = [
        { key: 'temperature', name: '温度' },
        { key: 'tds_in', name: '进水TDS' },
        { key: 'tds_out', name: '出水TDS' },
        { key: 'pp_filter_life', name: 'PP棉剩余寿命' },
        { key: 'ro_filter_life', name: 'RO反渗透滤芯剩余寿命' },
        { key: 'status', name: '状态' }
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
                    placeholder="选择实体"
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
        { key: 'currentPower', name: '当前总功率' },
        { key: 'voltage', name: '实时电压' },
        { key: 'electric_current', name: '实时电流' },
        { key: 'todayUsage', name: '今日用电量' },
        { key: 'yesterdayUsage', name: '昨日用电量' },
        { key: 'monthUsage', name: '月度用电量' },
        { key: 'lastMonthUsage', name: '上月用电量' },
        { key: 'yearlyUsage', name: '年度用电量' },
        { key: 'dailyHistory', name: '每日用电量' }
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
                    placeholder="选择实体"
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
          name: '节能',
          icon: 'mdiLeaf',
          disableWhen: {
            state: 'off'
          }
        },
        sleep: {
          name: '睡眠',
          icon: 'mdiPowerSleep',
          disableWhen: {
            state: 'off'
          }
        },
        heater: {
          name: '辅热',
          icon: 'mdiHeatingCoil',
          disableWhen: {
            state: 'off'
          },
          enableWhen: {
            mode: 'heat'
          }
        },
        unStraightBlowing: {
          name: '防直吹',
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
          name: '新风',
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
                    placeholder="选择功能"
                    optionFilterProp="children"
                    options={Object.values(predefinedFeatures).map(f => ({
                      value: f.name,
                      label: f.name
                    }))}
                  />
                
              
                    <Select
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
                      placeholder="选择开关实体"
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
                    删除
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
              添加
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
                  <span className="field-name">传感器名称</span>
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
                    placeholder="传感器名称"
                  />
                </div>
                <div className="config-field-row">
                  <span className="field-name">传感器实体</span>
                  <Select
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
                    placeholder="选择光照传感器实体"
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
                  删除
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
            添加
          </button>
        </div>
      );
      
    default:
      return null;
  }
}

export default ConfigField; 