import React, { useState, useRef } from 'react';
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
  mdiEye,
  mdiEyeOff,
  mdiSnowflake,
  mdiExport,
  mdiImport,
  mdiMotionSensor,
  mdiHomeFloorG,
  mdiFileFind,
  mdiClose,
  mdiInformationOutline,
} from '@mdi/js';
import ConfigField from '../../components/ConfigField';
import AddCardModal from '../../components/AddCardModal';
// import Modal from '../../components/Modal';
import LightOverviewCard from '../../components/LightOverviewCard';
import { createClient } from 'webdav';
import { message, Modal, Form, Input, Checkbox, Button, Space, Dropdown, List, Tooltip } from 'antd';

import './style.css';

const CARD_TYPES = {
  TimeCard: {
    name: '时间卡片',
    icon: mdiClockOutline,
    fields: [
      {
        key: 'timeFormat',
        label: '时间格式',
        type: 'text',
        default: 'HH:mm:ss'
      },
      {
        key: 'dateFormat',
        label: '日期格式',
        type: 'text',
        default: 'YYYY年MM月DD日'
      }
    ]
  },
  WeatherCard: {
    name: '天气卡片',
    icon: mdiWeatherPartlyCloudy,
    fields: [
      {
        key: 'entity_id',
        label: '天气实体',
        type: 'entity',
        filter: 'weather.*',
        default: 'weather.wo_de_jia'
      }
    ]
  },
  LightStatusCard: {
    name: '灯光状态',
    icon: mdiLightbulbGroup,
    fields: [
      {
        key: 'lights',
        label: '灯光配置',
        type: 'lights-config',
        default: {}
      }
    ]
  },
  SensorCard: {
    name: '传感器卡片',
    icon: mdiThermometer,
    fields: [
      {
        key: 'sensors',
        label: '传感器配置',
        type: 'sensor-group',
        default: [
          {
            id: 'LIVING_ROOM',
            name: '客厅',
            sensors: {
              temperature: {
                entity_id: '',
                name: '温度',
                icon: 'mdiThermometer'
              },
              humidity: {
                entity_id: '',
                name: '湿度',
                icon: 'mdiWaterPercent'
              }
            }
          }
        ]
      }
    ]
  },
  MediaPlayerCard: {
    name: '媒体播放器',
    icon: mdiPlayCircle,
    fields: [
      {
        key: 'mediaPlayers',
        label: '播放器配置',
        type: 'media-players',
        default: []
      }
    ]
  },
  RouterCard: {
    name: '路由监控',
    icon: mdiRouterNetwork,
    fields: [
      {
        key: 'router',
        label: '路由器配置',
        type: 'router-config',
        default: {}
      }
    ]
  },
  NASCard: {
    name: 'NAS监控',
    icon: mdiServerNetwork,
    fields: [
      {
        key: 'syno_nas',
        label: 'NAS配置',
        type: 'nas-config',
        default: {}
      }
    ]
  },
  CameraCard: {
    name: '监控画面',
    icon: mdiCctv,
    fields: [
      {
        key: 'cameras',
        label: '摄像头配置',
        type: 'cameras-config',
        default: []
      }
    ]
  },
  CurtainCard: {
    name: '窗帘控制',
    icon: mdiCurtains,
    fields: [
      {
        key: 'curtains',
        label: '窗帘配置',
        type: 'curtains-config',
        default: []
      }
    ]
  },
  ElectricityCard: {
    name: '电量监控',
    icon: mdiLightningBolt,
    fields: [
      {
        key: 'electricity',
        label: '电量配置',
        type: 'electricity-config',
        default: {}
      }
    ]
  },
  ScriptPanel: {
    name: '快捷指令',
    icon: mdiScriptText,
    fields: [
      {
        key: 'scripts',
        label: '指令配置',
        type: 'scripts-config',
        default: []
      }
    ]
  },
  WaterPurifierCard: {
    name: '净水器',
    icon: mdiWaterPump,
    fields: [
      {
        key: 'waterpuri',
        label: '净水器配置',
        type: 'waterpuri-config',
        default: {}
      }
    ]
  },
  IlluminanceCard: {
    name: '光照传感器',
    icon: mdiWhiteBalanceSunny,
    fields: [
      {
        key: 'sensors',
        label: '光照传感器配置',
        type: 'illuminance-config',
        default: []
      }
    ]
  },
  ClimateCard: {
    name: '空调控制',
    icon: mdiSnowflake,
    fields: [
      {
        key: 'entity_id',
        label: '空调实体',
        type: 'entity',
        filter: 'climate.*'
      },
      {
        key: 'name',
        label: '名称',
        type: 'text'
      },
      {
        key: 'features',
        label: '功能配置',
        type: 'climate-features',
        default: {}
      }
    ]
  },
  MotionCard: {
    name: '人体传感器',
    icon: mdiMotionSensor,
    fields: [
      {
        key: 'title',
        label: '标题',
        type: 'text',
        default: '人体传感器'
      },
      {
        key: 'motion_entity_id',
        label: '人体传感器实体',
        type: 'entity',
        filter: 'event.*'
      },
      {
        key: 'lux_entity_id',
        label: '光照传感器实体',
        type: 'entity',
        filter: 'sensor.*'
      }
    ]
  },
  LightOverviewCard: {
    name: '房间灯光概览',
    icon: mdiHomeFloorG,
    fields: [
      {
        key: 'background',
        label: '背景图片',
        type: 'text',
        default: ''
      },
      {
        key: 'rooms',
        label: '房间灯光配置',
        type: 'light-overview-config',
        default: []
      }
    ]
  }
};

