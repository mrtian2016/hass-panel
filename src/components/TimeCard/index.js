import React, { useState, useEffect } from 'react';
import { mdiClockOutline } from '@mdi/js';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';
import BaseCard from '../BaseCard';
import dayjs from 'dayjs';
import Lunar from 'lunar-javascript';
import './style.css';

function TimeCard({ timeFormat, dateFormat,title }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [lunarDate, setLunarDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = dayjs();
      setCurrentTime(now);
      
      const lunar = Lunar.Lunar.fromDate(now.toDate());
      const yearZhi = lunar.getYearShengXiao(); // 获取生肖
      setLunarDate(`${lunar.getYearInGanZhi()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}(${yearZhi}年)`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, [t]); // 添加 t 到依赖数组

  return (
    <BaseCard
      title={title || t('cardTitles.time')}
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