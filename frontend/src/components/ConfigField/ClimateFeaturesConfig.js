

import { useLanguage } from '../../i18n/LanguageContext';
import { AutoComplete, Button, Select } from 'antd';

function ClimateFeaturesConfig({field, value, onChange,getFilteredEntities}) {
    const { t } = useLanguage();
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


                <AutoComplete
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
              <Button
                type="primary"
                style={{ width: '100px' }}
                danger
                onClick={() => {
                  const newValue = { ...value };
                  delete newValue[type];
                  onChange(newValue);
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
          </Button>
        </div>
      </div>
    );
}

export default ClimateFeaturesConfig;