import React, { useState, useEffect, useCallback } from 'react';
// import { PullToRefresh } from 'antd-mobile';
import Icon from '@mdi/react';
import {
  mdiWeatherNight,
  mdiWhiteBalanceSunny,
  mdiCheck,
  mdiPencil,
  mdiRefresh,
  mdiMenu,
  mdiViewDashboard,
  mdiGoogleTranslate,
  mdiFullscreen,
  mdiFullscreenExit,
  mdiCog,
  mdiMonitor,
} from '@mdi/js';
import { useTheme } from '../../theme/ThemeContext';
import { Responsive } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { message, Spin, Popconfirm } from 'antd';
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
import FamilyCard from '../../components/FamilyCard';
import ServerCard from '../../components/ServerCard';
import PVECard from '../../components/PVECard';
import './style.css';
import { useLanguage } from '../../i18n/LanguageContext';
import { configApi, applyBackgroundToBody } from '../../utils/api';
import { useNavigate } from 'react-router-dom';


function Home({ sidebarVisible, setSidebarVisible }) {
  const { theme, setSpecificTheme } = useTheme();
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
  const [columnCount, setColumnCount] = useState({ lg: 30, md: 30, sm: 1 });

  // 添加主题菜单状态
  const [themeMenuVisible, setThemeMenuVisible] = useState(false);

  // 获取主题图标
  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return mdiWhiteBalanceSunny;
      case 'dark':
        return mdiWeatherNight;
      case 'system':
        return mdiMonitor;
      default:
        return mdiWhiteBalanceSunny;
    }
  };

  // 添加一个函数，验证布局是否包含所有可见卡片
  const isLayoutValid = useCallback((layouts, cards) => {
    const visibleCardIds = cards
      .filter(card => card.visible !== false)
      .map(card => card.id.toString());

    // 检查每个断点的布局
    for (const breakpoint of Object.keys(layouts)) {
      // 确保布局存在且不为空
      if (!layouts[breakpoint] || layouts[breakpoint].length === 0) {
        return false;
      }

      // 获取布局中的所有卡片ID
      const layoutItemIds = layouts[breakpoint].map(item => item.i);

      // 检查所有可见卡片是否都在布局中
      for (const cardId of visibleCardIds) {
        if (!layoutItemIds.includes(cardId)) {
          return false;
        }
      }

      // 检查布局中是否包含不存在的卡片
      for (const itemId of layoutItemIds) {
        if (!visibleCardIds.includes(itemId)) {
          return false;
        }
      }
    }

    return true;
  }, []);
  // 添加一个函数，计算默认布局
  const calculateDefaultLayouts = useCallback((cards) => {
    // 基础布局参数
    const baseParams = {
      lg: { cols: 30, cardWidth: 6 },  // 从5改为4，使卡片更窄，可以在一行放置更多卡片
      md: { cols: 30, cardWidth: 6 },
      sm: { cols: 1, cardWidth: 1 }
    };

    // 添加卡片高度配置
    const cardHeights = {
      TimeCard: { lg: 10, md: 10, sm: 10 },
      WeatherCard: { lg: 20, md: 20, sm: 20 },
      LightStatusCard: { lg: 24, md: 24, sm: 24 },
      LightOverviewCard: { lg: 22, md: 22, sm: 22 },
      SensorCard: { lg: 16, md: 16, sm: 16 },
      RouterCard: { lg: 26, md: 26, sm: 26 },
      NASCard: { lg: 36, md: 36, sm: 36 },
      MediaPlayerCard: { lg: 30, md: 30, sm: 30 },
      MaxPlayerCard: { lg: 30, md: 30, sm: 30 },
      CurtainCard: { lg: 30, md: 30, sm: 30 },
      ElectricityCard: { lg: 24, md: 24, sm: 24 },
      ScriptPanel: { lg: 14, md: 14, sm: 14 },
      WaterPurifierCard: { lg: 24, md: 24, sm: 24 },
      IlluminanceCard: { lg: 16, md: 16, sm: 16 },
      CameraCard: { lg: 20, md: 20, sm: 20 },
      ClimateCard: { lg: 28, md: 28, sm: 28 },
      MotionCard: { lg: 20, md: 20, sm: 20 },
      SocketStatusCard: { lg: 24, md: 24, sm: 24 },
    };

    // 创建布局对象
    const layouts = {
      lg: [],
      md: [],
      sm: []
    };

    // 计算每个卡片的位置
    cards.filter(card => card.visible !== false).forEach((card, index) => {
      const cardId = card.id.toString();
      const height = cardHeights[card.type] || { lg: 10, md: 10, sm: 10 };

      // 为每个断点计算布局
      Object.keys(layouts).forEach(breakpoint => {
        const { cardWidth } = baseParams[breakpoint];
        
        // 计算卡片位置
        let col, row;
        
        if (breakpoint === 'sm') {
          // 移动端保持单列布局
          col = 0;
          row = index;
        } else {
          // 非移动端使用多列布局
          // 在30列布局中，
          col = (index % 5) * 6 
          row = Math.floor(index / 5);
        }

        layouts[breakpoint].push({
          card_type: card.type,
          i: cardId,
          x: col,
          y: row * 10, // 简单的行间距
          w: cardWidth,
          h: height[breakpoint]
        });
      });
    });

    return layouts;
  }, []);

  // 监听窗口大小变化
  useEffect(() => {
    function handleResize() {
      const newWidth = window.innerWidth;
      const newIsMobile = newWidth < 768;
      setWidth(newWidth);
      setIsMobile(newIsMobile);

      // 如果设备类型发生变化（从移动端到桌面端或反之），重新加载对应的布局
      if (newIsMobile !== isMobile) {
        const layoutKey = newIsMobile ? 'mobile-dashboard-layouts' : 'desktop-dashboard-layouts';
        const savedLayouts = localStorage.getItem(layoutKey);

        if (savedLayouts) {
          try {
            const parsedLayouts = JSON.parse(savedLayouts);
            if (Object.keys(parsedLayouts).length > 0) {
              setCurrentLayouts(parsedLayouts);
            } else if (cards.length > 0) {
              // 如果没有保存的布局但有卡片，生成新布局
              const newLayouts = calculateDefaultLayouts(cards);
              setCurrentLayouts(newLayouts);
              localStorage.setItem(layoutKey, JSON.stringify(newLayouts));
            }
          } catch (error) {
            console.error('加载布局失败:', error);
            // 如果加载失败且有卡片，生成新布局
            if (cards.length > 0) {
              const newLayouts = calculateDefaultLayouts(cards);
              setCurrentLayouts(newLayouts);
              localStorage.setItem(layoutKey, JSON.stringify(newLayouts));
            }
          }
        } else if (cards.length > 0) {
          // 如果没有保存的布局但有卡片，生成新布局
          const newLayouts = calculateDefaultLayouts(cards);
          setCurrentLayouts(newLayouts);
          localStorage.setItem(layoutKey, JSON.stringify(newLayouts));
        }
        
        // 设置列数
        if (newIsMobile) {
          setColumnCount({ lg: 1, md: 1, sm: 1 });
        } else {
          setColumnCount({ lg: 30, md: 30, sm: 1 });
        }
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [cards, isMobile, calculateDefaultLayouts]);
  // 添加一个函数，合并现有布局和新计算的布局
  const mergeLayouts = useCallback((defaultLayouts, currentLayouts, cardIds) => {
    const result = {};

    // 为每个断点处理布局
    for (const breakpoint of Object.keys(defaultLayouts)) {
      result[breakpoint] = [];

      // 保留现有卡片的布局
      cardIds.forEach(cardId => {
        // 查找现有布局中的项
        const existingItem = currentLayouts[breakpoint]?.find(item => item.i === cardId);
        if (existingItem) {
          // 如果存在，使用现有布局
          result[breakpoint].push(existingItem);
        } else {
          // 否则使用默认布局中的对应项
          const defaultItem = defaultLayouts[breakpoint].find(item => item.i === cardId);
          if (defaultItem) {
            result[breakpoint].push(defaultItem);
          }
        }
      });

      // 确保所有卡片都在结果中
      for (const defaultItem of defaultLayouts[breakpoint]) {
        if (!result[breakpoint].some(item => item.i === defaultItem.i)) {
          result[breakpoint].push(defaultItem);
        }
      }

      // 移除不存在的卡片
      result[breakpoint] = result[breakpoint].filter(item => cardIds.includes(item.i));
    }

    return result;
  }, []);
  // 修改加载配置数据的 useEffect
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);

        // 尝试从后端获取卡片配置
        let response = await configApi.getConfig();
        if (response.code !== 200) {
          return
        }
        let config = response.data;

        // 设置卡片配置
        if (config.cards) {
          const updatedCards = config.cards.map(card => ({
            ...card,
            visible: card.visible !== false,
            titleVisible: card.titleVisible !== false
          }));
          setCards(updatedCards);

          // 设置布局配置（从本地存储加载）
          const layoutKey = isMobile ? 'mobile-dashboard-layouts' : 'desktop-dashboard-layouts';
          const savedLayouts = localStorage.getItem(layoutKey);

          let loadedLayouts;
          if (savedLayouts) {
            try {
              loadedLayouts = JSON.parse(savedLayouts);
              // 验证布局是否完整
              if (!isLayoutValid(loadedLayouts, updatedCards)) {
                // 布局不完整，需要合并默认布局
                const defaultLayouts = calculateDefaultLayouts(updatedCards);
                loadedLayouts = mergeLayouts(
                  defaultLayouts,
                  loadedLayouts,
                  updatedCards.filter(card => card.visible !== false).map(card => card.id.toString())
                );
                // 保存更新后的布局
                localStorage.setItem(layoutKey, JSON.stringify(loadedLayouts));
              }
            } catch (error) {
              console.error('解析本地布局失败:', error);
              loadedLayouts = calculateDefaultLayouts(updatedCards);
              localStorage.setItem(layoutKey, JSON.stringify(loadedLayouts));
            }
          } else {
            // 没有本地布局，计算默认布局
            loadedLayouts = calculateDefaultLayouts(updatedCards);
            localStorage.setItem(layoutKey, JSON.stringify(loadedLayouts));
          }

          setCurrentLayouts(loadedLayouts);
        }

        if (config.globalConfig) {
          applyBackgroundToBody(config.globalConfig);
        }


      } catch (error) {
        console.error('加载配置失败:', error);
        message.error('加载配置失败: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [isMobile, calculateDefaultLayouts, mergeLayouts, isLayoutValid]); // 恢复 isMobile 依赖，因为移动设备和桌面设备的布局不同


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
  // const [ setHasUnsavedChanges] = useState(false);

  // 处理布局变化
  const handleLayoutChange = (layout, layouts) => {
    setCurrentLayouts(layouts);

    // 保存布局到本地存储
    const layoutKey = isMobile ? 'mobile-dashboard-layouts' : 'desktop-dashboard-layouts';
    localStorage.setItem(layoutKey, JSON.stringify(layouts));
  };

  // 修改保存布局函数
  const handleSaveLayout = () => {
    try {
      // 保存布局到本地存储
      const layoutKey = isMobile ? 'mobile-dashboard-layouts' : 'desktop-dashboard-layouts';
      localStorage.setItem(layoutKey, JSON.stringify(currentLayouts));
      
      // 不再保存列数到本地存储
      
      setIsEditing(false);
      message.success(t('layout.saveSuccess'));
    } catch (error) {
      console.error('保存布局失败:', error);
      message.error(t('layout.saveFailed'));
    }
  };

  // 修改重置布局功能
  const handleResetLayout = () => {
    try {
      // 不再从后端获取默认布局，而是重新计算
      const newLayouts = calculateDefaultLayouts(cards);
      setCurrentLayouts(newLayouts);

      // 保存到本地存储
      const layoutKey = isMobile ? 'mobile-dashboard-layouts' : 'desktop-dashboard-layouts';
      localStorage.setItem(layoutKey, JSON.stringify(newLayouts));

      setIsEditing(false);
      message.success(t('config.resetSuccess'));
    } catch (error) {
      console.error('重置布局失败:', error);
      message.error('重置布局失败');
    }
  };

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

  // 关闭主题菜单的处理函数
  const handleClickOutside = useCallback((event) => {
    if (themeMenuVisible && !event.target.closest('.theme-menu-container')) {
      setThemeMenuVisible(false);
    }
  }, [themeMenuVisible]);

  // 添加点击外部关闭菜单的事件监听
  useEffect(() => {
    if (themeMenuVisible) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [themeMenuVisible, handleClickOutside]);

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
      case 'FamilyCard':
        return <FamilyCard config={{ ...card.config, titleVisible: card.titleVisible }} />;
      case 'PVECard':
        return <PVECard config={{ ...card.config, titleVisible: card.titleVisible }} />;
      case 'ServerCard':
        return <ServerCard config={{ ...card.config, titleVisible: card.titleVisible }} />;
      default:
        return null;
    }
  };



  // 添加一个计算默认布局的函数


  // 添加一个函数，用于确保布局中包含所有卡片
  const updateLayoutsForCards = useCallback(() => {
    const visibleCards = cards.filter(card => card.visible !== false);
    const cardIds = visibleCards.map(card => card.id.toString());

    // 检查当前布局是否包含所有卡片
    const allBreakpoints = ['lg', 'md', 'sm'];
    let needsUpdate = false;

    // 为每个断点检查布局
    for (const breakpoint of allBreakpoints) {
      if (!currentLayouts[breakpoint]) {
        needsUpdate = true;
        break;
      }

      // 确认所有可见卡片都在布局中
      const layoutItemIds = currentLayouts[breakpoint].map(item => item.i);
      for (const cardId of cardIds) {
        if (!layoutItemIds.includes(cardId)) {
          needsUpdate = true;
          break;
        }
      }

      // 移除布局中不存在的卡片
      const hasExtraItems = currentLayouts[breakpoint].some(item => !cardIds.includes(item.i));
      if (hasExtraItems) {
        needsUpdate = true;
      }

      if (needsUpdate) break;
    }

    // 如果需要更新布局，重新计算并保存
    if (needsUpdate) {
      const newLayouts = mergeLayouts(calculateDefaultLayouts(visibleCards), currentLayouts, cardIds);
      setCurrentLayouts(newLayouts);

      // 保存新布局到本地
      const layoutKey = isMobile ? 'mobile-dashboard-layouts' : 'desktop-dashboard-layouts';
      localStorage.setItem(layoutKey, JSON.stringify(newLayouts));
    }
  }, [currentLayouts, cards, isMobile, calculateDefaultLayouts, setCurrentLayouts, mergeLayouts]);

  // 添加一个函数，验证布局是否包含所有可见卡片


  // 添加对cards变化的监听
  useEffect(() => {
    // 当卡片列表发生变化时，检查并更新布局
    if (cards.length > 0 && !loading) {
      updateLayoutsForCards();
    }
  }, [cards, loading, updateLayoutsForCards]);

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
              <div className="theme-menu-container">
                <button
                  className="theme-toggle"
                  onClick={() => setThemeMenuVisible(!themeMenuVisible)}
                  title={t('theme.' + theme)}
                >
                  <Icon
                    path={getThemeIcon()}
                    size={1}
                    color="var(--color-text-primary)"
                  />
                </button>

                {themeMenuVisible && (
                  <div className="theme-menu">
                    <button
                      className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                      onClick={() => {
                        setSpecificTheme('light');
                        setThemeMenuVisible(false);
                      }}
                    >
                      <Icon path={mdiWhiteBalanceSunny} size={0.8} />
                      <span>{t('theme.light')}</span>
                    </button>
                    <button
                      className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                      onClick={() => {
                        setSpecificTheme('dark');
                        setThemeMenuVisible(false);
                      }}
                    >
                      <Icon path={mdiWeatherNight} size={0.8} />
                      <span>{t('theme.dark')}</span>
                    </button>
                    <button
                      className={`theme-option ${theme === 'system' ? 'active' : ''}`}
                      onClick={() => {
                        setSpecificTheme('system');
                        setThemeMenuVisible(false);
                      }}
                    >
                      <Icon path={mdiMonitor} size={0.8} />
                      <span>{t('theme.system')}</span>
                    </button>
                  </div>
                )}
              </div>

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
                <Popconfirm
                  title="重置布局"
                  description="确定要重置布局吗？"
                  okText="确定"
                  cancelText="取消"
                  onConfirm={() => handleResetLayout()}
                >
                  <button
                    className="reset-layout"
                    title={t('reset')}
                  >
                    <Icon
                      path={mdiRefresh}
                      size={1}
                      color="var(--color-text-primary)"
                    />
                  </button>
                </Popconfirm>

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
              containerPadding={isMobile ? [16, 16] : [20, 20]}
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
            {isEditing && (
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