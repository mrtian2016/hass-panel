import { useLanguage } from '../../i18n/LanguageContext';
import { Input, AutoComplete, Button } from 'antd';
import { getMdiIcons } from '../../utils/helper';
import {Icon} from '@iconify/react';
function ScriptsConfig({ field, value, onChange, getFilteredEntities }) {
    const { t } = useLanguage();
    const scriptEntities = getFilteredEntities('script.*');
    const scriptIcons = getMdiIcons('scene');
    
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
              <AutoComplete
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
              <AutoComplete
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
                
                options={scriptIcons.map(icon => ({
                    value: icon.name,
                    label: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon icon={icon.name} width="20" />
                        <span>{icon.name}</span>
                      </div>
                    )
                  }))}
              />
              <Button
                type="primary"
                danger
                style={{ width: '100px' }}
                onClick={() => {
                  const newScripts = [...value];
                  newScripts.splice(index, 1);
                  onChange(newScripts);
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
          </Button>
        </div>
      </div>
    );
}

export default ScriptsConfig;
