import React, { useState, useRef, useEffect } from 'react';
import Icon from '@mdi/react';
import {
  mdiPlus,
  mdiDelete,
  mdiClockOutline,
  mdiWeatherPartlyCloudy,
  mdiLightbulbGroup,
  mdiThermometer,
  mdiPlayCircle,
  mdiRouterNetwork,
  mdiCctv,
  mdiCurtains,
  mdiWaterPump,
  mdiLightningBolt,
  mdiWhiteBalanceSunny,
  mdiServerNetwork,
  mdiScriptText,
  mdiCheck,
  // mdiEye,
  // mdiEyeOff,
  mdiSnowflake,
  mdiExport,
  mdiImport,
  mdiMotionSensor,
  mdiHomeFloorG,
  mdiFileFind,
  // mdiClose,
  mdiPencil,
  mdiArrowLeft,
  mdiCog,
  mdiPowerSocket,
  mdiAccountGroup,
  mdiServer,
  mdiFormatQuoteClose,
  // mdiWashingMachine,
  mdiHelpCircle,
  mdiViewDashboard,
} from '@mdi/js';
import AddCardModal from '../../components/AddCardModal';
import EditCardModal from '../../components/EditCardModal';
// import Modal from '../../components/Modal';
import { message, Button, Space, Dropdown, Switch, Spin, Popconfirm, Select } from 'antd';
import { useLanguage } from '../../i18n/LanguageContext';
import { configApi } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import GlobalConfig from '../../components/GlobalConfig';
import './style.css';
import VersionListModal from '../../components/VersionList';
import BottomInfo from '../../components/BottomInfo';
import GroupManager from '../../components/GroupManager';

// 添加默认图标常量
const DEFAULT_CARD_ICON = mdiHelpCircle;

