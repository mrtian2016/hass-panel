import React, { useState, useEffect } from 'react';
import {
  mdiThermometer,
} from '@mdi/js';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';
import BaseCard from '../BaseCard';
import './style.css';
import { useEntity, useHistory } from '@hakit/core';
import { notification } from 'antd';
import { Icon } from '@iconify/react'
import ReactECharts from 'echarts-for-react';

// 从大数组中均匀采样指定数量的元素
function sampleArray(array, sampleCount) {
  if (array.length <= sampleCount) {
    return array;
  }
  
  const result = [];
  const step = array.length / sampleCount;
  
  // 始终包含第一个和最后一个元素
  result.push(array[0]);
  
  // 均匀采样中间的元素
  for (let i = 1; i < sampleCount - 1; i++) {
    const index = Math.floor(i * step);
    result.push(array[index]);
  }
  
  // 添加最后一个元素
  result.push(array[array.length - 1]);
  
  return result;
}

// 将 HEX 颜色转换为 RGBA
function hexToRgba(hex, alpha = 1) {
  // 移除 # 号（如果有）
  hex = hex.replace('#', '');
  
  // 解析 RGB 值
  let r, g, b;
  if (hex.length === 3) {
    // 简写形式 (#RGB)
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
  } else {
    // 完整形式 (#RRGGBB)
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  
  // 返回 RGBA 字符串
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function SensorChart({ entity_id, color,unit }) {
  const { theme } = useTheme();
  const history = useHistory(entity_id);
  const [chartData, setChartData] = useState({
    dates: [],
    values: []
  });
  
  // 设置默认颜色
  const lineColor = color || (theme === 'dark' ? '#ff9800' : '#f57c00');
  
  // 计算渐变色
  const gradientColorStart = hexToRgba(lineColor, 0.3);
  const gradientColorEnd = hexToRgba(lineColor, 0.05);
  
  useEffect(() => {
    if (history && !history.loading && history.entityHistory && history.entityHistory.length > 0) {
      // 过滤掉 unknown 和 unavailable 状态
      const validHistory = history.entityHistory.filter(item => 
        item.s !== 'unknown' && item.s !== 'unavailable' && !isNaN(parseFloat(item.s))
      );
      
      if (validHistory.length > 0) {
        // 最多取50个数据点，均匀分布
        const sampledHistory = sampleArray(validHistory, 50);
        
        // 准备图表数据
        const dates = sampledHistory.map(item => {
          const date = new Date(item.lu * 1000);
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        });
        
        const values = sampledHistory.map(item => parseFloat(item.s));
        
        setChartData({
          dates,
          values
        });
      }
    }
  }, [history]);
  
  // 如果没有有效数据，不显示图表
  if (!chartData.values.length) {
    return null;
  }
  
  const chartOption = {
    grid: {
      top: 5,
      right: -5,
      bottom: 5,
      left: -5,
      containLabel: false
    },
    xAxis: {
      type: 'category',
      data: chartData.dates,
      show: false,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      boundaryGap: false // 确保图表从两端开始绘制
    },
    yAxis: {
      type: 'value',
      show: false,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      }
    },
    series: [{
      data: chartData.values,
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        color: lineColor,
        width: 2
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: gradientColorStart
          }, {
            offset: 1,
            color: gradientColorEnd
          }]
        }
      }
    }],
    tooltip: {
      show: true,
      trigger: 'axis',
      formatter: function(params) {
        return `${params[0].name} : ${params[0].value} ${unit}`;
      },
      backgroundColor: 'rgba(0, 0, 0, 1)',
      borderColor: 'rgba(0, 0, 0, 1)',
      textStyle: {
        color: '#fff'
      },
      padding: [2,5],
      extraCssText: 'border-radius: 4px;'
    }
  };

  return (
    <ReactECharts 
      option={chartOption} 
      style={{ height: '100%', width: '100%' }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
}

function SensorCard({ config }) {
  const titleVisible = config.titleVisible;
  const { t } = useLanguage();
  const debugMode = localStorage.getItem('debugMode') === 'true';
  
  // 检查配置是否存在
  if (!config || !config.sensors) {
    return (
      <BaseCard
        title={config.title}
        icon={mdiThermometer}
      >
        <div className="sensor-data">
          {t('sensor.configIncomplete')}
        </div>
      </BaseCard>
    );
  }
 
  // 确保 config.sensors 是数组
  const sensorGroups = Array.isArray(config.sensors) ? config.sensors : [];

  // 动态加载传感器实体
  const sensorEntities = sensorGroups.map(group => {
    const sensors = Object.entries(group.sensors).reduce((acc, [type, sensor]) => {
      try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const entity = useEntity(sensor.entity_id);
        acc[type] = {
          ...sensor,
          entity,
        };
      } catch (error) {
        if (debugMode) {
          notification.error({
            message: t('sensor.loadError'),
            description: t('sensor.loadErrorDesc') + (sensor.name || sensor.entity_id) + ' - ' + error.message,
            placement: 'topRight',
            duration: 3,
            key: 'SensorCard',
          });
        }
        acc[type] = {
          ...sensor,
          entity: { state: null, error: true },
        };
      }
      return acc;
    }, {});

    return {
      ...group,
      sensors,
    };
  });

  // 安全获取传感器值
  const getSensorValue = (sensor) => {
    if (!sensor.entity || sensor.entity.error ||
      sensor.entity.state === undefined || sensor.entity.state === null) {
      return t('sensor.noValue');
    }
    const unit = sensor.entity.attributes?.unit_of_measurement || '';
    const value = sensor.entity.state;
    if (!isNaN(parseFloat(value))) {
      // 如果值是数字，则保留一位小数 但是如果最后一位是0，则不保留
      const fixedValue = parseFloat(value).toFixed(1);
      const resultValue = fixedValue.endsWith('.0') ? fixedValue.slice(0, -2) : fixedValue;
      return `${resultValue}${unit}`;
    }
    return `${value}${unit}`;
  };

  // 获取传感器图标
  const getSensorIcon = (sensor) => {
    return sensor.entity?.attributes?.icon || 'mdi:help-circle-outline';
  };

  return (
    <BaseCard
      title={config.title || t('cardTitles.sensor')}
      icon={mdiThermometer}
      titleVisible={titleVisible}
    >
      <div className="sensor-grid">
        {sensorEntities.flatMap(group => 
          Object.entries(group.sensors).map(([type, sensor]) => (
            <div key={`${group.id}-${type}`} className="sensor-tile">
              <div className="sensor-tile-header">
                <span className="sensor-name">{sensor.name}</span>
                <Icon 
                  icon={getSensorIcon(sensor)} 
                  className="sensor-icon" 
                />
              </div>
              <div className="sensor-card-sensor-value">
                {getSensorValue(sensor)}
              </div>
              <div className="sensor-chart-placeholder">
                <SensorChart entity_id={sensor.entity_id} color={sensor.color} unit={sensor.entity.attributes?.unit_of_measurement} />
              </div>
            </div>
          ))
        )}
      </div>
    </BaseCard>
  );
}

export default SensorCard; 