// 清理旧版本，只保留最新的5个版本
const cleanOldVersions = async (client, currentFiles) => {
  try {
    // 按最后修改时间降序排序
    const sortedFiles = currentFiles
      .filter(file => file.basename.startsWith('config-')) // 只处理备份文件，不处理config.json
      .sort((a, b) => new Date(b.lastmod) - new Date(a.lastmod));

    // 如果备份文件超过4个（加上当前要保存的就是5个），删除多余的
    if (sortedFiles.length > 4) {
      for (let i = 4; i < sortedFiles.length; i++) {
        await client.deleteFile('/' + sortedFiles[i].basename);
      }
    }
  } catch (error) {
    console.error('清理旧版本失败:', error);
  }
};

const saveConfigToWebDAV = async (config) => {
  try {
    const webdavConfig = JSON.parse(localStorage.getItem('webdav-config') || '{}');
    if (!webdavConfig.url) {
      throw new Error('WebDAV URL未配置');
    }

    // 创建 WebDAV 客户端
    const client = createClient(webdavConfig.url, {
      username: webdavConfig.username,
      password: webdavConfig.password
    });

    // 获取并解析布局数据
    const mobileLayouts = localStorage.getItem('mobile-dashboard-layouts');
    const desktopLayouts = localStorage.getItem('desktop-dashboard-layouts');
    const mobileDefaultLayouts = localStorage.getItem('mobile-default-dashboard-layouts');
    const desktopDefaultLayouts = localStorage.getItem('desktop-default-dashboard-layouts');
    
    // 处理布局数据，兼容字符串格式
    const layouts = {
      mobile: mobileLayouts ? (typeof mobileLayouts === 'string' ? 
        (mobileLayouts.startsWith('{') ? JSON.parse(mobileLayouts) : mobileLayouts) : 
        mobileLayouts) : {},
      desktop: desktopLayouts ? (typeof desktopLayouts === 'string' ? 
        (desktopLayouts.startsWith('{') ? JSON.parse(desktopLayouts) : desktopLayouts) : 
        desktopLayouts) : {}
    };
      
    const defaultLayouts = {
      mobile: mobileDefaultLayouts ? (typeof mobileDefaultLayouts === 'string' ? 
        (mobileDefaultLayouts.startsWith('{') ? JSON.parse(mobileDefaultLayouts) : mobileDefaultLayouts) : 
        mobileDefaultLayouts) : {},
      desktop: desktopDefaultLayouts ? (typeof desktopDefaultLayouts === 'string' ? 
        (desktopDefaultLayouts.startsWith('{') ? JSON.parse(desktopDefaultLayouts) : desktopDefaultLayouts) : 
        desktopDefaultLayouts) : {}
    };

    const configData = {
      cards: config,
      layouts,
      defaultLayouts,
      timestamp: new Date().toISOString()
    };

    // 获取当前所有文件
    const files = await client.getDirectoryContents('/');

    // 检查原配置文件是否存在
    const exists = await client.exists('/config.json');
    if (exists) {
      // 生成备份文件名
      const now = new Date();
      const backupFileName = `config-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}${now.getSeconds().toString().padStart(2,'0')}.json`;
      
      // 读取原配置并保存为备份
      const oldContent = await client.getFileContents('/config.json', { format: 'text' });
      // 尝试格式化已有的配置
      try {
        const oldConfig = JSON.parse(oldContent);
        await client.putFileContents(
          `/${backupFileName}`,
          JSON.stringify(oldConfig, null, 2),
          { 
            overwrite: true,
            contentLength: true
          }
        );
      } catch {
        // 如果解析失败，保存原始内容
        await client.putFileContents(
          `/${backupFileName}`,
          oldContent,
          { 
            overwrite: true,
            contentLength: true
          }
        );
      }

      // 清理旧版本
      await cleanOldVersions(client, files);
    }

    // 保存新配置（使用2空格缩进格式化）
    await client.putFileContents(
      '/config.json',
      JSON.stringify(configData, null, 2),
      { 
        overwrite: true,
        contentLength: true
      }
    );
    message.success('同步到WebDAV成功');

  } catch (error) {
    console.error('WebDAV保存错误:', error);
    message.error('保存到WebDAV失败: ' + error.message);
    throw error;
  }
};

