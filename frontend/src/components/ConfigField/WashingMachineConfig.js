import React from 'react';
import { AutoComplete } from 'antd';
import { useLanguage } from '../../i18n/LanguageContext';
import './style.css';

function WashingMachineConfig({ field, value, onChange, getFilteredEntities }) {
  const { t } = useLanguage();
  const switchEntities = getFilteredEntities('switch.*|button.*');
  const selectEntities = getFilteredEntities('input_select.*|select.*');
  const scriptEntities = getFilteredEntities('switch.*|button.*');
  const sensorEntities = getFilteredEntities('sensor.*|binary_sensor.*');
  
  // Default value structure
  const defaultValue = {
    switchEntity: '',
    startEntity: '',
    stopEntity: '',
    modeEntity: '',
    statusEntity: '',
    cycleEntity: '',
    remainingTimeEntity: '',
    programEntities: [],
    stateEntities: [],
    sensors: []
  };
  
  // Initialize value if undefined
  if (!value) {
    onChange(defaultValue);
    return null;
  }

  // Basic control fields
  const basicControlFields = [
    { key: 'switchEntity', name: t('configField.switchEntity'), entities: switchEntities },
    { key: 'startEntity', name: t('configField.startEntity'), entities: scriptEntities },
    { key: 'stopEntity', name: t('configField.stopEntity'), entities: scriptEntities },
    { key: 'modeEntity', name: t('configField.modeEntity'), entities: selectEntities }
  ];

  // Sensor fields
  const sensorFields = [
    { key: 'statusEntity', name: t('configField.statusEntity'), entities: sensorEntities },
    { key: 'cycleEntity', name: t('configField.cycleEntity'), entities: sensorEntities },
    { key: 'remainingTimeEntity', name: t('configField.remainingTimeEntity'), entities: sensorEntities }
  ];
  
  // Handle single entity change
  const handleSingleEntityChange = (entityKey, newValue) => {
    onChange({
      ...value,
      [entityKey]: newValue
    });
  };
  

  return (
    <div className="config-field">
      <label>{field.label}</label>
      
      <div className="washing-machine-config">
        {/* Basic Controls Section */}
        <div className="washing-machine-section">
          <h4>{t('configField.basicControls')}</h4>
          {basicControlFields.map(controlField => {
            return (
              <div key={controlField.key} className="washing-machine-field">
                <span className="field-name">{controlField.name}</span>
                <AutoComplete
                  allowClear
                  value={value[controlField.key] || null}
                  onChange={(selectedValue) => handleSingleEntityChange(controlField.key, selectedValue)}
                  showSearch
                  placeholder={t('configField.selectEntity')}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={controlField.entities.map(entity => ({
                    value: entity.id,
                    label: entity.name + ' (' + entity.id + ')'
                  }))}
                />
              </div>
            );
          })}
        </div>
        
        {/* Sensor Entities Section */}
        <div className="washing-machine-section">
          <h4>{t('configField.sensorEntities')}</h4>
          {sensorFields.map(sensorField => {
            return (
              <div key={sensorField.key} className="washing-machine-field">
                <span className="field-name">{sensorField.name}</span>
                <AutoComplete
                  allowClear
                  value={value[sensorField.key] || null}
                  onChange={(selectedValue) => handleSingleEntityChange(sensorField.key, selectedValue)}
                  showSearch
                  placeholder={t('configField.selectEntity')}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={sensorField.entities.map(entity => ({
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

export default WashingMachineConfig; 