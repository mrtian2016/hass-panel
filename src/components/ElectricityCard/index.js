import React from 'react';
import BaseCard from '../BaseCard';
import { mdiLightningBolt, mdiCurrencyUsd, mdiEye } from '@mdi/js';
import Icon from '@mdi/react';
import ReactECharts from 'echarts-for-react';
import './style.css';
import { useEntity, useHistory } from '@hakit/core';
function ElectricityCard({ 
  config,
}) {

  // 动态加载电力数据实体
  const electricityEntities = Object.entries(config).reduce((acc, [key, config]) => {
    // console.log(config);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const entity = useEntity(config.entity_id);
    
    acc[key] = {
        ...config,
        entity,
    };
    return acc;
  }, {});
  const historyData = electricityEntities.dailyHistory.entity.state;
  // 解析历史数据字符串
  const parsedData = historyData.split('\n').map(line => {
    const [date, usage] = line.split(': ');
    return {
      date: date,
      usage: parseFloat(usage.replace(' kWh', ''))
    };
  });
  
  const chartData = {
    dates: parsedData.map(item => item.date),
    values: parsedData.map(item => item.usage)
  };

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
        return `${data.name}<br/>用电量：${data.value} kWh`;
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

  return (
    
    <BaseCard 
      title="电量统计"
      icon={mdiEye}
      className="electricity-usage-card"
    >
      <div className="electricity-content">
        {/* <div className="electricity-main-value">
          <span className="label">过去7天用电量</span>
          <span className="value">{electricityEntities.todayUsage.entity.state || '0'}</span>
          <span className="unit">kWh</span>

        </div> */}

     
        
        <div className="electricity-chart">
          <ReactECharts 
            option={chartOption} 
            style={{ height: '100%', width: '100%' }}
          />
        </div>

        <div className="electricity-yearly-info">
          <div className="yearly-item">
            <div className="info-label">
              <Icon path={mdiLightningBolt} size={0.8} />
              <span>实时电压</span>
            </div>
            <div className="electricity-value">
              <span className="value">{electricityEntities.voltage.entity.state || '0'}</span>
              <span className="unit">V</span>
            </div>
          </div>
          <div className="yearly-item">
            <div className="info-label">
              <Icon path={mdiLightningBolt} size={0.8} />
                <span>实时电流</span>
            </div>
            <div className="electricity-value">
              <span className="value">{electricityEntities.electric_current.entity.state || '0'}</span>
                <span className="unit">A</span>
            </div>
          </div>
          <div className="yearly-item">
            <div className="info-label">
              <Icon path={mdiLightningBolt} size={0.8} />
              <span>实时功率</span>
            </div>
            <div className="electricity-value">
              <span className="value">{electricityEntities.currentPower.entity.state || '0'}</span>
              <span className="unit">W</span>
            </div>
          </div>
        </div>

        <div className="electricity-info-grid">
       

          <div className="electricity-info-item">
            <div className="info-label">
              <Icon path={mdiLightningBolt} size={0.8} />
              <span>当月用电量</span>
            </div>
            <div className="electricity-value">
              <span className="value">{electricityEntities.monthUsage.entity.state || '0'}</span>
              <span className="unit">度</span>
            </div>
          </div>
          <div className="electricity-info-item">
            <div className="info-label">
              <Icon path={mdiLightningBolt} size={0.8} />
              <span>上月用电量</span>
            </div>
            <div className="electricity-value">
              <span className="value">{electricityEntities.lastMonthUsage.entity.state || '0'}</span>
              <span className="unit">度</span>
            </div>
          </div>

         

          <div className="electricity-info-item">
            <div className="info-label">
              <Icon path={mdiLightningBolt} size={0.8} />
              <span>今日用电量</span>
            </div>
            <div className="electricity-value">
              <span className="value">{electricityEntities.todayUsage.entity.state || '0'}</span>
              <span className="unit">度</span>

            </div>
          </div>
          <div className="electricity-info-item">
            <div className="info-label">
              <Icon path={mdiLightningBolt} size={0.8} />
              <span>昨日用电量</span>
            </div>
            <div className="electricity-value">
              <span className="value">{electricityEntities.yesterdayUsage.entity.state || '0'}</span>
              <span className="unit">度</span>

            </div>
          </div>
        </div>
      </div>
    </BaseCard>
  );
}

export default ElectricityCard; 