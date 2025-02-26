import { useLanguage } from '../../i18n/LanguageContext';
import { AutoComplete, Input, Button, ColorPicker } from 'antd';

function SensorGroup({ field, value, onChange, getFilteredEntities }) {
  const { t } = useLanguage();
  const sensorEntities = getFilteredEntities('sensor.*');
  
  // 添加新传感器到组
  const addSensorToGroup = (groupIndex, group) => {
    const newGroups = [...(value || [])];
    const sensorId = 'sensor_' + Date.now();
    newGroups[groupIndex] = {
      ...group,
      sensors: {
        ...group.sensors,
        [sensorId]: {
          entity_id: '',
          name: '',
          icon: ''
        }
      }
    };
    onChange(newGroups);
  };
  
  // 删除组中的传感器
  const removeSensorFromGroup = (groupIndex, group, sensorType) => {
    const newGroups = [...(value || [])];
    const newSensors = { ...group.sensors };
    delete newSensors[sensorType];
    
    newGroups[groupIndex] = {
      ...group,
      sensors: newSensors
    };
    onChange(newGroups);
  };
  
  return (
    <div className="config-field">
      <label>{field.label}</label>
      <div className="sensors-config">
        {(value || []).map((group, groupIndex) => (
          <div key={group.id} className="sensor-group-item">
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
            <div className="sensor-items-list">
              {Object.entries(group.sensors || {}).map(([type, sensor]) => (
                <div key={type} className="sensor-config-item">
                  <Input
                    value={sensor.name || null}
                    onChange={(e) => {
                      const newGroups = [...(value || [])];
                      newGroups[groupIndex] = {
                        ...group,
                        sensors: {
                          ...group.sensors,
                          [type]: {
                            ...sensor,
                            name: e.target.value
                          }
                        }
                      };
                      onChange(newGroups);
                    }}
                    placeholder={t('configField.sensorNamePlaceholder')}
                  />
                  <AutoComplete
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
                    placeholder={t('configField.selectEntityPlaceholder')}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={sensorEntities.map(entity => ({
                      value: entity.id,
                      label: entity.name + ' (' + entity.id + ')'
                    }))}
                  />
                  <ColorPicker
                    value={sensor.color || '#ff9800'}
                    showText
                    defaultValue={'#ff9800'}
                    presets={[
                      {
                        label: '默认',
                        colors: ['#ff9800', '#f57c00', '#e65100', '#f57c00', '#e65100']
                      }
                    ]}
                    onChange={(selectedColor) => {
                      const newGroups = [...(value || [])];
                      newGroups[groupIndex] = {
                        ...group,
                        sensors: {
                          ...group.sensors,
                          [type]: {
                            ...sensor,
                            color: selectedColor.toHexString()
                          }
                        }
                      };
                      onChange(newGroups);
                    }}
                  />
                  <Button
                    type="primary"
                    danger
                    style={{ width: '60px' }}
                    onClick={() => removeSensorFromGroup(groupIndex, group, type)}
                  >
                    {t('configField.delete')}
                  </Button>
                </div>
              ))}
              <Button 
                type="primary" 
                onClick={() => addSensorToGroup(groupIndex, group)}
                style={{ marginTop: '8px' }}
              >
                {t('configField.addSensor')}
              </Button>
            </div>
            <Button
              type="primary"
              danger
              style={{ width: '100px' }}
              onClick={() => {
                const newGroups = [...(value || [])];
                newGroups.splice(groupIndex, 1);
                onChange(newGroups);
              }}
            >
              {t('configField.delete')}
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
                id: 'ROOM_' + Date.now(),
                name: '',
                sensors: {}
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

export default SensorGroup;
