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
import './style.css';
import { useWeather } from '@hakit/core';

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
  const suggestions = {
    10: { index: "极热", suggestion: "建议穿着轻薄、透气的衣物，注意防晒。" },
    9: { index: "炎热", suggestion: "建议穿着凉爽、透气的夏季服装。" },
    8: { index: "热", suggestion: "建议穿着短袖衫、短裙等夏季服装。" },
    7: { index: "温暖", suggestion: "建议穿着长袖T恤、轻薄外套等春秋装。" },
    6: { index: "舒适", suggestion: "建议穿着长袖衬衫、薄毛衣等春秋装。" },
    5: { index: "微凉", suggestion: "建议穿着薄外套、夹克衫等春秋装。" },
    4: { index: "凉", suggestion: "建议穿着厚外套、毛衣等秋冬装。" },
    3: { index: "冷", suggestion: "建议穿着棉服、羽绒服等冬季服装。" },
    2: { index: "寒冷", suggestion: "建议穿着厚羽绒服、棉服，注意保暖。" },
    1: { index: "极寒", suggestion: "建议穿着厚羽绒服、棉服，做好全面保暖。" }
  };

  return suggestions[Math.round(finalScore)];
};

function WeatherCard({ entityId }) {
  const weather = useWeather(entityId);
  const { theme } = useTheme();
  const {
    apparent_temperature,
    visibility,
    visibility_unit,
    aqi,
    aqi_description,
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
    if (bearing >= 337.5 || bearing < 22.5) return '北风';
    if (bearing >= 22.5 && bearing < 67.5) return '东北风';
    if (bearing >= 67.5 && bearing < 112.5) return '东风';
    if (bearing >= 112.5 && bearing < 157.5) return '东南风';
    if (bearing >= 157.5 && bearing < 202.5) return '南风';
    if (bearing >= 202.5 && bearing < 247.5) return '西南风';
    if (bearing >= 247.5 && bearing < 292.5) return '西风';
    if (bearing >= 292.5 && bearing < 337.5) return '西北风';
    return '未知';
  };

  const getWindLevel = (speed) => {
    if (speed < 2) return '0级';
    if (speed < 6) return '1-2级';
    if (speed < 12) return '3级';
    if (speed < 19) return '4级';
    if (speed < 28) return '5级';
    if (speed < 38) return '6级';
    if (speed < 49) return '7级';
    if (speed < 61) return '8级';
    return '9级以上';
  };

  const forecastData = Array.isArray(weather?.forecast?.forecast) ? weather.forecast.forecast : [];
  console.log(weather.attributes);
  const clothingAdvice = calculateClothingIndex(
    weather.attributes.temperature,
    weather.attributes.humidity || 50,
    weather.attributes.wind_speed || 0
  );

  return (
    <BaseCard
      title="我的家"
      icon={mdiMapMarker}
      iconColor={theme === 'dark' ? 'var(--color-text-primary)' : '#87CEEB'}
    >
      <div className="current-weather">
        <div className="weather-item">
          <span className="label">体感温度</span>
          <span className="value">{apparent_temperature}°C</span>
        </div>
        <div className="weather-item">
          <span className="label">能见度</span>
          <span className="value">{visibility} {visibility_unit}</span>
        </div>
        <div className="weather-item">
          <span className="label">空气质量</span>
          <span className="value">{aqi} ({aqi_description})</span>
        </div>
        <div className="weather-item">
          <span className="label">风况</span>
          <span className="value">
            {getWindDirection(weather.attributes.wind_bearing)} {getWindLevel(weather.attributes.wind_speed)}
          </span>
        </div>
      </div>
      <div className="clothing-index">
        <div className="clothing-header">
          <span className="label">穿衣指数</span>
          <span className="value">{clothingAdvice.index}</span>
        </div>
        <div className="clothing-suggestion">
          {clothingAdvice.suggestion}
        </div>
      </div>
      <div className="forecast">
        {forecastData.map((day, index) => (
          <div key={index} className="forecast-day">
            <div className="date">{formatDate(day.datetime)}</div>
            <div className="icon">
              <Icon 
                path={getWeatherIcon(day.condition)}
                size={1}
                color={theme === 'dark' ? '#ffffff' : '#333333'}
              />
            </div>
            <div className="temp">
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