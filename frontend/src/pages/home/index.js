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
  mdiFullscreen,
  mdiFullscreenExit,
  mdiCog,
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
import SocketStatusCard from '../../components/SocketStatusCard';
import MaxPlayerCard from '../../components/MaxPlayerCard';
import UniversalCard from '../../components/UniversalCard';
import './style.css';
import { useLanguage } from '../../i18n/LanguageContext';
import { configApi } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();


  // 状态定义
  const [width, setWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [columnCount, setColumnCount] = useState(() => {
    const savedColumns = localStorage.getItem('dashboard-columns');
    return savedColumns ? JSON.parse(savedColumns) : { lg: 3, md: 3, sm: 1 };
  });
  const maxColumnCount = 8;
  const minColumnCount = 1;

  // 添加当前配置状态
  const [currentConfig, setCurrentConfig] = useState(null);

  // 监听窗口大小变化
  useEffect(() => {
    function handleResize() {
      const newWidth = window.innerWidth;
      const newIsMobile = newWidth < 768;
      setWidth(newWidth);
      setIsMobile(newIsMobile);

      // // 根据设备类型加载对应的布局
      // configApi.getConfig().then(config => {
      //   if (config.layouts) {
      //     setCurrentLayouts(newIsMobile ? config.layouts.mobile : config.layouts.desktop);
      //   }
      // }).catch(error => {
      //   console.error('加载布局配置失败:', error);
      // });
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
        let response = await configApi.getConfig();
        if (response.code !== 200) {
          return
        }
        let config = response.data;
        // 设置卡片配置
        if (config.cards) {
          setCards(config.cards.map(card => ({
            ...card,
            visible: card.visible !== false,
            titleVisible: card.titleVisible !== false
          })));
        }

        // 设置布局配置
        if (config.layouts && Object.keys(config.layouts).length > 0) {
          setCurrentLayouts(isMobile ? config.layouts.mobile : config.layouts.desktop);
        } else {
          // 如果没有布局配置，设置一个默认的空布局
          setCurrentLayouts({
            lg: [],
            md: [],
            sm: []
          });
        }

        if (config.globalConfig) {
          // 应用背景设置
          if (config.globalConfig.backgroundColor) {
            document.body.style.backgroundColor = config.globalConfig.backgroundColor;
          }
          if (config.globalConfig.backgroundImage) {
            document.body.style.backgroundImage = `url(${config.globalConfig.backgroundImage})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
          }
        }
    
        // 保存完整配置
        setCurrentConfig(config);

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
        const parsedLayouts = JSON.parse(savedLayouts);
        if (Object.keys(parsedLayouts).length > 0) {
          return parsedLayouts;
        }
      }

      // 处理默认布局
      if (defaultLayouts) {
        const parsedDefaultLayouts = JSON.parse(defaultLayouts);
        if (Object.keys(parsedDefaultLayouts).length > 0) {
          return parsedDefaultLayouts;
        }
      }

      // 如果没有任何布局配置，返回空布局
      return {
        lg: [],
        md: [],
        sm: []
      };
    } catch (error) {
      console.error('解析布局配置失败:', error);
      return {
        lg: [],
        md: [],
        sm: []
      };
    }
  });

  // 添加未保存更改状态
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 处理布局变化
  const handleLayoutChange = (layout, layouts) => {
    setCurrentLayouts(layouts);
    setHasUnsavedChanges(true);
  };

  // 修改保存布局函数
  const handleSaveLayout = async () => {
    try {
      if (!currentConfig) {
        message.error('配置数据不完整，请刷新页面重试');
        return;
      }

      // 更新布局配置
      const newLayouts = {
        ...currentConfig.layouts,
        [isMobile ? 'mobile' : 'desktop']: currentLayouts
      };

      // 准备新的配置
      const newConfig = {
        ...currentConfig,
        layouts: newLayouts
      };

      // 保存更新后的配置
      await configApi.saveConfig(newConfig);
      
      // 更新本地状态
      setCurrentConfig(newConfig);
      setIsEditing(false);
      setHasUnsavedChanges(false);
      message.success(t('config.saveSuccess'));
    } catch (error) {
      console.error('保存布局失败:', error);
      message.error(t('config.saveFailed'));
    }
  };

  // 修改重置布局功能
  const handleResetLayout = async () => {
    try {
      if (!currentConfig?.defaultLayouts) {
        message.error('默认布局数据不存在');
        return;
      }

      const defaultLayout = isMobile ?
        currentConfig.defaultLayouts.mobile :
        currentConfig.defaultLayouts.desktop;

      setCurrentLayouts(defaultLayout);

      // 更新布局配置
      const newLayouts = {
        ...currentConfig.layouts,
        [isMobile ? 'mobile' : 'desktop']: defaultLayout
      };

      // 准备新的配置
      const newConfig = {
        ...currentConfig,
        layouts: newLayouts
      };

      // 保存更新后的配置
      await configApi.saveConfig(newConfig);
      
      // 更新本地状态
      setCurrentConfig(newConfig);
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
      // const sidebarWidth = 0 //isMobile ? 0 : (sidebarVisible ? 200 : 0);
      const containerPadding = isMobile ? 32 : 40;
      // const availableWidth = window.innerWidth - sidebarWidth - containerPadding;
      const availableWidth = window.innerWidth - containerPadding;
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
      [breakpoint]: columnCount[breakpoint] >= maxColumnCount ? minColumnCount : columnCount[breakpoint] + 1
    };
    setColumnCount(newColumnCount);
    localStorage.setItem('dashboard-columns', JSON.stringify(newColumnCount));
  };

  // 添加全屏相关的事件处理
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        setSidebarVisible(false);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen, setSidebarVisible]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setSidebarVisible(false);
    
    // 保持背景图设置
    const applyBackground = async () => {
      try {
        const config = await configApi.getConfig();
        if (config.globalConfig) {
          if (config.globalConfig.backgroundColor) {
            document.body.style.backgroundColor = config.globalConfig.backgroundColor;
          }
          if (config.globalConfig.backgroundImage) {
            document.body.style.backgroundImage = `url(${config.globalConfig.backgroundImage})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
          }
        }
      } catch (error) {
        console.error('应用背景设置失败:', error);
      }
    };
    
    // 延迟一下应用背景，确保在全屏切换后应用
    setTimeout(applyBackground, 100);
  };

  // 添加触摸事件处理
  const handleTouchStart = (e) => {
    if (isFullscreen) {
      setTouchStartY(e.touches[0].clientY);
      setTouchStartX(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e) => {
    if (!isFullscreen || isDragging) return;

    const deltaY = e.touches[0].clientY - touchStartY;
    const deltaX = Math.abs(e.touches[0].clientX - touchStartX);

    // 如果垂直滑动距离大于50px且水平滑动小于垂直滑动（确保是垂直下滑），则退出全屏
    if (deltaY > 50 && deltaX < deltaY) {
      setIsFullscreen(false);
      setSidebarVisible(false);
    }
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
      case 'SocketStatusCard':
        return <SocketStatusCard config={{ ...card.config, titleVisible: card.titleVisible }} />;
      case 'MaxPlayerCard':
        return <MaxPlayerCard config={{ ...card.config, titleVisible: card.titleVisible }} />;
      case 'UniversalCard':
        return <UniversalCard config={{ ...card.config, titleVisible: card.titleVisible }} />;
      default:
        return null;
    }
  };


  return (
    <div 
      className={`page-container ${!sidebarVisible ? 'sidebar-hidden' : ''} ${isFullscreen ? 'fullscreen' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
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
            <div className={`header ${isFullscreen ? 'hidden' : ''}`}>
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

              <button
                className="config-toggle"
                onClick={() => navigate('/config')}
                title={t('nav.config')}
              >
                <Icon
                  path={mdiCog}
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
                  onClick={() => {
                    handleSaveLayout()
                  }}
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

              {!isMobile && false && (
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

              <button
                className="fullscreen-toggle"
                onClick={toggleFullscreen}
                title={t(`fullscreen.${isFullscreen ? 'exit' : 'enter'}`)}
              >
                <Icon
                  path={isFullscreen ? mdiFullscreenExit : mdiFullscreen}
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

            {/* 添加保存按钮 */}
            {hasUnsavedChanges && isEditing && (
              <button
                className="save-button has-changes"
                onClick={handleSaveLayout}
                title={t('config.save')}
              >
                <Icon path={mdiCheck} size={2} />
              </button>
            )}

            {cards.filter(card => card.visible !== false).length === 0 && (
              <div className="empty-state" onClick={() => navigate('/config')}>
                <Icon path={mdiViewDashboard} size={3} color="var(--color-text-secondary)" />
                <h2>{t('empty.title')}</h2>
                <p>{t('empty.desc')}</p>
              </div>
            )}

            {isEditing && isMobile && (
              <button
                className="edit-toggle active"
                onClick={() => {
                  handleSaveLayout();
                }}
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