const getCardTypes = (t, groups = []) => ({
  TimeCard: {
    name: t('cards.time'),
    icon: mdiClockOutline,
    fields: [
      {
        key: 'group',
        label: t('groups.selectGroup'),
        type: 'group-select',
        groups: groups,
        default: 'default'
      },
      {
        key: 'title',
        label: t('fields.title'),
        type: 'text',
        default: t('cardTitles.time')
      },
      {
        key: 'timeFormat',
        label: t('fields.timeFormat'),
        type: 'text',
        default: 'HH:mm:ss'
      },
      {
        key: 'dateFormat',
        label: t('fields.dateFormat'),
        type: 'text',
        default: 'YYYY-MM-DD'
      }
    ]
  },
  WeatherCard: {
    name: t('cards.weather'),
    icon: mdiWeatherPartlyCloudy,
    fields: [
      {
        key: 'group',
        label: t('groups.selectGroup'),
        type: 'group-select',
        groups: groups,
        default: 'default'
      },
      {
        key: 'title',
        label: t('fields.title'),
        type: 'text',
        default: t('cardTitles.weather')
      },
      {
        key: 'entity_id',
        label: t('fields.weatherEntity'),
        type: 'entity',
        filter: 'weather.*',
        default: ''
      }
    ]
  },
  LightStatusCard: {
    name: t('cards.light'),
    icon: mdiLightbulbGroup,
    fields: [
      {
        key: 'group',
        label: t('groups.selectGroup'),
        type: 'group-select',
        groups: groups,
        default: 'default'
      },
      {
        key: 'title',
        label: t('fields.title'),
        type: 'text',
        default: t('cardTitles.lightStatus')
      },
      {
        key: 'lights',
        label: t('fields.lightsConfig'),
        type: 'lights-config',
        default: {}
      }
    ]
  },
  SensorCard: {
    name: t('cards.sensor'),
    icon: mdiThermometer,
    fields: [
      {
        key: 'group',
        label: t('groups.selectGroup'),
        type: 'group-select',
        groups: groups,
        default: 'default'
      },
      {
        key: 'title',
        label: t('fields.title'),
        type: 'text',
        default: t('cardTitles.sensor')
      },
      {
        key: 'sensors',
        label: t('fields.sensorsConfig'),
        type: 'sensor-group',
        default: []
      }
    ]
  },
  MediaPlayerCard: {
    name: t('cards.media'),
    icon: mdiPlayCircle,
    fields: [
      {
        key: 'group',
        label: t('groups.selectGroup'),
        type: 'group-select',
        groups: groups,
        default: 'default'
      },
      {
        key: 'title',
        label: t('fields.title'),
        type: 'text',
        default: t('cardTitles.mediaplayer')
      },
      {
        key: 'mediaPlayers',
        label: t('fields.mediaPlayersConfig'),
        type: 'media-players',
        default: []
      }
    ]
  },
  MaxPlayerCard: {  
    name: t('cards.maxPlayer'),
    icon: mdiPlayCircle,
    fields: [
      {
        key: 'group',
        label: t('groups.selectGroup'),
        type: 'group-select',
        groups: groups,
        default: 'default'
      },
      {
        key: 'title',
        label: t('fields.title'),
        type: 'text',
        default: t('cardTitles.maxPlayer')
      },
      {
        key: 'entity_id',
        label: t('configField.selectEntity'),
        type: 'entity',
        filter: 'media_player.*',
        default: ''
      }
    ]
  },
  RouterCard: {
    name: t('cards.router'),
    icon: mdiRouterNetwork,
    fields: [
      {
        key: 'group',
        label: t('groups.selectGroup'),
        type: 'group-select',
        groups: groups,
        default: 'default'
      },
      {
        key: 'title',
        label: t('fields.title'),
        type: 'text',
        default: t('cardTitles.router')
      },
      {
        key: 'router',
        label: t('fields.routerConfig'),
        type: 'router-config',
        default: {}
      }
    ]
  },
  NASCard: {
    name: t('cards.nas'),
    icon: mdiServerNetwork,
    fields: [
      {
        key: 'group',
        label: t('groups.selectGroup'),
        type: 'group-select',
        groups: groups,
        default: 'default'
      },
      {
        key: 'title',
        label: t('fields.title'),
        type: 'text',
        default: t('cardTitles.nas')
      },
      {
        key: 'syno_nas',
        label: t('fields.nasConfig'),
        type: 'nas-config',
        default: {}
      }
    ]
  },
  PVECard: {
    
    name: t('cards.pve'),
    icon: mdiServer,
    fields: [
      {
        key: 'group',
        label: t('groups.selectGroup'),
        type: 'group-select',
        groups: groups,
        default: 'default'
      },
      {
        key: 'title',
        label: t('fields.title'),
        type: 'text',
        default: t('cardTitles.pve')
      },
      {
        key: 'pve_server',
        label: t('fields.pveConfig'),
        type: 'pve-config',
        default: {}
      }
    ]
  },
  ServerCard: {
    name: t('cards.server'),
    icon: mdiServer,
    fields: [
      {
        key: 'group',
        label: t('groups.selectGroup'),
        type: 'group-select',
        groups: groups,
        default: 'default'
      },
      {
        key: 'title',
        label: t('fields.title'),
        type: 'text',
        default: t('cardTitles.server')
      },
      {
        key: 'server',
        label: t('fields.serverConfig'),
        type: 'server-config',
        default: {}
      }
    ]
  },
  CameraCard: {
    name: t('cards.camera'),
    icon: mdiCctv,
    fields: [
      {
        key: 'group',
        label: t('groups.selectGroup'),
        type: 'group-select',
        groups: groups,
        default: 'default'
      },
      {
        key: 'title',
        label: t('fields.title'),
        type: 'text',
        default: t('cardTitles.camera')
      },
      {
        key: 'cameras',
        label: t('fields.camerasConfig'),
        type: 'cameras-config',
        default: []
      }
    ]
  },
  CurtainCard: {
    name: t('cards.curtain'),
    icon: mdiCurtains,
    fields: [
      {
        key: 'group',
        label: t('groups.selectGroup'),
        type: 'group-select',
        groups: groups,
        default: 'default'
      },
      {
        key: 'title',
        label: t('fields.title'),
        type: 'text',
        default: t('cardTitles.curtain')
      },
      {
        key: 'curtains',
        label: t('fields.curtainsConfig'),
        type: 'curtains-config',
        default: []
      }
    ]
  },
  ElectricityCard: {
    name: t('cards.electricity'),
    icon: mdiLightningBolt,
    fields: [
      {
        key: 'group',
        label: t('groups.selectGroup'),
        type: 'group-select',
        groups: groups,
        default: 'default'
      },
      {
        key: 'title',
        label: t('fields.title'),
        type: 'text',
        default: t('cardTitles.electricity')
      },
      {
        key: 'electricity',
        label: t('fields.electricityConfig'),
        type: 'electricity-config',
        default: {}
      }
    ]
  },
  ScriptPanel: {
    name: t('cards.script'),
    icon: mdiScriptText,
    fields: [
      {
        key: 'group',
        label: t('groups.selectGroup'),
        type: 'group-select',
        groups: groups,
        default: 'default'
      },
      {
        key: 'title',
        label: t('fields.title'),
        type: 'text',
        default: t('cardTitles.script')
      },
      {
        key: 'scripts',
        label: t('fields.scriptsConfig'),
        type: 'scripts-config',
        default: []
      }
    ]
  },
  WaterPurifierCard: {
    name: t('cards.water'),
    icon: mdiWaterPump,
    fields: [
      {
        key: 'group',
        label: t('groups.selectGroup'),
        type: 'group-select',
        groups: groups,
        default: 'default'
      },
      {
        key: 'title',
        label: t('fields.title'),
        type: 'text',
        default: t('cardTitles.water')
      },
      {
        key: 'waterpuri',
        label: t('fields.waterConfig'),
        type: 'waterpuri-config',
        default: {}
      }
    ]
  },
  IlluminanceCard: {
    name: t('cards.illuminance'),
    icon: mdiWhiteBalanceSunny,
    fields: [
      {
        key: 'group',
        label: t('groups.selectGroup'),
        type: 'group-select',
        groups: groups,
        default: 'default'
      },
      {
        key: 'title',
        label: t('fields.title'),
        type: 'text',
        default: t('cardTitles.illuminance')
      },
      {
        key: 'sensors',
        label: t('fields.illuminanceConfig'),
        type: 'illuminance-config',
        default: []
      }
    ]
  },
  ClimateCard: {
    name: t('cards.climate'),
    icon: mdiSnowflake,
    fields: [
      {
        key: 'group',
        label: t('groups.selectGroup'),
        type: 'group-select',
        groups: groups,
        default: 'default'
      },
      {
        key: 'title',
        label: t('fields.title'),
        type: 'text',
        default: t('cardTitles.climate')
      },

      {
        key: 'name',
        label: t('fields.name'),
        type: 'text'
      },
      {
        key: 'entity_id',
        label: t('fields.climateEntity'),
        type: 'entity',
        filter: 'climate.*'
      },
      {
        key: 'temperature_entity_id',
        label: t('configField.climateTemperatureEntity'),
        type: 'entity',
        filter: 'sensor.*'
      },
      {
        key: 'humidity_entity_id',
        label: t('configField.climateHumidityEntity'),
        type: 'entity',
        filter: 'sensor.*'
      },
      {
        key: 'features',
        label: t('fields.featuresConfig'),
        type: 'climate-features',
        default: {}
      }
    ]
  },
  MotionCard: {
    name: t('cards.motion'),
    icon: mdiMotionSensor,
    fields: [
      {
        key: 'group',
        label: t('groups.selectGroup'),
        type: 'group-select',
        groups: groups,
        default: 'default'
      },
      {
        key: 'title',
        label: t('fields.title'),
        type: 'text',
        default: t('cardTitles.motion')
      },
      {
        key: 'motion_entity_id',
        label: t('fields.motionEntity'),
        type: 'entity',
        filter: 'event.*'
      },
      {
        key: 'lux_entity_id',
        label: t('fields.luxEntity'),
        type: 'entity',
        filter: 'sensor.*'
      }
    ]
  },
  LightOverviewCard: {
    name: t('cards.lightOverview'),
    icon: mdiHomeFloorG,
    fields: [
      {
        key: 'group',
        label: t('groups.selectGroup'),
        type: 'group-select',
        groups: groups,
        default: 'default'
      },
      {
        key: 'title',
        label: t('fields.title'),
        type: 'text',
        default: t('cardTitles.lightOverview')
      },
      {
        key: 'background',
        label: t('fields.background'),
        type: 'image',
        placeholder: t('fields.placeholderImage'),
        default: ''
      },
      {
        key: 'rooms',
        label: t('fields.roomsConfig'),
        type: 'light-overview-config',
        default: []
      }
    ]
  },
  SocketStatusCard: {
    name: t('cards.socket'),
    icon: mdiPowerSocket,
    fields: [
      {
        key: 'group',
        label: t('groups.selectGroup'),
        type: 'group-select',
        groups: groups,
        default: 'default'
      },
      {
        key: 'title',
        label: t('fields.title'),
        type: 'text',
        default: t('cardTitles.socketStatus')
      },
      {
        key: 'sockets',
        label: t('fields.socketsConfig'),
        type: 'socket-config',
        default: {}
      }
    ]
  },
  UniversalCard: {
    name: t('cards.universal'),
    icon: mdiThermometer,
    fields: [
      {
        key: 'group',
        label: t('groups.selectGroup'),
        type: 'group-select',
        groups: groups,
        default: 'default'
      },
      {
        key: 'title',
        label: t('fields.title'),
        type: 'text',
        default: t('cardTitles.universal')
      },
      {
        key: 'entities',
        label: t('fields.entitiesConfig'),
        type: 'universal-entities',
        default: []
      }
    ]
  },
  FamilyCard: {
    name: t('cards.family'),
    icon: mdiAccountGroup,
    fields: [
      {
        key: 'group',
        label: t('groups.selectGroup'),
        type: 'group-select',
        groups: groups,
        default: 'default'
      },
      {
        key: 'title',
        label: t('fields.title'),
        type: 'text',
        default: t('cardTitles.family')
      },
      {
        key: 'persons',
        label: t('fields.personsConfig'),
        type: 'persons-config',
        default: []
      }
    ]
  },
  // WashingMachineCard: {
  //   name: t('cards.washingMachine'),
  //   icon: mdiWashingMachine,
  //   fields: [
  //     {
  //       key: 'title',
  //       label: t('fields.title'),
  //       type: 'text',
  //       default: t('cardTitles.washingMachine')
  //     },
  //     {
  //       key: 'config',
  //       label: t('fields.washingMachineConfig'),
  //       type: 'washing-machine-config',
  //       default: {}
  //     }
  //   ]
  // },
  DailyQuoteCard: {
    name: t('cards.dailyQuote'),
    icon: mdiFormatQuoteClose,
    fields: [
      {
        key: 'group',
        label: t('groups.selectGroup'),
        type: 'group-select',
        groups: groups,
        default: 'default'
      },
      {
        key: 'title',
        label: t('fields.title'),
        type: 'text',
        default: t('cardTitles.dailyQuote')
      },
      {
        key: 'quotes',
        label: t('fields.quotesConfig'),
        type: 'quotes-config',
        default: []
      }
    ]
  }
});


