import React, { useState, useEffect } from 'react';
// import { PullToRefresh } from 'antd-mobile';
import Icon from '@mdi/react';
import {
  mdiWeatherNight,
  mdiWhiteBalanceSunny,
  mdiCheck,
  mdiPencil,
  mdiRefresh,
  mdiViewColumn,
  mdiMenu,
  mdiViewDashboard,
  mdiGoogleTranslate,
} from '@mdi/js';
import { useTheme } from '../../theme/ThemeContext';
import { Responsive } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { message, Spin } from 'antd';
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
import { useLanguage } from '../../i18n/LanguageContext';
import { configApi } from '../../utils/api';

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
  const { t, toggleLanguage } = useLanguage();

  // 状态定义
  const [width, setWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [columnCount, setColumnCount] = useState(() => {
    const savedColumns = localStorage.getItem('dashboard-columns');
    return savedColumns ? JSON.parse(savedColumns) : { lg: 3, md: 3, sm: 1 };
  });

  // 监听窗口大小变化
  useEffect(() => {
    function handleResize() {
      const newWidth = window.innerWidth;
      const newIsMobile = newWidth < 768;
      setWidth(newWidth);
      setIsMobile(newIsMobile);

      // 根据设备类型加载对应的布局
      configApi.getConfig().then(config => {
        if (config.layouts) {
          setCurrentLayouts(newIsMobile ? config.layouts.mobile : config.layouts.desktop);
        }
      }).catch(error => {
        console.error('加载布局配置失败:', error);
      });
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 加载配置数据
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);

        // 尝试从后端获取配置
        let config = await configApi.getConfig();

        // 如果后端没有数据(cards为空数组)，且本地有数据，则上传本地数据到后端
        if (config.cards.length === 0) {
          const localConfig = localStorage.getItem('card-config');
          if (localConfig) {
            try {
              const localCards = JSON.parse(localConfig);
              const mobileLayouts = localStorage.getItem('mobile-dashboard-layouts');
              const desktopLayouts = localStorage.getItem('desktop-dashboard-layouts');
              const mobileDefaultLayouts = localStorage.getItem('mobile-default-dashboard-layouts');
              const desktopDefaultLayouts = localStorage.getItem('desktop-default-dashboard-layouts');

              // 准备要上传的配置
              const uploadConfig = {
                cards: localCards,
                layouts: {
                  mobile: mobileLayouts ? JSON.parse(mobileLayouts) : {},
                  desktop: desktopLayouts ? JSON.parse(desktopLayouts) : {}
                },
                defaultLayouts: {
                  mobile: mobileDefaultLayouts ? JSON.parse(mobileDefaultLayouts) : {},
                  desktop: desktopDefaultLayouts ? JSON.parse(desktopDefaultLayouts) : {}
                }
              };

              // 上传到后端
              await configApi.saveConfig(uploadConfig);

              // 重新获取配置
              config = await configApi.getConfig();

              // 清除本地存储的配置
              localStorage.removeItem('card-config');
              localStorage.removeItem('mobile-dashboard-layouts');
              localStorage.removeItem('desktop-dashboard-layouts');
              localStorage.removeItem('mobile-default-dashboard-layouts');
              localStorage.removeItem('desktop-default-dashboard-layouts');
            } catch (error) {
              console.error('迁移本地配置失败:', error);
            }
          }
        }

        // 设置卡片配置
        if (config.cards) {
          setCards(config.cards.map(card => ({
            ...card,
            visible: card.visible !== false,
            titleVisible: card.titleVisible !== false
          })));
        }

        // 设置布局配置
        if (config.layouts) {
          setCurrentLayouts(isMobile ? config.layouts.mobile : config.layouts.desktop);
        }

      } catch (error) {
        console.error('加载配置失败:', error);
        message.error('加载配置失败: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [isMobile]);

  // const handleRefresh = () => {
  //   console.log('Refresh triggered');
  //   window.location.reload();
  // };

  // 修改布局状态
  const [currentLayouts, setCurrentLayouts] = useState(() => {
    try {
      // 判断是否为移动设备
      const isMobileDevice = window.innerWidth < 768;
      const layoutKey = isMobileDevice ? 'mobile-dashboard-layouts' : 'desktop-dashboard-layouts';
      const defaultLayoutKey = isMobileDevice ? 'mobile-default-dashboard-layouts' : 'desktop-default-dashboard-layouts';

      const savedLayouts = localStorage.getItem(layoutKey);
      const defaultLayouts = localStorage.getItem(defaultLayoutKey);

      // 处理已保存的布局
      if (savedLayouts) {
        return JSON.parse(savedLayouts);
      }

      // 处理默认布局
      if (defaultLayouts) {
        return JSON.parse(defaultLayouts);
      }

      return {};
    } catch (error) {
      console.error('解析布局配置失败:', error);
      return {};
    }
  });

  // 处理布局变化
  const handleLayoutChange = (layout, layouts) => {
    setCurrentLayouts(layouts);

    // 获取当前配置
    configApi.getConfig().then(config => {
      // 根据设备类型更新对应的布局
      const newLayouts = {
        ...config.layouts,
        [isMobile ? 'mobile' : 'desktop']: layouts
      };

      // 保存更新后的配置
      configApi.saveConfig({
        ...config,
        layouts: newLayouts
      }, false);
    }).catch(error => {
      console.error('保存布局失败:', error);
    });
  };

  // 修改重置布局功能
  const handleResetLayout = async () => {
    try {
      const config = await configApi.getConfig();
      if (config.defaultLayouts) {
        const defaultLayout = isMobile ?
          config.defaultLayouts.mobile :
          config.defaultLayouts.desktop;

        setCurrentLayouts(defaultLayout);

        // 更新布局配置
        const newLayouts = {
          ...config.layouts,
          [isMobile ? 'mobile' : 'desktop']: defaultLayout
        };

        await configApi.saveConfig({
          ...config,
          layouts: newLayouts
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('重置布局失败:', error);
      message.error('重置布局失败');
    }
  };

  // 监听窗口大小变化
  useEffect(() => {
    function handleResize() {
      const isMobile = window.innerWidth < 768;
      // 根据侧边栏状态动态计算宽度
      const sidebarWidth = isMobile ? 0 : (sidebarVisible ? 200 : 0);
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
  }, [sidebarVisible]); // 添加 sidebarVisible 作为依赖

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
        return <TimeCard config={{ ...card.config, titleVisible: card.titleVisible }} />;
      case 'WeatherCard':
        return <WeatherCard config={{ ...card.config, titleVisible: card.titleVisible }} />;
      case 'LightStatusCard':
        return <LightStatusCard config={{ ...card.config, titleVisible: card.titleVisible }} />;
      case 'SensorCard':
        return <SensorCard config={{ ...card.config, titleVisible: card.titleVisible }} />;
      case 'MediaPlayerCard':
        return <MediaPlayerCard config={{ ...card.config, titleVisible: card.titleVisible }} />;
      case 'CurtainCard':
        return <CurtainCard config={{ ...card.config, titleVisible: card.titleVisible }} />;
      case 'ElectricityCard':
        return <ElectricityCard config={{ ...card.config, titleVisible: card.titleVisible }} />;
      case 'ScriptPanel':
        return <ScriptPanel config={{ ...card.config, titleVisible: card.titleVisible }} />;
      case 'WaterPurifierCard':
        return <WaterPurifierCard config={{ ...card.config, titleVisible: card.titleVisible }} />;
      case 'IlluminanceCard':
        return <IlluminanceCard config={{ ...card.config, titleVisible: card.titleVisible }} />;
      case 'RouterCard':
        return <RouterCard config={{ ...card.config, titleVisible: card.titleVisible }} />;
      case 'NASCard':
        return <NASCard config={{ ...card.config, titleVisible: card.titleVisible }} />;
      case 'CameraCard':
        return <CameraSection config={{ ...card.config, titleVisible: card.titleVisible }} />;
      case 'ClimateCard':
        return <ClimateCard config={{ ...card.config, titleVisible: card.titleVisible }} />;
      case 'MotionCard':
        return <MotionCard config={{ ...card.config, titleVisible: card.titleVisible }} />;
      case 'LightOverviewCard':
        return <LightOverviewCard config={{ ...card.config, titleVisible: card.titleVisible }} />;
      default:
        return null;
    }
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
        {loading ? (
          <div className="loading-state">
            <Spin size="large" />
            <p>{t('loading')}</p>
          </div>
        ) : (
          <>
            <div className="header">
              <button
                className="theme-toggle"
                onClick={toggleTheme}
                title={t('theme.' + (theme === 'light' ? 'light' : 'dark'))}
              >
                <Icon
                  path={theme === 'light' ? mdiWeatherNight : mdiWhiteBalanceSunny}
                  size={1}
                  color="var(--color-text-primary)"
                />
              </button>

              <button
                className="language-toggle"
                onClick={toggleLanguage}
                title={t('language.toggle')}
              >
                <Icon
                  path={mdiGoogleTranslate}
                  size={1}
                  color="var(--color-text-primary)"
                />
              </button>

              {!isEditing && (
                <button
                  className="edit-toggle"
                  onClick={() => setIsEditing(true)}
                  title={t('edit')}
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
                  title={t('reset')}
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
                  title={t('done')}
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
                  title={`${t('columns')}: ${columnCount[getCurrentBreakpoint(width)]}`}
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
                  title={t(`sidebar.${sidebarVisible ? 'hide' : 'show'}`)}
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
              rowHeight={5}
              width={width}
              margin={[16, 16]}
              containerPadding={[0, 0]}
              isDraggable={isEditing}
              isResizable={isEditing}
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
                <h2>{t('empty.title')}</h2>
                <p>{t('empty.desc')}</p>
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
          </>
        )}
      </div>
      {/* </PullToRefresh> */}
    </div>
  );
}

export default Home;