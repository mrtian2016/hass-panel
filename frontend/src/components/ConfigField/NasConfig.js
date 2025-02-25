
import { useLanguage } from '../../i18n/LanguageContext';
import { Input, AutoComplete, Button } from 'antd';

function NasConfig({ field, value, onChange, getFilteredEntities }) {
    const { t } = useLanguage();
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
              const currentValue = value?.main?.[nasField.key] || {};
              
              return (
                <div key={nasField.key} className="nas-field">
                  <span className="field-name">{nasField.name}</span>
                  <AutoComplete
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
            {(value?.volumes || []).map((volume, volumeIndex) => (
              <div key={volumeIndex} className="volume-config">
                <Input
                  type="text"
                  value={volume.name || null}
                  onChange={(e) => {
                    const newVolumes = [...(value?.volumes || [])];
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
                      <AutoComplete
                        allowClear
                        value={currentValue.entity_id || null}
                        onChange={(selectedValue) => {
                          const newVolumes = [...(value?.volumes || [])];
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
                <Button
                  type="primary"
                  style={{ width: '100px' }}
                  danger
                  onClick={() => {
                    const newVolumes = [...(value?.volumes || [])];
                    newVolumes.splice(volumeIndex, 1);
                    onChange({
                      ...value,
                      volumes: newVolumes
                    });
                  }}
                >
                  {t('configField.deleteButton')}
                </Button>
              </div>
            ))}
            <Button
              type="primary"
              style={{ width: '100px' }}
              onClick={() => {
                onChange({
                  ...value,
                  volumes: [
                    ...(value?.volumes || []),
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
            </Button>
          </div>

          <div className="nas-section">
            <h4>{t('configField.drives')}</h4>
            {(value?.drives || []).map((drive, driveIndex) => (
              <div key={driveIndex} className="drive-config">
                <Input
                  type="text"
                  value={drive.name || null}
                  onChange={(e) => {
                    const newDrives = [...(value?.drives || [])];
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
                      <AutoComplete
                        allowClear
                        value={currentValue.entity_id || null}
                        onChange={(selectedValue) => {
                          const newDrives = [...(value?.drives || [])];
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
                <Button
                  type="primary"
                  style={{ width: '100px' }}
                  danger
                  onClick={() => {
                    const newDrives = [...(value?.drives || [])];
                    newDrives.splice(driveIndex, 1);
                    onChange({
                      ...value,
                      drives: newDrives
                    });
                  }}
                >
                  {t('configField.deleteButton')}
                </Button>
              </div>
            ))}
            <Button
              type="primary"
              style={{ width: '100px' }}
              onClick={() => {
                onChange({
                  ...value,
                  drives: [
                    ...(value?.drives || []),
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
            </Button>
          </div>

          <div className="nas-section">
            <h4>{t('configField.m2ssd')}</h4>
            {(value?.m2ssd || []).map((ssd, ssdIndex) => (
              <div key={ssdIndex} className="m2ssd-config">
                <Input
                  type="text"
                  value={ssd.name || null}
                  onChange={(e) => {
                    const newSsds = [...(value?.m2ssd || [])];
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
                      <AutoComplete
                        allowClear
                        value={currentValue.entity_id || null}
                        onChange={(selectedValue) => {
                          const newSsds = [...(value?.m2ssd || [])];
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
                <Button
                  type="primary"
                  style={{ width: '100px' }}
                  danger
                  onClick={() => {
                    const newSsds = [...(value?.m2ssd || [])];
                    newSsds.splice(ssdIndex, 1);
                    onChange({
                      ...value,
                      m2ssd: newSsds
                    });
                  }}
                >
                  {t('configField.deleteButton')}
                </Button>
              </div>
            ))}
            <Button
              type="primary"
              style={{ width: '100px' }}
              onClick={() => {
                onChange({
                  ...value,
                  m2ssd: [
                    ...(value?.m2ssd || []),
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
            </Button>
          </div>
        </div>
      </div>
    );
}

export default NasConfig;
