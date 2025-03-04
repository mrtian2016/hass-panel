import React from 'react';
import Icon from '@mdi/react';
import { 
  mdiWeatherNight,
  mdiWeatherSunny,
  mdiWeatherFog,
  mdiWeatherCloudy,
  mdiWeatherPartlyCloudy,
  mdiWeatherRainy,
  mdiWeatherSnowy,
  mdiWeatherLightning,
  mdiWeatherWindy,
  mdiMapMarker,
} from '@mdi/js';
import { useTheme } from '../../theme/ThemeContext';
import BaseCard from '../BaseCard';

import { useWeather } from '@hakit/core';
import { notification } from 'antd';
import { useLanguage } from '../../i18n/LanguageContext';
import './style.css';
// 添加穿衣指数计算函数
const calculateClothingIndex = (temperature, humidity, windSpeed) => {
  // 基础分值基于温度
  let baseScore;
  if (temperature >= 35) baseScore = 10;
  else if (temperature >= 28) baseScore = 9;
  else if (temperature >= 24) baseScore = 8;
  else if (temperature >= 20) baseScore = 7;
  else if (temperature >= 15) baseScore = 6;
  else if (temperature >= 10) baseScore = 5;
  else if (temperature >= 5) baseScore = 4;
  else if (temperature >= 0) baseScore = 3;
  else if (temperature >= -5) baseScore = 2;
  else baseScore = 1;

  // 湿度调整
  const humidityFactor = humidity >= 85 ? -1 : humidity <= 30 ? 0.5 : 0;

  // 风速调整
  let windFactor = 0;
  if (windSpeed >= 8) windFactor = -1.5;
  else if (windSpeed >= 5) windFactor = -1;
  else if (windSpeed >= 3) windFactor = -0.5;

  // 计算最终指数
  let finalScore = Math.max(1, Math.min(10, baseScore + humidityFactor + windFactor));
  
  // 建议对照表
  const getClothingSuggestions = (t) => ({
    10: { 
      index: t('weather.clothing.levels.extremeHot'), 
      suggestion: t('weather.clothing.suggestions.extremeHot')
    },
    9: { 
      index: t('weather.clothing.levels.veryHot'), 
      suggestion: t('weather.clothing.suggestions.veryHot')
    },
    8: { 
      index: t('weather.clothing.levels.hot'), 
      suggestion: t('weather.clothing.suggestions.hot')
    },
    7: { 
      index: t('weather.clothing.levels.warm'), 
      suggestion: t('weather.clothing.suggestions.warm')
    },
    6: { 
      index: t('weather.clothing.levels.comfortable'), 
      suggestion: t('weather.clothing.suggestions.comfortable')
    },
    5: { 
      index: t('weather.clothing.levels.cool'), 
      suggestion: t('weather.clothing.suggestions.cool')
    },
    4: { 
      index: t('weather.clothing.levels.cold'), 
      suggestion: t('weather.clothing.suggestions.cold')
    },
    3: { 
      index: t('weather.clothing.levels.veryCold'), 
      suggestion: t('weather.clothing.suggestions.veryCold')
    },
    2: { 
      index: t('weather.clothing.levels.extremeCold'), 
      suggestion: t('weather.clothing.suggestions.extremeCold')
    },
    1: { 
      index: t('weather.clothing.levels.freezing'), 
      suggestion: t('weather.clothing.suggestions.freezing')
    }
  });

  return (t) => {
    const suggestions = getClothingSuggestions(t);
    return suggestions[Math.round(finalScore)];
  };
};

