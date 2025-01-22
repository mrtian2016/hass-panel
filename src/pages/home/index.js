import React, { useState, useEffect } from 'react';
import { PullToRefresh } from 'antd-mobile';
import Icon from '@mdi/react';
import { 
  mdiWeatherNight,
  mdiWhiteBalanceSunny,
  mdiCheck,
  mdiPencil,
  mdiRefresh,
  mdiViewGrid,
  mdiViewColumn,
  mdiMenu,
} from '@mdi/js';
import { useWeather, useEntity,useHistory} from '@hakit/core';
import { useTheme } from '../../theme/ThemeContext';
import { Responsive } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import WeatherCard from '../../components/WeatherCard';
import SensorCard from '../../components/SensorCard';
import TimeCard from '../../components/TimeCard';
import MediaPlayerCard from '../../components/MediaPlayerCard';
import LightOverviewCard from '../../components/LightOverviewCard';
import LightStatusCard from '../../components/LightStatusCard';
import CameraSection from '../../components/CameraSection';
import CurtainCard from '../../components/CurtainCard';
import ElectricityCard from '../../components/ElectricityCard';
import ClimateCard from '../../components/ClimateCard';
import RouterCard from '../../components/RouterCard';
import NASCard from '../../components/NASCard';
import ScriptPanel from '../../components/ScriptPanel';
import WaterPurifierCard from '../../components/WaterPurifierCard';
import './style.css';
import { entityConfig } from '../../config/index';

