import { useLanguage } from '../../i18n/LanguageContext';
import {  getMdiIcons } from '../../utils/helper';
import { Input, AutoComplete, Button } from 'antd';
import {Icon} from '@iconify/react';

function SocketConfig({ field, value, onChange, getFilteredEntities }) {
    const { t } = useLanguage();
    const socketEntities = getFilteredEntities('switch.*');
    const socketIcons = getMdiIcons('socket');
    
    return (
      <div className="config-field">
        <label>{field.label}</label>
        <div className="lights-config">
          {Object.entries(value || {}).map(([key, socket], index, array) => (
            <div key={key} className="light-item">
              <div className="light-item-content">
                <Input
                  type="text"
                  value={socket.name || null}
                  onChange={(e) => {
                    onChange({
                      ...value,
                      [key]: {
                        ...socket,
                        name: e.target.value
                      }
                    });
                  }}
                  placeholder={t('configField.socketName')}
                />
                <AutoComplete
                  allowClear
                  value={socket.entity_id || null}
                  onChange={(selectedValue) => {
                    const currentValue = typeof value === 'object' ? value : {};
                    onChange({
                      ...currentValue,
                      [key]: {
                        ...socket,
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
                  options={socketEntities.map(entity => ({
                    value: entity.id,
                    label: entity.name + ' (' + entity.id + ')'
                  }))}
                />
                <AutoComplete
                  allowClear
                  value={socket.icon || null}
                  onChange={(selectedValue) => {
                    const currentValue = typeof value === 'object' ? value : {};
                    onChange({
                      ...currentValue,
                      [key]: {
                        ...socket,
                        icon: selectedValue
                      }
                    });
                  }}
                  showSearch
                  placeholder={t('configField.selectIcon')}
                  optionFilterProp="children"
                  // filterOption={(input, option) =>
                  //   (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  // }
                  options={socketIcons.map(icon => ({
                    value: icon.name,
                    label: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon icon={icon.name} width="20" />
                        <span>{icon.name}</span>
                      </div>
                    )
                  }))}
                />
              </div>
              <div className="light-item-actions">
                <div className="order-buttons">
                  <Button
                    type="primary"
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
                  </Button>
                  <Button
                    type="primary"
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
                  </Button>
                </div>
                <Button
                  type="primary"
                  danger
                  onClick={() => {
                    const currentValue = typeof value === 'object' ? value : {};
                    const newValue = { ...currentValue };
                    delete newValue[key];
                    onChange(newValue);
                  }}
                >
                  {t('configField.deleteButton')}
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="primary"
            style={{ width: '100px' }}
            onClick={() => {
              const newKey = 'light_' + Date.now();
              const currentValue = typeof value === 'object' ? value : {};
              onChange({
                ...currentValue,
                [newKey]: {
                  entity_id: '',
                  name: '',
                  room: '',
                  icon: ''
                }
              });
            }}
          >
            {t('configField.addButton')}
          </Button>
        </div>
      </div>
    );
}

export default SocketConfig;