const loadConfigFromWebDAV = async () => {
  try {
    const webdavConfig = JSON.parse(localStorage.getItem('webdav-config') || '{}');
    if (!webdavConfig.url) {
      throw new Error('WebDAV URL未配置');
    }

    // 创建 WebDAV 客户端
    const client = createClient(webdavConfig.url, {
      username: webdavConfig.username,
      password: webdavConfig.password
    });

    // 使用 webdav 库的 getFileContents 方法
    const exists = await client.exists('/config.json');
    if (!exists) {
      throw new Error('配置文件不存在');
    }

    const content = await client.getFileContents('/config.json', { format: 'text' });
    const configData = JSON.parse(content);

    // 如果配置中包含新的布局格式（移动端和桌面端分离）
    if (configData.layouts && typeof configData.layouts === 'object') {
      if (configData.layouts.mobile) {
        localStorage.setItem('mobile-dashboard-layouts', JSON.stringify(configData.layouts.mobile));
      }
      if (configData.layouts.desktop) {
        localStorage.setItem('desktop-dashboard-layouts', JSON.stringify(configData.layouts.desktop));
      }
    } else if (configData.layouts) {
      // 兼容旧版本：如果是旧版本的布局，则同时设置给移动端和桌面端
      localStorage.setItem('mobile-dashboard-layouts', configData.layouts);
      localStorage.setItem('desktop-dashboard-layouts', configData.layouts);
    }

    // 处理默认布局
    if (configData.defaultLayouts && typeof configData.defaultLayouts === 'object') {
      if (configData.defaultLayouts.mobile) {
        localStorage.setItem('mobile-default-dashboard-layouts', JSON.stringify(configData.defaultLayouts.mobile));
      }
      if (configData.defaultLayouts.desktop) {
        localStorage.setItem('desktop-default-dashboard-layouts', JSON.stringify(configData.defaultLayouts.desktop));
      }
    } else if (configData.defaultLayouts) {
      // 兼容旧版本
      localStorage.setItem('mobile-default-dashboard-layouts', configData.defaultLayouts);
      localStorage.setItem('desktop-default-dashboard-layouts', configData.defaultLayouts);
    }

    return configData;
  } catch (error) {
    console.error('WebDAV加载错误:', error);
    throw error;
  }
};

