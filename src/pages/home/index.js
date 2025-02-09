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
  mdiCog,
  mdiEyeOutline,
  mdiCheckboxMarked,
  mdiCheckboxBlankOutline,
  mdiViewDashboard,
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
import IlluminanceCard from '../../components/IlluminanceCard';
import MotionCard from '../../components/MotionCard';
import './style.css';

// 获取当前断点
const getCurrentBreakpoint = (width) => {
  if (width >= 1200) return 'lg';
  if (width >= 768) return 'md';
  return 'sm';
};

// 获取列布局图标
const getColumnLayoutIcon = (columns) => {
  return mdiViewColumn;
};


function Home({ sidebarVisible, setSidebarVisible }) {
  const { theme, toggleTheme } = useTheme();
  const [cards, setCards] = useState(() => {
    // 从 localStorage 读取配置
    const savedConfig = localStorage.getItem('card-config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        return config.map(card => ({
          ...card,
          visible: card.visible !== false // 确保所有卡片都有visible属性
        }));
      } catch (error) {
        console.error('解析配置失败:', error);
        return [];
      }
    }
    return [];
  });

  const handleRefresh = () => {
    console.log('Refresh triggered');
    window.location.reload();
  };

  // 修改布局状态
  const [currentLayouts, setCurrentLayouts] = useState(() => {
    const savedLayouts = localStorage.getItem('dashboard-layouts');
    const defaultLayouts = localStorage.getItem('default-dashboard-layouts');
    return savedLayouts ? JSON.parse(savedLayouts) : defaultLayouts ? JSON.parse(defaultLayouts) : {};
  });

  // 处理布局变化
  const handleLayoutChange = (layout, layouts) => {
    setCurrentLayouts(layouts);
    localStorage.setItem('dashboard-layouts', JSON.stringify(layouts));
  };

  // 修改重置布局功能
  const handleResetLayout = () => {
    const defaultLayouts = localStorage.getItem('default-dashboard-layouts');
    if (defaultLayouts) {
      const layouts = JSON.parse(defaultLayouts);
      setCurrentLayouts(layouts);
      localStorage.setItem('dashboard-layouts', defaultLayouts);
    }
    setIsEditing(false);
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
      
      // 获取保存的列数设置
      const savedColumns = localStorage.getItem('dashboard-columns');
      const currentColumns = savedColumns ? JSON.parse(savedColumns) : { lg: 3, md: 3, sm: 1 };
      
      if (isMobile) {
        // 移动端强制使用1列
        const newColumnCount = { ...currentColumns, lg: 1, md: 1, sm: 1 };
        setColumnCount(newColumnCount);
        localStorage.setItem('dashboard-columns', JSON.stringify(newColumnCount));
      } else if (!savedColumns) {
        // 非移动端且没有保存的设置时，使用默认值
        setColumnCount({ lg: 3, md: 3, sm: 1 });
        localStorage.setItem('dashboard-columns', JSON.stringify({ lg: 3, md: 3, sm: 1 }));
      } else {
        // 非移动端且有保存的设置时，使用保存的值
        setColumnCount(currentColumns);
      }
      
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

  // 添加列数状态
  const [columnCount, setColumnCount] = useState(() => {
    const savedColumns = localStorage.getItem('dashboard-columns');
    return savedColumns ? JSON.parse(savedColumns) : { lg: 4, md: 3, sm: 1 };
  });

  // 处理列数变化
  const handleColumnsChange = (breakpoint) => {
    if (isMobile) {
      return;
    }
    const newColumnCount = {
      ...columnCount,
      [breakpoint]: columnCount[breakpoint] >= 5 ? 3 : columnCount[breakpoint] + 1
    };
    setColumnCount(newColumnCount);
    localStorage.setItem('dashboard-columns', JSON.stringify(newColumnCount));
  };



  const renderCard = (card) => {
    switch (card.type) {
      case 'TimeCard':
        return <TimeCard {...card.config} />;
      case 'WeatherCard':
        return <WeatherCard entityId={card.config.entity_id} />;
      case 'LightStatusCard':
        return <LightStatusCard config={card.config} />;
      case 'SensorCard':
        return <SensorCard config={card.config} />;
      case 'MediaPlayerCard':
        return <MediaPlayerCard config={card.config} />;
      case 'CurtainCard':
        return <CurtainCard config={card.config} />;
      case 'ElectricityCard':
        return <ElectricityCard config={card.config} />;
      case 'ScriptPanel':
        return <ScriptPanel config={card.config} />;
      case 'WaterPurifierCard':
        return <WaterPurifierCard config={card.config} />;
      case 'IlluminanceCard':
        return <IlluminanceCard config={card.config} />;
      case 'RouterCard':
        return <RouterCard config={card.config} />;
      case 'NASCard':
        return <NASCard config={card.config} />;
      case 'CameraCard':
        return <CameraSection config={card.config} />;
      case 'ClimateCard':
        return <ClimateCard config={card.config} />;
      case 'MotionCard':
        return <MotionCard config={card.config} />;
      case 'LightOverviewCard':
        return <LightOverviewCard config={card.config} />;
      default:
        return null;
    }
  };

  // 计算卡片布局
  const calculateLayouts = (cards) => {
    const layouts = {
      lg: [],
      md: [],
      sm: []
    };

    // 基础布局参数
    const baseParams = {
      lg: { cols: 3, cardWidth: 1 },
      md: { cols: 2, cardWidth: 1 },
      sm: { cols: 1, cardWidth: 1 }
    };

    // 卡片高度配置
    const cardHeights = {
      TimeCard: { lg: 5, md: 5, sm: 5 },
      WeatherCard: { lg: 9, md: 9, sm: 9 },
      LightStatusCard: { lg: 12, md: 12, sm: 12 },
      LightOverviewCard: { lg: 11, md: 11, sm: 11 },
      SensorCard: { lg: 8, md: 8, sm: 8 },
      RouterCard: { lg: 13, md: 13, sm: 13 },
      NASCard: { lg: 18, md: 18, sm: 18 },
      MediaPlayerCard: { lg: 14, md: 14, sm: 14 },
      CurtainCard: { lg: 14, md: 14, sm: 14 },
      ElectricityCard: { lg: 12, md: 12, sm: 12 },
      ScriptPanel: { lg: 7, md: 7, sm: 7 },
      WaterPurifierCard: { lg: 12, md: 12, sm: 12 },
      IlluminanceCard: { lg: 8, md: 8, sm: 8 },
      CameraCard: { lg: 10, md: 10, sm: 10 },
      ClimateCard: { lg: 12, md: 12, sm: 12 }
    };

    // 计算每个卡片的位置
    Object.keys(layouts).forEach(breakpoint => {
      const { cols } = baseParams[breakpoint];
      let positions = new Array(cols).fill(0); // 记录每列的当前高度

      cards.forEach((card) => {
        const height = cardHeights[card.type]?.[breakpoint] || 10;
        
        // 找到高度最小的列
        let minHeight = Math.min(...positions);
        let col = positions.indexOf(minHeight);
        
        // 添加布局
        layouts[breakpoint].push({
          i: card.id.toString(),
          x: col,
          y: minHeight,
          w: baseParams[breakpoint].cardWidth,
          h: height
        });

        // 更新该列的高度
        positions[col] = minHeight + height;
      });
    });

    return layouts;
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
                onClick={() => handleResetLayout()}
                title="重置布局"
              >
                <Icon
                  path={mdiRefresh}
                  size={1}
                  color="var(--color-text-primary)"
                />
              </button>
            )}
            {isEditing && !isMobile && (
              <button 
                className={`pc-edit-toggle ${isEditing ? 'active' : ''}`}
                onClick={() => setIsEditing(false)}
                
                title="完成编辑"
              >
                <Icon
                  path={mdiCheck}
                  size={1}
                  color="var(--color-text-primary)"
                />
              </button>
            )}
          {!isMobile && (
            <button 
              className="column-adjust"
              onClick={() => handleColumnsChange(getCurrentBreakpoint(width))}
              title={`当前 ${columnCount[getCurrentBreakpoint(width)]} 列，点击切换`}
            >
              <Icon
                path={getColumnLayoutIcon(columnCount[getCurrentBreakpoint(width)])}
                size={1}
                color="var(--color-text-primary)"
              />
              <span className="column-count">
                  {columnCount[getCurrentBreakpoint(width)]}
                </span>
              </button>
            )}

            {!isMobile && (
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
            )}

            
            
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
            resizeHandleWrapperClass="resize-handle-wrapper"
          >
            {cards
              .filter(card => card.visible !== false)
              .map(card => (
                <div key={card.id}>
                  {renderCard(card)}
                </div>
              ))}
          </Responsive>

          {cards.filter(card => card.visible !== false).length === 0 && (
            <div className="empty-state">
              <Icon path={mdiViewDashboard} size={3} color="var(--color-text-secondary)" />
              <h2>还没有添加任何卡片</h2>
              <p>点击左侧配置按钮，前往配置页面添加卡片吧</p>
            </div>
          )}

          {isEditing && isMobile && (
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