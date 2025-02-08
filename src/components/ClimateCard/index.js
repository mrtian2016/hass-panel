import React, { useState, useEffect } from 'react';
import BaseCard from '../BaseCard';
import Icon from '@mdi/react';
import { useHass } from '@hakit/core';
import { useTheme } from '../../theme/ThemeContext';
import { 
  mdiThermometer, 
  mdiWaterPercent, 
  mdiPower, 
  mdiFan, 
  mdiAirConditioner,
  mdiSnowflake,
  mdiWaterPercent as mdiDry,
  mdiFan as mdiFanOnly,
  mdiFireCircle,
  mdiPowerOff,
  mdiArrowOscillating,
  mdiMinus,
  mdiPlus,
  mdiLeaf,
  mdiPowerSleep,
  mdiHeatingCoil,
  mdiAirFilter
} from '@mdi/js';
import { Popup, List } from 'antd-mobile';
import './style.css';
import { useEntity } from '@hakit/core';
// 图标映射
const ICON_MAP = {
  mdiLeaf,
  mdiPowerSleep,
  mdiHeatingCoil,
  mdiAirFilter,
};


function ClimateCard({ 
  config,
}) {
  const { theme } = useTheme();
  const climate = useEntity(config.entity_id);
  // 提前准备所有特性的实体ID数组
  let features = {};
  try {
    const featureEntities = Object.entries(config.features).map(([key, feature]) => ({
      key,
      ...feature,
      // eslint-disable-next-line react-hooks/rules-of-hooks
      entity: useEntity(feature.entity_id),
    }));
    // 将特性数组转换为对象
    features = featureEntities.reduce((acc, feature) => ({
      ...acc,
      [feature.key]: {
        name: feature.name,
        icon: feature.icon,
        disableWhen: feature.disableWhen,
        enableWhen: feature.enableWhen,
        entity: feature.entity,
      },
    }), {});
  } catch (error) {
    console.error('ClimateCard features 加载失败', error);
  }

  // const { getServices } = useHass();
  // const [services, setServices] = useState(null);
  // useEffect(() => {
  //   async function fetchServices() {
  //     const services = await getServices();
  //     setServices(services);
  //   }
  //   fetchServices();
  // }, []);
  // console.log(services);

  const [showFanModes, setShowFanModes] = useState(false);
  const [showSwingModes, setShowSwingModes] = useState(false);
  const [showHvacModes, setShowHvacModes] = useState(false);
  const isOn = climate?.state !== 'off';
  const currentTemp = climate?.attributes?.current_temperature;
  const currentHumidity = climate?.attributes?.current_humidity;
  const targetTemp = climate?.attributes?.temperature;
  const fanMode = climate?.attributes?.fan_mode;
  const fanModes = climate?.attributes?.fan_modes || [];
  const swingMode = climate?.attributes?.swing_mode;
  const swingModes = climate?.attributes?.swing_modes || [];

  const handlePowerClick = () => {
    if (climate?.service) {
      climate.service.toggle();
    }
  };

  const handleFanModeChange = (mode) => {
    if (climate?.service) {
      climate.service.set_fan_mode({ serviceData: { "fan_mode": mode } });
    }
    setShowFanModes(false);
  };

  const handleSwingModeChange = (mode) => {
    if (climate?.service) {
      climate.service.set_swing_mode({ serviceData: { "swing_mode": mode } });
    }
    setShowSwingModes(false);
  };

  const handleTempChange = (delta) => {
    if (climate?.service && isOn) {
      const minTemp = climate.attributes.min_temp;
      const maxTemp = climate.attributes.max_temp;
      const step = climate.attributes.target_temp_step;
      const currentTemp = climate.attributes.temperature;
      
      const newTemp = Math.round((currentTemp + delta) / step) * step;
      
      if (newTemp >= minTemp && newTemp <= maxTemp) {
        climate.service.set_temperature({ serviceData: { "temperature": newTemp } });
      }
    }
  };

  const getSwingModeLabel = (mode) => {
    switch (mode) {
      case 'off':
        return '关闭';
      case 'vertical':
        return '垂直摆动';
      default:
        return '关闭';
    }
  };

  const getHvacModeLabel = (mode) => {
    switch (mode) {
      case 'cool':
        return '制冷';
      case 'dry':
        return '除湿';
      case 'fan_only':
        return '送风';
      case 'heat':
        return '制热';
      case 'off':
        return '关闭';
      default:
        return mode;
    }
  };

  const getHvacModeIcon = (mode) => {
    switch (mode) {
      case 'cool':
        return mdiSnowflake;
      case 'dry':
        return mdiDry;
      case 'fan_only':
        return mdiFanOnly;
      case 'heat':
        return mdiFireCircle;
      case 'off':
        return mdiPowerOff;
      default:
        return mdiPower;
    }
  };

  const handleHvacModeChange = (mode) => {
    if (climate?.service) {
      if (mode === 'off') {
        climate.service.turn_off();
      } else {
        climate.service.set_hvac_mode({ serviceData: {"hvac_mode": mode } });
      }
    }
    setShowHvacModes(false);
  };

  const canAdjustTemperature = (mode) => {
    return mode === 'cool' || mode === 'heat';
  };

  return (
    <BaseCard
      title={config.name || "空调"}
      icon={mdiAirConditioner}
      iconColor={theme === 'dark' ? 'var(--color-text-primary)' : '#64B5F6'}
      headerRight={
        <button 
          className={`power-button ${!isOn ? 'off' : ''}`} 
          onClick={handlePowerClick}
        >
          <Icon path={mdiPower} size={1} />
        </button>
      }
    >
      <div className="climate-content">
        <div className="climate-status">
          <div className="climate-readings">
            <div className="reading">
              <div className="reading-label">
                <Icon path={mdiThermometer} size={0.8} />
                <span>当前温度</span>
              </div>
              <div className="reading-value">
                <span className="value">{currentTemp || '--'}</span>
                <span className="unit">°C</span>
              </div>
            </div>
            <div className="reading">
              <div className="reading-label">
                <Icon path={mdiWaterPercent} size={0.8} />
                <span>当前湿度</span>
              </div>
              <div className="reading-value">
                <span className="value">{currentHumidity || '--'}</span>
                <span className="unit">%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="climate-circle">
          <div className={`target-temp ${!isOn || !canAdjustTemperature(climate?.state) ? 'disabled' : ''}`}>
            <span className="temp-value">{targetTemp?.toFixed(1) || '--'}</span>
            <span className="temp-unit">°C</span>
          </div>
          <div className="temp-controls">
            <button 
              className="temp-button" 
              onClick={() => handleTempChange(-0.5)}
              disabled={!isOn || !canAdjustTemperature(climate?.state) || (targetTemp <= climate?.attributes?.min_temp)}
            >
              <Icon path={mdiMinus} size={1} />
            </button>
            <button 
              className="temp-button" 
              onClick={() => handleTempChange(0.5)}
              disabled={!isOn || !canAdjustTemperature(climate?.state) || (targetTemp >= climate?.attributes?.max_temp)}
            >
              <Icon path={mdiPlus} size={1} />
            </button>
          </div>
        </div>

        <div className="climate-controls">
          <button 
            className={`mode-button `}
            onClick={() => setShowHvacModes(true)}
          >
            <Icon path={getHvacModeIcon(climate?.state)} size={1} />
            <span>运行模式</span>
            <span className="mode-value">{getHvacModeLabel(climate?.state)}</span>
          </button>
          <button 
            className={`mode-button `}
            onClick={() => setShowFanModes(true)}
            disabled={!isOn}
          >
            <Icon path={mdiFan} size={1} />
            <span>风扇模式</span>
            <span className="mode-value">{fanMode}</span>
          </button>
          <button 
            className={`mode-button`}
            onClick={() => setShowSwingModes(true)}
            disabled={!isOn}
          >
            <Icon path={mdiArrowOscillating} size={1} />
            <span>摆动模式</span>
            <span className="mode-value">{getSwingModeLabel(swingMode)}</span>
          </button>
        </div>

        <div className="climate-functions">
          {Object.entries(features).map(([key, feature]) => {
            let isDisabled = feature?.disableWhen?.state === climate?.state;
            if (feature?.enableWhen?.mode) {
              isDisabled = feature?.enableWhen?.mode !== climate?.state;
            }
            const isActive = feature.entity?.state === 'on';
            
            return (
              <button 
                key={key}
                className={`function-button ${isActive ? 'active' : ''}`}
                onClick={() => feature.entity?.service?.toggle()}
                disabled={isDisabled}
              >
                <Icon path={ICON_MAP[feature.icon]} size={1} />
                <span>{feature.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Popup
        visible={showFanModes}
        onMaskClick={() => setShowFanModes(false)}
        bodyStyle={{
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          minHeight: '40vh',
          maxHeight: '80vh',
        }}
      >
        <div className="fan-mode-popup">
          <div className="popup-header">
            <h3>风扇模式</h3>
            <Icon path={mdiFan} size={1} />
          </div>
          <List>
            {fanModes.map((mode) => (
              <List.Item
                key={mode}
                onClick={() => handleFanModeChange(mode)}
                className={fanMode === mode ? 'active-mode' : ''}
              >
                {mode}
              </List.Item>
            ))}
          </List>
        </div>
      </Popup>

      <Popup
        visible={showSwingModes}
        onMaskClick={() => setShowSwingModes(false)}
        bodyStyle={{
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          minHeight: '40vh',
          maxHeight: '80vh',
        }}
      >
        <div className="fan-mode-popup">
          <div className="popup-header">
            <h3>摆动模式</h3>
            <Icon path={mdiFan} size={1} className="rotate-90" />
          </div>
          <List>
            {swingModes.map((mode) => (
              <List.Item
                key={mode}
                onClick={() => handleSwingModeChange(mode)}
                className={swingMode === mode ? 'active-mode' : ''}
              >
                {getSwingModeLabel(mode)}
              </List.Item>
            ))}
          </List>
        </div>
      </Popup>

      <Popup
        visible={showHvacModes}
        onMaskClick={() => setShowHvacModes(false)}
        bodyStyle={{
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          minHeight: '40vh',
          maxHeight: '80vh',
        }}
      >
        <div className="fan-mode-popup">
          <div className="popup-header">
            <h3>运行模式</h3>
            <Icon path={mdiPower} size={1} />
          </div>
          <List>
            {climate?.attributes?.hvac_modes.map((mode) => (
              <List.Item
                key={mode}
                onClick={() => handleHvacModeChange(mode)}
                className={climate?.state === mode ? 'active-mode' : ''}
                prefix={<Icon path={getHvacModeIcon(mode)} size={1} />}
              >
                {getHvacModeLabel(mode)}
              </List.Item>
            ))}
          </List>
        </div>
      </Popup>
    </BaseCard>
  );
}

export default ClimateCard; 