function ConfigPage() {
  const fileInputRef = useRef(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewConfig, setPreviewConfig] = useState(null);
  const [cards, setCards] = useState(() => {
    const savedConfig = localStorage.getItem('card-config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        return config.map(card => ({
          ...card,
          visible: card.visible !== false // 如果没有visible属性，默认为true
        }));
      } catch (error) {
        console.error('解析配置失败:', error);
        return [];
      }
    }
    return [];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [versionInfo, setVersionInfo] = useState(null);
  const [latestVersion, setLatestVersion] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [webdavConfig, setWebdavConfig] = useState(() => {
    return JSON.parse(localStorage.getItem('webdav-config') || '{}');
  });
  const [showWebDAVModal, setShowWebDAVModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionList, setVersionList] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [form] = Form.useForm();
  
  const handleSave = async () => {
    try {
      // 计算默认布局
      const defaultLayouts = calculateLayouts(cards);
      
      // 分别保存移动端和桌面端的默认布局
      localStorage.setItem('mobile-default-dashboard-layouts', JSON.stringify(defaultLayouts));
      localStorage.setItem('desktop-default-dashboard-layouts', JSON.stringify(defaultLayouts));
      
      // 保存到本地存储
      localStorage.setItem('card-config', JSON.stringify(cards));
      
      // 获取当前已有的移动端和桌面端布局
      const existingMobileLayouts = JSON.parse(localStorage.getItem('mobile-dashboard-layouts') || '{}');
      const existingDesktopLayouts = JSON.parse(localStorage.getItem('desktop-dashboard-layouts') || '{}');
      
      // 只为新添加的卡片计算布局
      const newCards = cards.filter(card => {
        // 检查所有布局中是否存在该卡片的布局
        const inMobileLayouts = !Object.values(existingMobileLayouts).some(layout => 
          Array.isArray(layout) && layout.some(item => item.i === card.id.toString())
        );
        const inDesktopLayouts = !Object.values(existingDesktopLayouts).some(layout => 
          Array.isArray(layout) && layout.some(item => item.i === card.id.toString())
        );
        return inMobileLayouts || inDesktopLayouts;
      });

      if (newCards.length > 0) {
        // 只为新卡片计算布局
        const newLayouts = calculateLayouts(newCards);
        
        // 合并移动端布局
        const mergedMobileLayouts = {
          lg: [...(Array.isArray(existingMobileLayouts.lg) ? existingMobileLayouts.lg : []), ...(newLayouts.lg || [])],
          md: [...(Array.isArray(existingMobileLayouts.md) ? existingMobileLayouts.md : []), ...(newLayouts.md || [])],
          sm: [...(Array.isArray(existingMobileLayouts.sm) ? existingMobileLayouts.sm : []), ...(newLayouts.sm || [])]
        };

        // 合并桌面端布局
        const mergedDesktopLayouts = {
          lg: [...(Array.isArray(existingDesktopLayouts.lg) ? existingDesktopLayouts.lg : []), ...(newLayouts.lg || [])],
          md: [...(Array.isArray(existingDesktopLayouts.md) ? existingDesktopLayouts.md : []), ...(newLayouts.md || [])],
          sm: [...(Array.isArray(existingDesktopLayouts.sm) ? existingDesktopLayouts.sm : []), ...(newLayouts.sm || [])]
        };

        // 移除已删除卡片的布局
        const currentCardIds = cards.map(card => card.id.toString());
        ['lg', 'md', 'sm'].forEach(breakpoint => {
          if (Array.isArray(mergedMobileLayouts[breakpoint])) {
            mergedMobileLayouts[breakpoint] = mergedMobileLayouts[breakpoint].filter(
              item => currentCardIds.includes(item.i)
            );
          }
          if (Array.isArray(mergedDesktopLayouts[breakpoint])) {
            mergedDesktopLayouts[breakpoint] = mergedDesktopLayouts[breakpoint].filter(
              item => currentCardIds.includes(item.i)
            );
          }
        });

        // 保存合并后的布局
        localStorage.setItem('mobile-dashboard-layouts', JSON.stringify(mergedMobileLayouts));
        localStorage.setItem('desktop-dashboard-layouts', JSON.stringify(mergedDesktopLayouts));
      }
      
      // 如果配置了WebDAV，且开启了自动同步，则保存到WebDAV
      if (webdavConfig.url && webdavConfig.autoSync) {
        try {
          await saveConfigToWebDAV(cards);
        } catch (error) {
          message.error('保存到WebDAV失败: ' + error.message);
        }
      }
      
      setHasUnsavedChanges(false);
      message.success('保存成功');
    } catch (error) {
      console.error('保存配置失败:', error);
      message.error('保存配置失败: ' + error.message);
    }
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
      CurtainCard: { lg: 30, md: 30, sm: 30 },
      ElectricityCard: { lg: 24, md: 24, sm: 24 },
      ScriptPanel: { lg: 14, md: 14, sm: 14 },
      WaterPurifierCard: { lg: 24, md: 24, sm: 24 },
      IlluminanceCard: { lg: 16, md: 16, sm: 16 },
      CameraCard: { lg: 20, md: 20, sm: 20 },
      ClimateCard: { lg: 28, md: 28, sm: 28 },
      MotionCard: { lg: 20, md: 20, sm: 20 }
    };

    // 计算每个卡片的位置
    cards.forEach((card, index) => {
      const height = cardHeights[card.type] || { lg: 10, md: 10, sm: 10 };
      
      // 计算每个响应式布局的位置
      Object.keys(layouts).forEach(breakpoint => {
        const { cols } = baseParams[breakpoint];
        const row = Math.floor(index / cols);
        const col = index % cols;
        
        layouts[breakpoint].push({
          'card_type': card.type,
          i: card.id.toString(),
          x: col,
          y: row * height[breakpoint],
          w: baseParams[breakpoint].cardWidth,
          h: height[breakpoint]
        });
      });
    });

    return layouts;
  };

  const handleAddCard = (type) => {
    const defaultConfig = CARD_TYPES[type].fields.reduce((acc, field) => {
      if (field.type === 'sensor-group') {
        acc[field.key] = field.default || [];
      } else if (field.type.endsWith('-config')) {
        acc[field.key] = field.default || {};
      } else {
        acc[field.key] = field.default;
      }
      return acc;
    }, {});

    setCards([...cards, {
      id: Date.now(),
      type,
      config: defaultConfig,
      visible: true // 新添加的卡片默认可见
    }]);
    
    setHasUnsavedChanges(true);
    setShowAddModal(false);
  };

  const handleDeleteCard = (cardId) => {
    setCards(cards.filter(card => card.id !== cardId));
    setHasUnsavedChanges(true);
  };

  const handleConfigChange = (cardId, key, value) => {
    setCards(cards.map(card => {
      if (card.id === cardId) {
        const newConfig = {...card.config, [key]: value};
        // 如果是 LightOverviewCard，更新预览配置
        if (card.type === 'LightOverviewCard') {
          setPreviewConfig(newConfig);
        }
        return {...card, config: newConfig};
      }
      return card;
    }));
    setHasUnsavedChanges(true);
  };

  // 导出配置
  const handleExport = () => {
    const config = {
      cards,
      layouts: {
        mobile: JSON.parse(localStorage.getItem('mobile-dashboard-layouts') || '{}'),
        desktop: JSON.parse(localStorage.getItem('desktop-dashboard-layouts') || '{}')
      },
      defaultLayouts: {
        mobile: JSON.parse(localStorage.getItem('mobile-default-dashboard-layouts') || '{}'),
        desktop: JSON.parse(localStorage.getItem('desktop-default-dashboard-layouts') || '{}')
      }
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hass-panel-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 修改导入配置的处理函数
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target.result);
          
          // 更新卡片配置
          setCards(config.cards.map(card => ({
            ...card,
            visible: card.visible !== false // 确保所有卡片都有visible属性
          })));
          
          // 更新布局配置
          if (config.layouts) {
            // 分别保存移动端和桌面端布局
            localStorage.setItem('mobile-dashboard-layouts', config.layouts);
            localStorage.setItem('desktop-dashboard-layouts', config.layouts);
          }
          if (config.defaultLayouts) {
            // 分别保存移动端和桌面端默认布局
            localStorage.setItem('mobile-default-dashboard-layouts', config.defaultLayouts);
            localStorage.setItem('desktop-default-dashboard-layouts', config.defaultLayouts);
          }
          
          setHasUnsavedChanges(true);
        } catch (error) {
          console.error('解析配置文件失败:', error);
          message.error('配置文件格式错误，请检查文件内容');
        }
      };
      reader.readAsText(file);
    }
  };

  // 添加获取版本信息的函数
  React.useEffect(() => {
    fetch('./version.json')
      .then(response => response.json())
      .then(data => {
        setVersionInfo(data);
      })
      .catch(error => {
        console.error('获取版本信息失败:', error);
      });
  }, []);

  // 添加从WebDAV加载配置的函数
  const handleLoadFromWebDAV = async () => {
    try {
      const configData = await loadConfigFromWebDAV();
      
      // 更新卡片配置
      setCards(configData.cards.map(card => ({
        ...card,
        visible: card.visible !== false
      })));
      
      // 更新布局配置
      if (configData.layouts) {
        localStorage.setItem('dashboard-layouts', configData.layouts);
      }
      if (configData.defaultLayouts) {
        localStorage.setItem('default-dashboard-layouts', configData.defaultLayouts);
      }
      
      setHasUnsavedChanges(true);
      message.success('从WebDAV加载配置成功');
    } catch (error) {
      message.error('从WebDAV加载配置失败: ' + error.message);
    }
  };

  // 添加处理WebDAV表单提交的函数
  const handleWebDAVSubmit = (values) => {
    setWebdavConfig(values);
    localStorage.setItem('webdav-config', JSON.stringify(values));
    setShowWebDAVModal(false);
  };

  // 当模态框打开时，设置表单初始值
  React.useEffect(() => {
    if (showWebDAVModal) {
      // 获取当前浏览器地址
      const currentUrl = window.location.origin;
      const defaultWebdavUrl = currentUrl.replace(/:\d+$/, ':5124');  // 替换端口为5124
      
      // 如果没有配置过WebDAV URL和用户名，则使用默认值
      const initialValues = {
        ...webdavConfig,
        url: webdavConfig.url || defaultWebdavUrl,
        username: webdavConfig.username || 'admin'
      };
      
      form.setFieldsValue(initialValues);
    }
  }, [showWebDAVModal, form, webdavConfig]);

  // 获取版本列表
  const fetchVersionList = async () => {
    try {
      setLoadingVersions(true);
      const webdavConfig = JSON.parse(localStorage.getItem('webdav-config') || '{}');
      if (!webdavConfig.url) {
        throw new Error('WebDAV URL未配置');
      }

      const client = createClient(webdavConfig.url, {
        username: webdavConfig.username,
        password: webdavConfig.password
      });

      // 获取目录下所有文件
      const files = await client.getDirectoryContents('/');
      
      // 过滤出配置文件并处理数据
      const configFiles = files
        .filter(file => file.basename.startsWith('config'))
        .sort((a, b) => new Date(b.lastmod) - new Date(a.lastmod))
        .slice(0, 5) // 只显示最新的5个版本
        .map(file => {
          // 解析时间
          const lastmod = new Date(file.lastmod);
          return {
            filename: file.basename,  // 使用basename作为文件名
            lastmod: lastmod.toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            }),
            basename: file.basename,
            size: (file.size / 1024).toFixed(2) + ' KB'  // 转换为KB并保留2位小数
          };
        });

      setVersionList(configFiles);
    } catch (error) {
      console.error('获取版本列表失败:', error);
      message.error('获取版本列表失败: ' + error.message);
    } finally {
      setLoadingVersions(false);
    }
  };

  // 恢复指定版本
  const restoreVersion = async (filename) => {
    try {
      const webdavConfig = JSON.parse(localStorage.getItem('webdav-config') || '{}');
      if (!webdavConfig.url) {
        throw new Error('WebDAV URL未配置');
      }

      const client = createClient(webdavConfig.url, {
        username: webdavConfig.username,
        password: webdavConfig.password
      });

      const content = await client.getFileContents('/' + filename, { format: 'text' });
      const configData = JSON.parse(content);

      // 更新卡片配置
      setCards(configData.cards.map(card => ({
        ...card,
        visible: card.visible !== false
      })));
      
      // 更新布局配置
      if (configData.layouts) {
        localStorage.setItem('dashboard-layouts', JSON.stringify(configData.layouts));
      }
      if (configData.defaultLayouts) {
        localStorage.setItem('default-dashboard-layouts', JSON.stringify(configData.defaultLayouts));
      }
      
      setHasUnsavedChanges(true);
      message.success('恢复配置成功');
      setShowVersionModal(false);
    } catch (error) {
      console.error('恢复配置失败:', error);
      message.error('恢复配置失败: ' + error.message);
    }
  };

  // 删除指定版本
  const deleteVersion = async (filename) => {
    try {
      const webdavConfig = JSON.parse(localStorage.getItem('webdav-config') || '{}');
      if (!webdavConfig.url) {
        throw new Error('WebDAV URL未配置');
      }

      const client = createClient(webdavConfig.url, {
        username: webdavConfig.username,
        password: webdavConfig.password
      });

      // 不允许删除当前使用的配置文件
      if (filename === 'config.json') {
        throw new Error('不能删除当前使用的配置文件');
      }

      await client.deleteFile('/' + filename);
      message.success('删除版本成功');
      // 刷新版本列表
      fetchVersionList();
    } catch (error) {
      console.error('删除版本失败:', error);
      message.error('删除版本失败: ' + error.message);
    }
  };

  // 配置导入导出菜单项
  const configMenuItems = [
    {
      key: 'import',
      label: '导入配置',
      icon: <Icon path={mdiImport} size={0.8} />,
      onClick: () => fileInputRef.current.click()
    },
    {
      key: 'export',
      label: '导出配置',
      icon: <Icon path={mdiExport} size={0.8} />,
      onClick: handleExport
    }
  ];

  // WebDAV同步菜单项
  const webdavMenuItems = webdavConfig.url ? [
    {
      key: 'config',
      label: 'WebDAV配置',
      icon: <Icon path={mdiServerNetwork} size={0.8} />,
      onClick: () => setShowWebDAVModal(true)
    },
    {
      type: 'divider'
    },
    {
      key: 'push',
      label: '同步到WebDAV',
      icon: <Icon path={mdiExport} size={0.8} />,
      onClick: () => saveConfigToWebDAV(cards)
    },
    {
      key: 'pull',
      label: '从WebDAV同步',
      icon: <Icon path={mdiImport} size={0.8} />,
      onClick: () => handleLoadFromWebDAV()
    },
    {
      key: 'versions',
      label: '版本列表',
      icon: <Icon path={mdiFileFind} size={0.8} />,
      onClick: () => {
        fetchVersionList();
        setShowVersionModal(true);
      }
    }
  ] : [
    {
      key: 'config',
      label: 'WebDAV配置',
      icon: <Icon path={mdiServerNetwork} size={0.8} />,
      onClick: () => setShowWebDAVModal(true)
    }
  ];

  // 添加执行更新的函数
  const handleUpdate = async () => {
    try {
      message.loading({ content: '正在检查更新...', key: 'update' });
      const response = await fetch('./api/update');
      const result = await response.json();
      
      if (result.status === 'success') {
        message.success({ 
          content: result.message, 
          key: 'update',
          duration: 5 
        });
        // 如果更新成功，3秒后刷新页面
        if (result.message.includes('更新成功')) {
          setTimeout(() => {
            message.loading({ 
              content: '更新完成，正在刷新页面...', 
              key: 'update' 
            });
            window.location.reload();
          }, 3000);
        }
      } else {
        message.error({ 
          content: `更新失败：${result.message}`, 
          key: 'update',
          duration: 5 
        });
      }
    } catch (error) {
      message.error({ 
        content: `更新失败：${error.message}`, 
        key: 'update',
        duration: 5 
      });
    }
  };

  // 修改检查更新的函数
  const checkUpdate = async () => {
    try {
      setIsChecking(true);
      const response = await fetch('https://api.github.com/repos/mrtian2016/hass-panel/releases/latest');
      const data = await response.json();
      if (data && data.tag_name) {
        setLatestVersion({
          version: data.tag_name,
          updateTime: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('检查更新失败:', error);
      message.error('检查更新失败');
    } finally {
      setIsChecking(false);
    }
  };

  // 添加自动检查更新
  React.useEffect(() => {
    checkUpdate();
    // 每5分钟检查一次更新
    const timer = setInterval(checkUpdate, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="config-page">
      <div className="config-header">
        <Space className="header-buttons">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            style={{ display: 'none' }}
          />
          
          {/* 配置导入导出下拉菜单 */}
          <Dropdown menu={{ items: configMenuItems }} placement="bottomLeft">
            <Button>
              配置管理
              <Icon path={mdiImport} size={0.8} style={{ marginLeft: 8 }} />
            </Button>
          </Dropdown>

         

          {/* WebDAV相关操作下拉菜单 */}
          <Dropdown menu={{ items: webdavMenuItems }} placement="bottomLeft">
            <Button>
              WebDAV
              <Icon path={mdiServerNetwork} size={0.8} style={{ marginLeft: 8 }} />
            </Button>
          </Dropdown>
        </Space>
      </div>
      
      <div className="config-list">
        {cards.map(card => (
          <div key={card.id} className="config-item">
            <div className="item-header">
              <div className="item-title">
                <Icon path={CARD_TYPES[card.type].icon} size={1} />
                <span>{CARD_TYPES[card.type].name}</span>
              </div>
              <div className="item-actions">
                {card.type === 'LightOverviewCard' && (
                  <button 
                    className="preview-button"
                    onClick={() => {
                      setPreviewConfig(card.config);
                      setShowPreview(true);
                    }}
                    title="预览效果"
                  >
                    <Icon path={mdiFileFind} size={1} />
                    
                  </button>
                )}
                <button 
                  className={`visibility-toggle `}
                  onClick={() => handleVisibilityChange(card.id)}
                  title={card.visible === false ? '显示卡片' : '隐藏卡片'}
                >
                  <Icon path={card.visible === false ? mdiEye : mdiEyeOff} size={1} />
                  
                </button>
                <button 
                  className="delete-button"
                  onClick={() => handleDeleteCard(card.id)}
                >
                  <Icon path={mdiDelete} size={1} />
                </button>
              </div>
            </div>
            <div className="item-content">
              {CARD_TYPES[card.type].fields.map(field => (
                <ConfigField
                  key={field.key}
                  field={field}
                  value={card.config[field.key]}
                  onChange={(value) => handleConfigChange(card.id, field.key, value)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <AddCardModal
          onClose={() => setShowAddModal(false)}
          onSelect={handleAddCard}
          cardTypes={CARD_TYPES}
        />
      )}

      {previewConfig && (
        <div className={`preview-container ${showPreview ? 'visible' : ''}`}>
          <button 
            className="close-preview" 
            onClick={() => setShowPreview(false)}
          >
            <Icon path={mdiClose} size={1} />
          </button>
          <LightOverviewCard 
            key={JSON.stringify(previewConfig)} 
            config={previewConfig} 
          />
        </div>
      )}

      {/* 修改 WebDAV 配置模态框 */}
      <Modal
        title="WebDAV 配置"
        open={showWebDAVModal}
        onCancel={() => setShowWebDAVModal(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleWebDAVSubmit}
          initialValues={webdavConfig}
        >
          <Form.Item
            label="WebDAV URL"
            name="url"
            rules={[{ required: true, message: '请输入WebDAV URL' }]}
          >
            <Input placeholder="请输入WebDAV服务器地址" />
          </Form.Item>

          <Form.Item
            label="用户名"
            name="username"
          >
            <Input placeholder="请输入用户名（可选）" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
          >
            <Input.Password placeholder="请输入密码（可选）" />
          </Form.Item>

          <Form.Item
            name="autoSync"
            valuePropName="checked"
          >
            <Checkbox>自动同步到WebDAV</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              保存
            </Button>
            <Button onClick={() => setShowWebDAVModal(false)}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 保存按钮 */}
      <button
      className={`save-button ${hasUnsavedChanges ? 'has-changes' : ''}`}
          onClick={handleSave}
          
        >
          <Icon path={mdiCheck} size={2} />
        </button>

        {/* 添加卡片按钮 */}
        <button
        className="add-card-button"
          onClick={() => setShowAddModal(true)}
        >
          <Icon path={mdiPlus} size={3} />
        </button>
        {versionInfo && (
          <div className="version-info">
            <Icon path={mdiInformationOutline} size={0.8} />
            <span>
              当前版本: {versionInfo.version}
              {latestVersion && latestVersion.version !== versionInfo.version && (
                <Tooltip title={`发现新版本，点击更新到 ${latestVersion.version}`}>
                  <Button 
                    type="link" 
                    size="small" 
                    loading={isChecking}
                    onClick={handleUpdate}
                    style={{ marginLeft: 8, padding: '0 4px' }}
                  >
                    检查更新
                  </Button>
                </Tooltip>
              )}
            </span>
          </div>
        )}

      {/* 版本列表模态框 */}
      <Modal
        title="配置版本列表"
        open={showVersionModal}
        onCancel={() => setShowVersionModal(false)}
        footer={null}
        width={600}
      >
        <div className="version-list">
          {loadingVersions ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              加载中...
            </div>
          ) : (
            <List
              dataSource={versionList}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Space>
                      <Button 
                        type="link" 
                        onClick={() => restoreVersion(item.filename)}
                      >
                        恢复此版本
                      </Button>
                      {item.filename !== 'config.json' && (
                        <Button 
                          type="link" 
                          danger
                          onClick={() => {
                            Modal.confirm({
                              title: '确认删除',
                              content: `确定要删除版本 ${item.basename} 吗？此操作不可恢复。`,
                              okText: '确认',
                              cancelText: '取消',
                              onOk: () => deleteVersion(item.filename)
                            });
                          }}
                        >
                          删除
                        </Button>
                      )}
                    </Space>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <span>{item.basename}</span>
                        <span style={{ color: '#999', fontSize: '12px' }}>({item.size})</span>
                      </Space>
                    }
                    description={`最后修改时间: ${item.lastmod}`}
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}

export default ConfigPage; 