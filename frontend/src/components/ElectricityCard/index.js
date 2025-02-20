import React, { useState, useEffect } from 'react';
import BaseCard from '../BaseCard';
import { mdiLightningBolt, mdiEye } from '@mdi/js';
import ReactECharts from 'echarts-for-react';
import { useLanguage } from '../../i18n/LanguageContext';
import './style.css';
import { useEntity } from '@hakit/core';
import { notification } from 'antd';
import { hassApi } from '../../utils/api';
import { ElectricityInfoItem } from './ElectricityInfoItem';

function ElectricityCard({ 
  config,
}) {
  const { t } = useLanguage();
  // {
  //   "summary": {
  //     "yesterday": 13.09,
  //     "last_month": 44.36,
  //     "this_month": 244.42,
  //     "this_year": 288.8
  //   },
  //   "daily": {
  //     "2025-02-19": 13.09,
  //     "2025-02-18": 12.47,
  //     "2025-02-17": 12.5,
  //     "2025-02-16": 14.2,
  //     "2025-02-15": 14.62,
  //     "2025-02-14": 13.03,
  //     "2025-02-13": 11.7
  //   }
  // }
  const [summaryData, setSummaryData] = useState([]);
  const [chartData, setChartData] = useState({ dates: [], values: [] });
  const [todayUsage, setTodayUsage] = useState(0.0);



  const debugMode = localStorage.getItem('debugMode') === 'true';


  useEffect(() => {
    const fetchData = async () => {
      if (!config.electricity?.totalUsage?.entity_id) {
        return;
      }
      try {
        const [statisticsData, todayUsageData] = await Promise.all([
          hassApi.getEnergyStatistics(config.electricity.totalUsage.entity_id),
          hassApi.getTodayConsumption(config.electricity.totalUsage.entity_id)
        ]);
        console.log(statisticsData, todayUsageData);
        if (statisticsData.code === 200) {
          setSummaryData(statisticsData.data.summary);
          setChartData({
            dates: Object.keys(statisticsData.data.daily),
            values: Object.values(statisticsData.data.daily),
          });
        }

        if (todayUsageData.code === 200) {
          setTodayUsage(todayUsageData.data.total);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
        if (debugMode) {
          notification.error({
            message: t('electricity.fetchError'),
            description: error.message,
          });
        }
      }
    };
    fetchData();
  }, [config.electricity?.totalUsage?.entity_id, debugMode, t]);

  // 检查配置是否存在
  if (!config || !config.electricity) {
    return (
      <BaseCard 
        title={config.title || t('cardTitles.electricity')}
        icon={mdiEye}
        className="electricity-usage-card"
      >
        <div className="electricity-content">
          {t('electricity.configIncomplete')}
        </div>
      </BaseCard>
    );
  }
  // 动态加载电力数据实体
  const electricityEntities = Object.entries(config.electricity).reduce((acc, [key, config]) => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const entity = useEntity(config.entity_id);
      acc[key] = {
        ...config,
        entity,
      };
    } catch (error) {
      console.error(`加载实体 ${key} 失败:`, error);
      if (debugMode) {
        notification.error({
          message: t('electricity.loadError'),
          description: `${t('electricity.loadErrorDesc')} ${config.name || config.entity_id} - ${error.message}`,
          placement: 'topRight',
          duration: 3,
          key: 'ElectricityCard',
        });
      }
      acc[key] = {
        ...config,
        entity: { state: null, error: true },
      };
    }
    return acc;
  }, {});


  

  // 图表配置
  const chartOption = {
    grid: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
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
      }
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
        color: '#ff9800',
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
            color: 'rgba(255, 152, 0, 0.3)'
          }, {
            offset: 1,
            color: 'rgba(255, 152, 0, 0.1)'
          }]
        }
      }
    }],
    tooltip: {
      show: true,
      trigger: 'axis',
      formatter: function(params) {
        const data = params[0];
        return `${data.name}<br/>${t('electricity.usage')}: ${data.value} ${t('electricity.unit.kwh')}`;
      },
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      textStyle: {
        color: '#fff'
      },
      position: function (pos, params, el, elRect, size) {
        const obj = { top: 10 };
        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
        return obj;
      }
    }
  };

  // 在渲染实体状态的地方添加安全检查
  const getEntityValue = (entityKey,returnBooleanIfNotFound = false) => {
    const entity = electricityEntities[entityKey]?.entity;
    if (!entity || entity.error || entity.state === undefined || entity.state === null) {
      return returnBooleanIfNotFound ? false : '- -';
    }
    return entity.state;
  };

  // 替换 electricity-yearly-info 部分
  const yearlyInfoItems = [
    {
      icon: mdiLightningBolt,
      label: t('electricity.voltage'),
      value: getEntityValue('voltage'),
      unit: t('electricity.unit.volt')
    },
    {
      icon: mdiLightningBolt,
      label: t('electricity.current'),
      value: getEntityValue('electric_current'),
      unit: t('electricity.unit.ampere')
    },
    {
      icon: mdiLightningBolt,
      label: t('electricity.power'),
      value: getEntityValue('currentPower'),
      unit: t('electricity.unit.watt')
    }
  ];

  // 替换 electricity-info-grid 部分
  const gridInfoItems = [
    {
      icon: mdiLightningBolt,
      label: t('electricity.monthUsage'),
      value: summaryData.this_month,
      unit: t('electricity.unit.degree')
    },
    {
      icon: mdiLightningBolt,
      label: t('electricity.lastMonthUsage'),
      value: summaryData.last_month,
      unit: t('electricity.unit.degree')
    },
    {
      icon: mdiLightningBolt,
      label: t('electricity.todayUsage'),
      value: getEntityValue('todayUsage', true) || todayUsage,
      unit: t('electricity.unit.degree')
    },
    {
      icon: mdiLightningBolt,
      label: t('electricity.yesterdayUsage'),
      value: summaryData.yesterday,
      unit: t('electricity.unit.degree')
    }
  ];

  return (
    
    <BaseCard 
      title={config.title || t('cardTitles.electricity')}
      icon={mdiEye}
      titleVisible={config.titleVisible}
      className="electricity-usage-card"
    >
      <div className="electricity-content">
        {/* <div className="electricity-main-value">
          <span className="label">过去7天用电量</span>
          <span className="value">{electricityEntities.todayUsage.entity.state || '0'}</span>
          <span className="unit">kWh</span>

        </div> */}

     
        
        {chartData.dates.length > 0 && <div className="electricity-chart">
          <ReactECharts 
            option={chartOption} 
            style={{ height: '100%', width: '100%' }}
          />
        </div>}

        <div className="electricity-yearly-info">
          {yearlyInfoItems.map((item, index) => (
            <ElectricityInfoItem key={index} {...item} />
          ))}
        </div>

        <div className="electricity-info-grid">
          {gridInfoItems.map((item, index) => (
            <ElectricityInfoItem key={index} {...item} />
          ))}
        </div>
      </div>
    </BaseCard>
  );
}

export default ElectricityCard; 