function WeatherCard({config}) {
  const titleVisible = config.titleVisible;
  const { theme } = useTheme();
  const { t } = useLanguage();
  const debugMode = localStorage.getItem('debugMode') === 'true';
  let weather = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    weather = useWeather(config.entity_id);
  } catch (error) {
    if (debugMode) {
      notification.error({
        message: t('weather.loadError'),
        description: t('weather.loadErrorDesc') + error.message,
        placement: 'topRight',
        duration: 3,
      });
    }
    return <BaseCard title={t('weather.loadError')} icon={mdiMapMarker} >
      <div>{t('weather.loadError')}</div>
    </BaseCard> ;
  }
  
  const {
    apparent_temperature,
    visibility,
    visibility_unit,
    aqi,
    temperature,
    pressure,
    pressure_unit,
    humidity
  } = weather.attributes;

  const getWeatherIcon = (condition) => {
    const iconMap = {
      'clear-night': mdiWeatherNight,
      'sunny': mdiWeatherSunny,
      'fog': mdiWeatherFog,
      'cloudy': mdiWeatherCloudy,
      'partlycloudy': mdiWeatherPartlyCloudy,
      'rainy': mdiWeatherRainy,
      'snowy': mdiWeatherSnowy,
      'lightning': mdiWeatherLightning,
      'windy': mdiWeatherWindy,
    };
    return iconMap[condition] || mdiWeatherCloudy;
  };
  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const getWindDirection = (bearing) => {
    if (bearing >= 337.5 || bearing < 22.5) return t('weather.wind.north');
    if (bearing >= 22.5 && bearing < 67.5) return t('weather.wind.northEast');
    if (bearing >= 67.5 && bearing < 112.5) return t('weather.wind.east');
    if (bearing >= 112.5 && bearing < 157.5) return t('weather.wind.southEast');
    if (bearing >= 157.5 && bearing < 202.5) return t('weather.wind.south');
    if (bearing >= 202.5 && bearing < 247.5) return t('weather.wind.southWest');
    if (bearing >= 247.5 && bearing < 292.5) return t('weather.wind.west');
    if (bearing >= 292.5 && bearing < 337.5) return t('weather.wind.northWest');
    return bearing;
  };

  const getAQIDescription = (aqi) => {
    if (typeof aqi === 'object') {
      return aqi.category || '';
    }
    const aqiValue = parseInt(aqi);
    if (isNaN(aqiValue)) return '';
    
    if (aqiValue <= 50) return t('weather.aqi.level1');
    if (aqiValue <= 100) return t('weather.aqi.level2');
    if (aqiValue <= 150) return t('weather.aqi.level3');
    if (aqiValue <= 200) return t('weather.aqi.level4');
    if (aqiValue <= 300) return t('weather.aqi.level5');
    return t('weather.aqi.level6');
  };

  const getWindLevel = (speed) => {
    if (speed < 2) return t('weather.wind.level.calm');
    if (speed < 6) return t('weather.wind.level.light');
    if (speed < 12) return t('weather.wind.level.moderate');
    if (speed < 19) return t('weather.wind.level.fresh');
    if (speed < 28) return t('weather.wind.level.strong');
    if (speed < 38) return t('weather.wind.level.gale');
    if (speed < 49) return t('weather.wind.level.storm');
    if (speed < 61) return t('weather.wind.level.violent');
    return t('weather.wind.level.hurricane');
  };

  const forecastData = Array.isArray(weather?.forecast?.forecast) 
  ? weather.forecast.forecast.slice(0, 7) 
  : [];
  
  const clothingAdvice = calculateClothingIndex(
    weather.attributes.temperature,
    weather.attributes.humidity || 50,
    weather.attributes.wind_speed || 0
  )(t);

  return (
    <BaseCard
      title={config.title || t('cardTitles.weather')}
      icon={mdiMapMarker}
      titleVisible={titleVisible}
    >
      <div className="current-weather">
        <div className="weather-item">
          <span className="label">
            {apparent_temperature 
              ? t('weather.metrics.feelTemp') 
              : t('weather.metrics.temperature')}
          </span>
          <span className="value">{apparent_temperature || temperature}°C</span>
        </div>
        {humidity && <div className="weather-item">
          <span className="label">{t('weather.metrics.humidity')}</span>
          <span className="value">{humidity}%</span>
        </div>}
        {visibility && <div className="weather-item">
          <span className="label">{t('weather.metrics.visibility')}</span>
          <span className="value">{visibility} {visibility_unit}</span>
        </div>}
        {aqi && <div className="weather-item">
          <span className="label">{t('weather.metrics.airQuality')}</span>
          <span className="value">
            {typeof aqi === 'object' 
              ? `${aqi.aqi || aqi.level} (${getAQIDescription(aqi)})` 
              : `${aqi} (${getAQIDescription(aqi)})`}
          </span>
        </div>}
        {pressure && !aqi && <div className="weather-item">
          <span className="label">{t('weather.metrics.pressure')}</span>
          <span className="value">{pressure} {pressure_unit}</span>
        </div>}
        <div className="weather-item">
          <span className="label">{t('weather.metrics.wind')}</span>
          <span className="value">
            {getWindDirection(weather.attributes.wind_bearing)} {getWindLevel(weather.attributes.wind_speed)}
          </span>
        </div>
      </div>
      <div className="clothing-index">
        <div className="clothing-header">
          <span className="label">{t('weather.clothing.index')}</span>
          <span className="value">{clothingAdvice.index}</span>
        </div>
        <div className="clothing-suggestion">
          {clothingAdvice.suggestion}
        </div>
      </div>
      <div className="forecast">
        {forecastData.map((day, index) => (
          <div key={index} className="forecast-day">
            <div className="weather-date">{formatDate(day.datetime)}</div>
            <div className="weather-icon">
              <Icon 
                path={getWeatherIcon(day.condition)}
                size={1}
                color={theme === 'dark' ? '#ffffff' : '#333333'}
              />
            </div>
            <div className="weather-temp">
              <span className="high">{day.temperature}°</span>
              <span className="low">{day.templow}°</span>
            </div>
          </div>
        ))}
      </div>
    </BaseCard>
  );
}

export default WeatherCard; 