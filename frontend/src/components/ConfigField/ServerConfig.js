import { useLanguage } from '../../i18n/LanguageContext';
import { Input, AutoComplete } from 'antd';

function ServerConfig({ field, value, onChange, getFilteredEntities }) {
    const { t } = useLanguage();
    const serverEntities = getFilteredEntities('sensor.*');
    const serverMainFields = [
      { key: 'cpuTemp', name: t('configField.cpuTemp') },
      { key: 'cpuUsage', name: t('configField.cpuUsage') },
      { key: 'memoryUsage', name: t('configField.memoryUsage') },
      { key: 'uploadSpeed', name: t('configField.uploadSpeed') },
      { key: 'downloadSpeed', name: t('configField.downloadSpeed') },
      { key: 'uptime', name: t('configField.uptime') },
      { key: 'threads', name: t('configField.threads') },
    ];

    
    return (
      <div className="config-field">
        <label>{field.label}</label>
        <div className="pve-config">
          <div className="pve-section">
            <h4>{t('configField.mainInfo')}</h4>
            <div className="pve-field">
              <span className="field-name">{t('configField.serverName')}</span>
              <Input
                value={value?.serverName || ''}
                onChange={(e) => {
                  onChange({
                    ...value,
                    serverName: e.target.value
                  });
                }}
                placeholder={t('configField.serverName')}
              />
            </div>
            {serverMainFields.map(serverField => {
              const currentValue = value?.main?.[serverField.key] || {};
              
              return (
                <div key={serverField.key} className="pve-field">
                  <span className="field-name">{serverField.name}</span>
                  <AutoComplete
                    allowClear
                    value={currentValue.entity_id || null}
                    onChange={(selectedValue) => {
                      onChange({
                        ...value,
                        main: {
                          ...(value.main || {}),
                          [serverField.key]: {
                            entity_id: selectedValue,
                            name: serverField.name
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
                    options={serverEntities.map(entity => ({
                      value: entity.id,
                      label: entity.name + ' (' + entity.id + ')'
                    }))}
                  />
                </div>
              );
            })}
          </div>

        </div>
      </div>
    );
}

export default ServerConfig;

