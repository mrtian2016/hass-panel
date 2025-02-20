export const getChartOption = (dates, values, t) => ({
  grid: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    containLabel: false
  },
  xAxis: {
    type: 'category',
    data: dates,
    show: false,
    axisLine: { show: false },
    axisTick: { show: false }
  },
  yAxis: {
    type: 'value',
    show: false,
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { show: false }
  },
  series: [{
    data: values,
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
        x: 0, y: 0, x2: 0, y2: 1,
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
    formatter: (params) => {
      const data = params[0];
      return `${data.name}<br/>${t('electricity.usage')}: ${data.value} ${t('electricity.unit.kwh')}`;
    },
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    textStyle: { color: '#fff' },
    position: (pos, params, el, elRect, size) => {
      const obj = { top: 10 };
      obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
      return obj;
    }
  }
}); 