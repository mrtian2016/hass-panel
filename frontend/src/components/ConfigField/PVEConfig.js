import { useLanguage } from '../../i18n/LanguageContext';
import { Input, AutoComplete,Button } from 'antd';

function PveConfig({ field, value, onChange, getFilteredEntities }) {
    const { t } = useLanguage();
    const pveEntities = getFilteredEntities('sensor.*');
    const buttonEntities = getFilteredEntities('button.*');
    const pveMainFields = [
      { key: 'cpuTemp', name: t('configField.cpuTemp') },
      { key: 'cpuUsage', name: t('configField.cpuUsage') },
      { key: 'uploadSpeed', name: t('configField.uploadSpeed') },
      { key: 'downloadSpeed', name: t('configField.downloadSpeed') },
      { key: 'memoryUsage', name: t('configField.memoryUsage') },
      { key: 'vmCount', name: t('configField.vmCount') },
      { key: 'containerCount', name: t('configField.containerCount') },
      { key: 'status', name: t('configField.status') },
      { key: 'lastBoot', name: t('configField.lastBoot') },

    ];

    const vmFields = [
      { key: 'status', name: t('configField.status') },
      { key: 'cpuUsage', name: t('configField.cpuUsage') },
      { key: 'memoryUsage', name: t('configField.memoryUsage') },
      { key: 'lastBoot', name: t('configField.lastBoot') },
      { key: 'startOption', name: t('configField.startOption'),type: 'button' },
      { key: 'stopOption', name: t('configField.stopOption'),type: 'button' },
      { key: 'restartOption', name: t('configField.restartOption'),type: 'button' },
      { key: 'shutdownOption', name: t('configField.shutdownOption'),type: 'button' },
    ];

    const driveFields = [
      { key: 'status', name: t('configField.status') },
      { key: 'diskUsage', name: t('configField.diskUsage') },
      { key: 'temperature', name: t('configField.temperature') },
      { key: 'powerCycleCount', name: t('configField.powerCycleCount') },
      { key: 'powerOnTime', name: t('configField.powerOnTime') },
      { key: 'diskSize', name: t('configField.diskSize') },
    ];

    
    return (
      <div className="config-field">
        <label>{field.label}</label>
        <div className="pve-config">
          <div className="pve-section">
            <h4>{t('configField.mainInfo')}</h4>
            <div className="pve-field">
              <span className="field-name">{t('configField.nodeName')}</span>
              <Input
                value={value?.nodeName || ''}
                onChange={(e) => {
                  onChange({
                    ...value,
                    nodeName: e.target.value
                  });
                }}
                placeholder={t('configField.nodeName')}
              />
            </div>
            {pveMainFields.map(pveField => {
              const currentValue = value?.main?.[pveField.key] || {};
              
              return (
                <div key={pveField.key} className="pve-field">
                  <span className="field-name">{pveField.name}</span>
                  <AutoComplete
                    allowClear
                    value={currentValue.entity_id || null}
                    onChange={(selectedValue) => {
                      onChange({
                        ...value,
                        main: {
                          ...(value.main || {}),
                          [pveField.key]: {
                            entity_id: selectedValue,
                            name: pveField.name
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
                    options={pveEntities.map(entity => ({
                      value: entity.id,
                      label: entity.name + ' (' + entity.id + ')'
                    }))}
                  />
                </div>
              );
            })}
          </div>

          <div className="pve-section">
            <h4>{t('configField.vms')}</h4>
            {(value?.vms || []).map((vm, vmIndex) => (
              <div key={vmIndex} className="vm-config">
                <Input
                  type="text"
                  value={vm.name || null}
                  onChange={(e) => {
                    const newVm = [...(value?.vms || [])];
                    newVm[vmIndex] = {
                      ...vm,
                      name: e.target.value
                    };
                    onChange({
                      ...value,
                      vms: newVm
                    });
                  }}
                  placeholder={`${t('configField.vmName')}`}
                />
                {vmFields.map(field => {
                  const currentValue = vm[field.key] || {};
                  
                  return (
                    <div key={field.key} className="vm-field">
                      <span className="field-name">{field.name}</span>
                      <AutoComplete
                        allowClear
                        value={currentValue.entity_id || null}
                        onChange={(selectedValue) => {
                          const newVms = [...(value?.vms || [])];
                          newVms[vmIndex] = {
                            ...vm,
                            [field.key]: {
                              entity_id: selectedValue,
                              name: field.name
                            }
                          };
                          onChange({
                            ...value,
                            vms: newVms
                          });
                        }}
                        showSearch
                        placeholder={`${t('configField.selectEntity')}`}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={field.type === 'button' ? buttonEntities.map(entity => ({
                          value: entity.id,
                          label: entity.name + ' (' + entity.id + ')'
                        })) : pveEntities.map(entity => ({
                          value: entity.id,
                          label: entity.name + ' (' + entity.id + ')'
                        }))}
                      />
                    </div>
                  );
                })}
                <Button
                  danger
                  style={{ width: '100px' }}
                  type="primary"
                  onClick={() => {
                    const newVms = [...(value?.vms || [])];
                    newVms.splice(vmIndex, 1);
                    onChange({
                      ...value,
                      vms: newVms
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
                  vms: [
                    ...(value?.vms || []),
                    {
                      name: '',
                      status: {},
                      cpuUsage: {},
                      memoryUsage: {},
                      lastBoot: {},
                      startOption: {},
                      stopOption: {},
                      restartOption: {},
                      shutdownOption: {}
                    }
                  ]
                });
              }}
            >
              {t('configField.addButton')}
            </Button>
          </div>

          <div className="pve-section">
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
                        options={pveEntities.map(entity => ({
                          value: entity.id,
                          label: entity.name + ' (' + entity.id + ')'
                        }))}
                      />
                    </div>
                  );
                })}
                <Button
                  danger
                  style={{ width: '100px' }}
                  type="primary"
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
        </div>
      </div>
    );
}

export default PveConfig;