function ConfigPage({ sidebarVisible, setSidebarVisible }) {
  const fileInputRef = useRef(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewConfig, setPreviewConfig] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const isMobile = window.innerWidth < 768;
  const navigate = useNavigate();
  
  // 修改卡片状态的初始化
  const [cards, setCards] = useState([]);
  const [editingCard, setEditingCard] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGlobalConfig, setShowGlobalConfig] = useState(false);
  const [globalConfig, setGlobalConfig] = useState(null);
  const [showGroupManager, setShowGroupManager] = useState(false);
  const [groups, setGroups] = useState([]);
  const [filterGroup, setFilterGroup] = useState('all'); // 添加分组筛选状态

  // 修改加载配置数据的 useEffect
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const response = await configApi.getConfig();
        const config = response.data;
        if (config.cards) {
          setCards(config.cards.map(card => ({
            ...card,
            visible: card.visible !== false,
            titleVisible: card.titleVisible !== false,
            group: card.group || 'default'
          })));
          setGlobalConfig(config.globalConfig);

          // 加载分组配置
          if (config.globalConfig && config.globalConfig.groups) {
            setGroups(config.globalConfig.groups);
          }
        }
      } catch (error) {
        console.error('加载配置失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []); // 移除 t 依赖，因为它不需要在这里触发重新加载



  // 修改保存函数
  const handleSave = async () => {
    try {
      message.loading(t('config.saving'));
      // 保存卡片配置和分组配置到后端
      await configApi.saveConfig({
        globalConfig: {
          ...globalConfig,
          groups: groups
        },
        cards,
        // 不再包含布局信息
      });
      message.destroy();
      setHasUnsavedChanges(false);
      message.success(t('config.saveSuccess'));
    } catch (error) {
      console.error('保存配置失败:', error);
      message.error(t('config.saveFailed'));
    }
  };

  // 修改导入函数
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const content = await file.text();
        const importedConfig = JSON.parse(content);
        
        // 验证导入的配置
        if (!Array.isArray(importedConfig.cards)) {
          throw new Error('无效的配置文件格式');
        }

        // 保存到后端，但只保存卡片配置，不保存布局
        await configApi.saveConfig({
          cards: importedConfig.cards,
          // 不再包含布局信息
        });
        
        // 更新本地状态
        setCards(importedConfig.cards.map(card => ({
          ...card,
          visible: card.visible !== false,
          titleVisible: card.titleVisible !== false
        })));
        
        
        setHasUnsavedChanges(false);
        message.success(t('config.importSuccess'));
      } catch (error) {
        console.error('导入配置失败:', error);
        message.error(t('config.importFailed'));
      }
      // 清除文件输入
      event.target.value = '';
    }
  };

  // 添加导入布局的处理函数
  const handleImportLayout = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const content = await file.text();
        const importedLayout = JSON.parse(content);
        
        // 验证导入的布局
        if (!importedLayout.layouts) {
          throw new Error('无效的布局文件格式');
        }

        // 分别保存移动端和桌面端布局
        localStorage.setItem('mobile-dashboard-layouts', JSON.stringify(importedLayout.layouts));
        localStorage.setItem('desktop-dashboard-layouts', JSON.stringify(importedLayout.layouts));
        
        message.success(t('config.layoutImportSuccess'));
      } catch (error) {
        console.error('导入布局失败:', error);
        message.error(t('config.layoutImportFailed'));
      }
      // 清除文件输入
      event.target.value = '';
    }
  };

  // 添加导出布局的处理函数
  const handleExportLayout = () => {
    try {
      // 获取桌面端和移动端布局
      const desktopLayouts = localStorage.getItem('desktop-dashboard-layouts');
      const mobileLayouts = localStorage.getItem('mobile-dashboard-layouts');
      
      if (!desktopLayouts && !mobileLayouts) {
        throw new Error('没有找到布局配置');
      }

      // 优先使用桌面端布局，如果没有则使用移动端布局
      const layouts = desktopLayouts ? JSON.parse(desktopLayouts) : JSON.parse(mobileLayouts);
      
      // 创建导出对象
      const exportData = {
        layouts: layouts
      };
      
      // 创建下载
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hass-panel-layout-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success(t('config.layoutExportSuccess'));
    } catch (error) {
      console.error('导出布局失败:', error);
      message.error(t('config.layoutExportFailed'));
    }
  };

  // 修改导出函数
  const handleExport = async () => {
    try {
      // 从后端获取最新配置
      const response = await configApi.getConfig();
      const config = response.data;
      
      // 导出时只包含卡片配置，不包含布局配置
      const exportConfig = {
        cards: config.cards,
        globalConfig: config.globalConfig
      };
      
      // 创建下载
      const blob = new Blob([JSON.stringify(exportConfig, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hass-panel-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出配置失败:', error);
      message.error(t('config.exportFailed'));
    }
  };

  // 修改添加卡片函数
  const handleAddCard = (type) => {
    const newCard = {
      id: Date.now(),
      type,
      config: {},
      visible: true,
      titleVisible: true,
      group: 'default'
    };

    // 添加默认配置
    const cardType = getCardTypes(t, groups)[type];
    if (cardType && cardType.fields) {
      cardType.fields.forEach(field => {
        if (field.default !== undefined) {
          newCard.config[field.key] = field.default;
        }
      });
    }

    setCards(prevCards => [...prevCards, newCard]);
    setShowAddModal(false);
    setShowEditModal(true);
    setEditingCard(newCard);
    setHasUnsavedChanges(true);
  };

  // 添加编辑卡片的处理函数
  const handleEditCard = (card) => {
    setEditingCard(card);
    if (card.type === 'LightOverviewCard') {
      setPreviewConfig(card.config);
    }
    setShowEditModal(true);
  };

  // 添加保存编辑的处理函数
  const handleSaveEdit = (updatedCard) => {
    setCards(prevCards =>
      prevCards.map(card =>
        card.id === updatedCard.id ? updatedCard : card
      )
    );
    setHasUnsavedChanges(true);
  };

  // 处理卡片显示状态变化
  const handleVisibilityChange = (cardId) => {
    setCards(prevCards => {
      const newCards = prevCards.map(card => {
        if (card.id === cardId) {
          return {
            ...card,
            visible: card.visible === false ? true : false
          };
        }
        return card;
      });
      setHasUnsavedChanges(true);
      return newCards;
    });
  };

  // 处理卡片标题显示状态变化
  const handleTitleVisibilityChange = (cardId) => {
    setCards(prevCards => {
      const newCards = prevCards.map(card => {
        if (card.id === cardId) {
          return {
            ...card,
            titleVisible: card.titleVisible === false ? true : false
          };
        }
        return card;
      });
      setHasUnsavedChanges(true);
      return newCards;
    });
  };

  const handleDeleteCard = (cardId) => {
    setCards(cards.filter(card => card.id !== cardId));
    setHasUnsavedChanges(true);
  };

  // 处理卡片分组切换
  const handleGroupChange = (cardId, newGroupId) => {
    setCards(prevCards => {
      const newCards = prevCards.map(card => {
        if (card.id === cardId) {
          return {
            ...card,
            group: newGroupId,
            config: {
              ...card.config,
              group: newGroupId
            }
          };
        }
        return card;
      });
      setHasUnsavedChanges(true);
      return newCards;
    });
  };

  // const handleConfigChange = (cardId, key, value) => {
  //   setCards(cards.map(card => {
  //     if (card.id === cardId) {
  //       const newConfig = { ...card.config, [key]: value };
  //       // 如果是 LightOverviewCard，更新预览配置
  //       if (card.type === 'LightOverviewCard') {
  //         setPreviewConfig(newConfig);
  //       }
  //       return { ...card, config: newConfig };
  //     }
  //     return card;
  //   }));
  //   setHasUnsavedChanges(true);
  // };

  // 保存分组配置
  const handleSaveGroups = (newGroups) => {
    setGroups(newGroups);
    setHasUnsavedChanges(true);
  };

  // 修改版本列表相关函数
  const handleVersionList = async () => {
    try {
      setShowVersionModal(true);
    } catch (error) {
      message.error('获取版本列表失败: ' + error.message);
    }
  };

  // 修改配置菜单项
  const configMenuItems = [
    {
      key: 'import',
      label: t('config.import'),
      icon: <Icon path={mdiImport} size={12} />,
      onClick: () => fileInputRef.current.click()
    },
    {
      key: 'export',
      label: t('config.export'),
      icon: <Icon path={mdiExport} size={12} />,
      onClick: handleExport
    },
    {
      key: 'importLayout',
      label: t('config.importLayout'),
      icon: <Icon path={mdiImport} size={12} />,
      onClick: () => document.getElementById('layoutFileInput').click()
    },
    {
      key: 'exportLayout',
      label: t('config.exportLayout'),
      icon: <Icon path={mdiExport} size={12} />,
      onClick: handleExportLayout
    },
    {
      key: 'versions',
      label: t('config.versionList'),
      icon: <Icon path={mdiFileFind} size={12} />,
      onClick: handleVersionList
    }
  ];

 
  return (
    <div className={`config-page ${!sidebarVisible ? 'sidebar-hidden' : ''}`}>
      <div className="config-container">
        <div className="config-header">
          <Space className="header-buttons">
           {!isMobile && <Button 
                className="back-button"
                onClick={() => navigate('/')}
                icon={<Icon path={mdiArrowLeft} size={12} />}
              >
                {t('nav.home')}
              </Button>
          }

            <Button
              className="global-config-button"
              onClick={() => setShowGlobalConfig(true)}
              icon={<Icon path={mdiCog} size={12} />}
            >
              {t('config.globalConfig')}
            </Button>

            <Button
              className="group-manager-button"
              onClick={() => setShowGroupManager(true)}
              icon={<Icon path={mdiViewDashboard} size={12} />}
            >
              {t('groups.manage')}
            </Button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              style={{ display: 'none' }}
            />
            <input
              type="file"
              id="layoutFileInput"
              onChange={handleImportLayout}
              accept=".json"
              style={{ display: 'none' }}
            />

            <Dropdown menu={{ items: configMenuItems }} placement="bottomLeft">
              <Button>
                {t('config.title')}
                <Icon path={mdiImport} size={12} style={{ marginLeft: 8 }} />
              </Button>
            </Dropdown>
          </Space>
        </div>

        {/* 添加分组筛选器 */}
        <div className="group-filter-container">
          <span className="filter-label">{t('groups.selectGroup')}:</span>
          <Select
            value={filterGroup}
            onChange={setFilterGroup}
            style={{ width: 180 }}
            options={[
              { value: 'all', label: t('groups.all') || '全部' },
              { value: 'default', label: t('groups.default') },
              ...groups.map(g => ({ value: g.id, label: g.name }))
            ]}
          />
          {filterGroup !== 'all' && (
            <Button
              type="text"
              size="small"
              onClick={() => setFilterGroup('all')}
              style={{ marginLeft: 8 }}
            >
              {t('config.clearFilter') || '清除筛选'}
            </Button>
          )}
        </div>

        <div className="config-list">
          {cards
            .filter(card => {
              // 根据筛选条件过滤卡片
              if (filterGroup === 'all') return true;
              const cardGroup = card.config.group || card.group || 'default';
              return cardGroup === filterGroup;
            })
            .map(card => {
            // 准备分组选项
            const groupOptions = [
              { value: 'default', label: t('groups.default') },
              ...groups.map(g => ({ value: g.id, label: g.name }))
            ];

            return (
              <div key={card.id} className="config-card">
                <div className="card-header">
                  <div className="card-icon">
                    <Icon path={getCardTypes(t, groups)[card.type]?.icon || DEFAULT_CARD_ICON} size={14} />
                  </div>
                  <h3 className="card-title">{card.config.title}</h3>
                </div>
                <div className="card-switches">
                  <div className="switch-item">
                    <span>{t('groups.selectGroup')}</span>
                    <Select
                      size="small"
                      value={card.config.group || 'default'}
                      onChange={(value) => handleGroupChange(card.id, value)}
                      options={groupOptions}
                      style={{ width: 120 }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="switch-item">
                    <span>{t('config.showTitle')}</span>
                    <Switch
                      size="small"
                      checked={card.titleVisible}
                      onChange={() => handleTitleVisibilityChange(card.id)}
                    />
                  </div>
                  <div className="switch-item">
                    <span>{t('config.showCard')}</span>
                    <Switch
                      size="small"
                      checked={card.visible}
                      onChange={() => handleVisibilityChange(card.id)}
                    />
                  </div>
                </div>
                <div className="card-actions">
                  <Button
                    size="small"
                    icon={<Icon path={mdiPencil} size={12} />}
                    onClick={() => handleEditCard(card)}
                  >
                    {t('config.edit')}
                  </Button>
                  <Popconfirm
                    title={t('config.deleteConfirm')}
                    okText={t('config.confirm')}
                    cancelText={t('config.cancel')}
                    onConfirm={() => handleDeleteCard(card.id)}
                  >
                    <Button
                      size="small"
                      type="text"
                      danger
                      icon={<Icon path={mdiDelete} size={12} />}
                    >
                      {t('config.delete')}
                    </Button>
                  </Popconfirm>
                </div>
              </div>
            );
          })}
        </div>

      {!isMobile && <BottomInfo />}
      </div>

      {showAddModal && (
        <AddCardModal
          onClose={() => setShowAddModal(false)}
          onSelect={handleAddCard}
          cardTypes={getCardTypes(t, groups)}
        />
      )}

      <EditCardModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCard(null);
          setShowPreview(false);
        }}
        card={editingCard}
        cardTypes={getCardTypes(t, groups)}
        onSave={handleSaveEdit}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        previewConfig={previewConfig}
        setPreviewConfig={setPreviewConfig}
      />

      <VersionListModal
        visible={showVersionModal}
        onCancel={() => setShowVersionModal(false)}
        setCards={setCards}
        setHasUnsavedChanges={setHasUnsavedChanges}
        setShowVersionModal={setShowVersionModal}
      />

      {/* 保存按钮 */}
      <button
        className={`save-button ${hasUnsavedChanges ? 'has-changes' : ''}`}
        onClick={handleSave}
      >
        <Icon path={mdiCheck} size={28} />
      </button>

      {/* 添加卡片按钮 */}
      <button
        className="add-card-button"
        onClick={() => setShowAddModal(true)}
      >
        <Icon path={mdiPlus} size={42} />
      </button>

      {loading && (
        <div className="loading-state">
          <Spin size="large" />
          <p>{t('loading')}</p>
        </div>
      )}

      {showGlobalConfig && (
        <>
          <GlobalConfig
            showGlobalConfig={showGlobalConfig}
            setShowGlobalConfig={setShowGlobalConfig}
          />
        </>
      )}

      {/* 分组管理弹窗 */}
      <GroupManager
        visible={showGroupManager}
        onCancel={() => setShowGroupManager(false)}
        groups={groups}
        onSave={handleSaveGroups}
      />
    </div>
  );
}

export default ConfigPage;