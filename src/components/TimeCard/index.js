import React, { useState, useEffect } from 'react';
import { mdiClockOutline } from '@mdi/js';
import { useTheme } from '../../theme/ThemeContext';
import BaseCard from '../BaseCard';
import dayjs from 'dayjs';
import Lunar from 'lunar-javascript';
import './style.css';

function TimeCard({ timeFormat = 'HH:mm:ss', dateFormat = 'YYYY-MM-DD' }) {
  const { theme } = useTheme();
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [lunarDate, setLunarDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = dayjs();
      setCurrentTime(now);
      // 获取农历日期
      const lunar = Lunar.Lunar.fromDate(now.toDate());
      const yearZhi = lunar.getYearShengXiao(); // 获取生肖
      setLunarDate(`${lunar.getYearInGanZhi()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}(${yearZhi}年)`);
    };

    updateTime(); // 初始化
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <BaseCard
      title="时间"
      icon={mdiClockOutline}
      iconColor={theme === 'dark' ? 'var(--color-text-primary)' : '#FFB74D'}
    >
      <div className="time-content">
        <div className="time">
          {currentTime.format(timeFormat)}
        </div>
        <div className="date">
          {currentTime.format(dateFormat)}
        </div>
        <div className="lunar-date">
          {lunarDate}
        </div>
      </div>
    </BaseCard>
  );
}

export default TimeCard; 