function Home({ sidebarVisible, setSidebarVisible }) {
  const { theme, toggleTheme } = useTheme();

  const handleRefresh = () => {
    console.log('Refresh triggered');
    window.location.reload();
  };

  // 修改布局配置
  const layouts = {
    lg: [
      { i: 'time', x: 0, y: 0, w: 1, h: 5 },
      { i: 'lights_status', x: 0, y: 0, w: 1, h: 12},
      { i: 'lights_overview', x: 0, y: 3, w: 1, h: 15 },
      { i: 'cameras', x: 0, y: 6, w: 1, h: 10 },
      { i: 'sensors', x: 0, y: 9, w: 1, h: 8 },
      { i: 'router', x: 1, y: 9, w: 1, h: 13 },
      { i: 'nas', x: 2, y: 9, w: 1, h: 18 },
      { i: 'media', x: 2, y: 9, w: 1, h: 14 },
      { i: 'curtains', x: 0, y: 11, w: 1, h: 14 },
      { i: 'electricity', x: 1, y: 11, w: 1, h: 13 },
      { i: 'scripts', x: 0, y: 0, w: 1, h: 7 },
      { i: 'waterpuri', x: 0, y: 0, w: 1, h: 12 },
    ],
    md: [
      { i: 'time', x: 0, y: 0, w: 1, h: 5 },
      { i: 'lights_status', x: 0, y: 0, w: 1, h: 12},
      { i: 'lights_overview', x: 0, y: 3, w: 1, h: 11 },
      { i: 'cameras', x: 0, y: 6, w: 1, h: 10 },
      { i: 'sensors', x: 0, y: 9, w: 1, h: 8 },
      { i: 'router', x: 0, y: 11, w: 1, h: 13 },
      { i: 'nas', x: 0, y: 11, w: 1, h: 18 },
      { i: 'media', x: 0, y: 13, w: 1, h: 14 },
      { i: 'curtains', x: 0, y: 15, w: 1, h: 14 },
      { i: 'electricity', x: 0, y: 17, w: 1, h: 13 },
      { i: 'scripts', x: 0, y: 0, w: 1, h: 7 },
      { i: 'waterpuri', x: 0, y: 0, w: 1, h: 12 },
    ],
    sm: [
      { i: 'time', x: 0, y: 0, w: 1, h: 5 },
      { i: 'lights_status', x: 0, y: 0, w: 1, h: 12},
      { i: 'lights', x: 0, y: 3, w: 1, h: 11 },
      { i: 'lights_overview', x: 0, y: 6, w: 1, h: 11 },
      { i: 'sensors', x: 0, y: 9, w: 1, h: 8 },
      { i: 'cameras', x: 0, y: 11, w: 1, h: 10 },
      { i: 'router', x: 0, y: 11, w: 1, h: 13 },
      { i: 'nas', x: 0, y: 11, w: 1, h: 18 },
      { i: 'media', x: 0, y: 13, w: 1, h: 14 },
      { i: 'curtains', x: 0, y: 15, w: 1, h: 14 },
      { i: 'electricity', x: 0, y: 17, w: 1, h: 13 },
      { i: 'scripts', x: 0, y: 0, w: 1, h: 7 },
      { i: 'waterpuri', x: 0, y: 0, w: 1, h: 12 },
    ]
  };

  // 添加宽度状态
  const [width, setWidth] = useState(window.innerWidth);

  // 添加移动端检测
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 监听窗口大小变化
  useEffect(() => {
    function handleResize() {
      const isMobile = window.innerWidth < 768;
      const sidebarWidth = isMobile ? 0 : 200;
      const containerPadding = isMobile ? 32 : 40;
      const availableWidth = window.innerWidth - sidebarWidth - containerPadding;
      setWidth(availableWidth);
      setIsMobile(isMobile);
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 添加拖拽状态
  const [isDragging, setIsDragging] = useState(false);

  // 处理触摸事件
  useEffect(() => {
    if (isMobile) {
      const preventScroll = (e) => {
        if (isDragging) {
          e.preventDefault();
        }
      };

      document.addEventListener('touchmove', preventScroll, { passive: false });
      return () => document.removeEventListener('touchmove', preventScroll);
    }
  }, [isMobile, isDragging]);

  const [isEditing, setIsEditing] = useState(false);

  // 添加布局状态
  const [currentLayouts, setCurrentLayouts] = useState(() => {
    const savedLayouts = localStorage.getItem('dashboard-layouts');
    const baseLayouts = savedLayouts ? JSON.parse(savedLayouts) : layouts;
    
    // 为每个 climate 设备添加布局配置
    const climateLayouts = entityConfig.climates.map((climate, index) => ({
      lg: { i: `climate-${index}`, x: 2, y: 11 + (index * 15), w: 1, h: 15 },
      md: { i: `climate-${index}`, x: 0, y: 19 + (index * 15), w: 1, h: 15 },
      sm: { i: `climate-${index}`, x: 0, y: 19 + (index * 15), w: 1, h: 14 }
    }));

    // 为每个 weather 设备添加布局配置
    const weatherLayouts = entityConfig.weather.map((weather, index) => ({
      lg: { i: `weather-${index}`, x: 0, y: 11 + (index * 15), w: 1, h: 9 },
      md: { i: `weather-${index}`, x: 0, y: 19 + (index * 15), w: 1, h: 9 },
      sm: { i: `weather-${index}`, x: 0, y: 19 + (index * 15), w: 1, h: 9 }
    }));

    // 合并基础布局和空调布局
    return {
      lg: [...baseLayouts.lg, ...climateLayouts.map(layout => layout.lg), ...weatherLayouts.map(layout => layout.lg)],
      md: [...baseLayouts.md, ...climateLayouts.map(layout => layout.md), ...weatherLayouts.map(layout => layout.md)],
      sm: [...baseLayouts.sm, ...climateLayouts.map(layout => layout.sm), ...weatherLayouts.map(layout => layout.sm)]
    };
  });

  // 处理布局变化
  const handleLayoutChange = (layout, layouts) => {
    setCurrentLayouts(layouts);
    // 保存到 localStorage
    localStorage.setItem('dashboard-layouts', JSON.stringify(layouts));
  };

  // 修复重置布局功能
  const handleResetLayout = () => {
    // 合并基础布局和天气、空调布局
    const climateLayouts = entityConfig.climates.map((climate, index) => ({
      lg: { i: `climate-${index}`, x: 2, y: 11 + (index * 15), w: 1, h: 15 },
      md: { i: `climate-${index}`, x: 0, y: 19 + (index * 15), w: 1, h: 15 },
      sm: { i: `climate-${index}`, x: 0, y: 19 + (index * 15), w: 1, h: 14 }
    }));

    const weatherLayouts = entityConfig.weather.map((weather, index) => ({
      lg: { i: `weather-${index}`, x: 0, y: 11 + (index * 15), w: 1, h: 9 },
      md: { i: `weather-${index}`, x: 0, y: 19 + (index * 15), w: 1, h: 9 },
      sm: { i: `weather-${index}`, x: 0, y: 19 + (index * 15), w: 1, h: 9 }
    }));

    const resetLayouts = {
      lg: [...layouts.lg, ...climateLayouts.map(layout => layout.lg), ...weatherLayouts.map(layout => layout.lg)],
      md: [...layouts.md, ...climateLayouts.map(layout => layout.md), ...weatherLayouts.map(layout => layout.md)],
      sm: [...layouts.sm, ...climateLayouts.map(layout => layout.sm), ...weatherLayouts.map(layout => layout.sm)]
    };

    setCurrentLayouts(resetLayouts);
    localStorage.removeItem('dashboard-layouts');
    setIsEditing(false);
  };

  // 添加在布局配置附近
  const minSizes = {
    time: 5,
    weather: 7,
    lights: 11,
    cameras: 10,
    sensors: 8,
    router: 13,
    nas: 13,
    media: 14,
    curtains: 14,
    electricity: 8,
    climate: 14
  };

  // 添加列数状态
  const [columnCount, setColumnCount] = useState(() => {
    const savedColumns = localStorage.getItem('dashboard-columns');
    return savedColumns ? JSON.parse(savedColumns) : { lg: 4, md: 3, sm: 1 };
  });

  // 处理列数变化
  const handleColumnsChange = (breakpoint) => {
    const newColumnCount = {
      ...columnCount,
      [breakpoint]: columnCount[breakpoint] >= 5 ? 3 : columnCount[breakpoint] + 1
    };
    setColumnCount(newColumnCount);
    localStorage.setItem('dashboard-columns', JSON.stringify(newColumnCount));
  };

  return (
    <div className={`page-container ${!sidebarVisible ? 'sidebar-hidden' : ''}`}>
      {/* <PullToRefresh
        onRefresh={handleRefresh}
        pullingText="下拉刷新"
        canReleaseText="释放立即刷新"
        refreshingText="刷新中..."
        completeText="刷新完成"
      > */}
        <div className="content">
          <div className="header">
            <button 
              className="theme-toggle"
              onClick={toggleTheme}
              title={theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'}
            >
              <Icon
                path={theme === 'light' ? mdiWeatherNight : mdiWhiteBalanceSunny}
                size={1}
                color="var(--color-text-primary)"
              />
            </button>

            {!isEditing && (
              <button 
                className="edit-toggle"
                onClick={() => setIsEditing(true)}
                title="编辑布局"
              >
                <Icon
                  path={mdiPencil}
                  size={1}
                  color="var(--color-text-primary)"
                />
              </button>
            )}

            {isEditing && (
              <button 
                className="reset-layout"
                onClick={handleResetLayout}
                title="重置布局"
              >
                <Icon
                  path={mdiRefresh}
                  size={1}
                  color="var(--color-text-primary)"
                />
              </button>
            )}

            <button 
              className="sidebar-toggle"
              onClick={() => setSidebarVisible(!sidebarVisible)}
              title={sidebarVisible ? '隐藏侧边栏' : '显示侧边栏'}
            >
              <Icon
                path={mdiMenu}
                size={1}
                color="var(--color-text-primary)"
              />
            </button>
          </div>
          
          <Responsive
            className={`layout ${isEditing ? 'editing' : ''}`}
            layouts={currentLayouts}
            breakpoints={{ lg: 1200, md: 768, sm: 480 }}
            cols={columnCount}
            rowHeight={28}
            width={width}
            margin={[16, 16]}
            containerPadding={[0, 0]}
            isDraggable={isEditing}
            isResizable={isEditing && !isMobile}
            draggableHandle={isMobile ? ".card-header" : undefined}
            onDragStart={() => setIsDragging(true)}
            onDragStop={() => setIsDragging(false)}
            resizeHandles={['se']}
            useCSSTransforms={true}
            compactType="vertical"
            preventCollision={false}
            onLayoutChange={handleLayoutChange}
            minH={5}
            maxH={30}
            resizeHandleWrapperClass="resize-handle-wrapper"
            onResize={(layout, oldItem, newItem) => {
              const minSize = minSizes[newItem.i];
              if (minSize && newItem.h < minSize) {
                newItem.h = minSize;
              }
            }}
          >
            <div key="time">
              <TimeCard timeFormat='HH:mm:ss' dateFormat={'YYYY年MM月DD日'} />
            </div>
            
            {entityConfig.weather.length > 0 && 
              entityConfig.weather.map((entityId, index) => (
                <div key={`weather-${index}`}>
                  <WeatherCard key={`weather-${index}`} entityId={entityId} />
                </div>
              ))
            }
            {entityConfig.lights  && (
              <div key="lights_status">
                <LightStatusCard config={entityConfig.lights} />
              </div>
            )}
            
            {entityConfig.lightsOverview && (
              <div key="lights_overview">
                <LightOverviewCard config={entityConfig.lightsOverview} />
              </div>
            )}
            
            {entityConfig.cameras.length > 0 && (
              <div key="cameras">
                <CameraSection config={entityConfig.cameras} />
              </div>
            )}
            
            {entityConfig.sensors.length > 0 && (
              <div key="sensors">
                <SensorCard config={entityConfig.sensors} />
              </div>
            )}
            
            {entityConfig.router && (
              <div key="router">
                <RouterCard config={entityConfig.router} />
              </div>
            )}
            
            {entityConfig.mediaPlayers.length > 0 && (
              <div key="media">
                <MediaPlayerCard config={entityConfig.mediaPlayers} />
              </div>
            )}
            
            {entityConfig.curtains.length > 0 && (
              <div key="curtains">
                <CurtainCard curtains={entityConfig.curtains} />
              </div>
            )}
            
            {entityConfig.electricity && (
              <div key="electricity">
                <ElectricityCard config={entityConfig.electricity} />
              </div>
            )}
            
            {entityConfig.climates.length > 0 && 
              entityConfig.climates.map((climate, index) => (
                <div key={`climate-${index}`}>
                  <ClimateCard 
                    config={climate}
                  />
                </div>
              ))
            }
            
            {entityConfig.syno_nas && (
              <div key="nas">
                <NASCard config={entityConfig.syno_nas} />
              </div>
            )}
            
            {entityConfig.scripts && (
              <div key="scripts">
                <ScriptPanel config={entityConfig.scripts} />
              </div>
            )}
            
            {entityConfig.waterpuri && (
              <div key="waterpuri">
                <WaterPurifierCard config={entityConfig.waterpuri} />
              </div>
            )}
          </Responsive>

          {isEditing && (
            <button 
              className="edit-toggle active"
              onClick={() => setIsEditing(false)}
              title="完成编辑"
            >
              <Icon
                path={mdiCheck}
                size={1.2}
              />
            </button>
          )}
        </div>
      {/* </PullToRefresh> */}
    </div>
  );
}

export default Home;