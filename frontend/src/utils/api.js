import axios from 'axios';

// 创建不需要认证的axios实例
const publicAxiosInstance = axios.create({
  baseURL: './api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 创建需要认证的axios实例
const axiosInstance = axios.create({
  baseURL: './api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器
axiosInstance.interceptors.request.use((config) => {
  const localToken = localStorage.getItem('hass_panel_token');
  const token = JSON.parse(localToken);
  const accessToken = token?.access_token;
  
  if (!accessToken) {
    window.location.href = './#/login';
    throw new Error('未找到认证token');
  }
  
  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// 添加响应拦截器
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 清除本地token
      localStorage.removeItem('hass_panel_token');
      // 跳转到登录页面
      window.location.href = './#/login';
      return Promise.reject(new Error('登录已过期，请重新登录'));
    }
    return Promise.reject(error);
  }
);


// 应用背景设置到body
export const applyBackgroundToBody = (globalConfig) => {
  if (!globalConfig) return;

  // 检测当前主题模式 - 只检查应用内部的主题标记，不考虑系统偏好
  const isDarkMode = document.documentElement.classList.contains('dark') || 
                     document.documentElement.getAttribute('data-theme') === 'dark';

  // 设置背景颜色
  if (globalConfig.backgroundColor) {
    document.body.style.backgroundColor = globalConfig.backgroundColor;
  } else {
    document.body.style.backgroundColor = '';
  }

  // 根据主题模式选择背景图片
  let backgroundImage = '';
  if (isDarkMode && globalConfig.darkModeBackgroundImage) {
    backgroundImage = globalConfig.darkModeBackgroundImage;
  } else if (globalConfig.backgroundImage) {
    backgroundImage = globalConfig.backgroundImage;
  }

  // 设置背景图片
  if (backgroundImage) {
    document.body.style.backgroundImage = `url(${backgroundImage})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
  } else {
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundPosition = '';
    document.body.style.backgroundAttachment = '';
  }
  
  // 添加主题变化监听器
  if (!window.themeChangeListenerAdded) {
    window.themeChangeListenerAdded = true;
    
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      applyBackgroundToBody(globalConfig);
    });
    
    // 监听HTML类变化以检测主题切换
    const observer = new MutationObserver(() => {
      applyBackgroundToBody(globalConfig);
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });
    
    // 监听自定义主题变化事件
    document.addEventListener('themeChange', () => {
      applyBackgroundToBody(globalConfig);
    });
  }
};

// 配置相关API
export const configApi = {
  // 获取最新配置
  getConfig: async () => {
    try {
      const response = await axiosInstance.get('/user_config/config');
      const config = response.data;
      
      // 保存全局配置到window对象，以便在主题切换时使用
      if (config.data.globalConfig) {
        window.globalConfigCache = config.data.globalConfig;
        applyBackgroundToBody(config.data.globalConfig);
      }
      
      return config;
    } catch (error) {
      throw error;
    }
  },

  // 保存配置
  saveConfig: async (config) => {
    try {
      const response = await axiosInstance.post('/user_config/config', config);
      
      // 保存配置时自动应用背景设置
      if (config.globalConfig) {
        applyBackgroundToBody(config.globalConfig);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 获取版本列表
  getVersions: async () => {
    try {
      const response = await axiosInstance.get('/user_config/versions');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 获取指定版本
  getVersion: async (filename) => {
    try {
      const response = await axiosInstance.get(`/user_config/versions/${filename}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 删除指定版本
  deleteVersion: async (filename) => {
    try {
      const response = await axiosInstance.delete(`/user_config/versions/${filename}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 上传图片
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axiosInstance.post('/common/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.code === 200) {
        return {
          url: response.data.data.file_path,
          file_path: response.data.data.file_path
        };
      } else {
        throw new Error(response.data.message || '上传失败');
      }
    } catch (error) {
      throw error;
    }
  },

  // 上传背景图
  uploadBackground: async (file) => {
    try {
      // 先上传图片
      const uploadResult = await configApi.uploadImage(file);
 
      // 获取当前配置
      const response = await configApi.getConfig();
      if (response.code !== 200) {
        throw new Error('获取配置失败');
      }
      const config = response.data;

      
      // 更新全局配置中的背景图
      const updatedConfig = {
        ...config,
        globalConfig: {
          ...(config.globalConfig || {}),
          backgroundImage: uploadResult.file_path
        }
      };
      
      // 保存更新后的配置
      await configApi.saveConfig(updatedConfig);
      
      // 应用背景设置到body
      applyBackgroundToBody(updatedConfig.globalConfig);
      
      return uploadResult.file_path;
    } catch (error) {
      throw error;
    }
  },

  // 设置背景配置
  setGlobalConfig: async (globalConfig) => {
    try {
      // 获取当前配置
      const response = await configApi.getConfig();
      const config = response.data;
      
      // 更新全局配置
      const updatedConfig = {
        ...config,
        globalConfig: {
          ...(config.globalConfig || {}),
          ...globalConfig
        }
      };
      
      // 保存更新后的配置
      await configApi.saveConfig(updatedConfig);
      
      // 应用背景设置到body
      applyBackgroundToBody(updatedConfig.globalConfig);
      
      return updatedConfig.globalConfig;
    } catch (error) {
      throw error;
    }
  },

  // 重置背景设置
  resetBackground: async () => {
    try {
      // 获取当前配置
      const response = await configApi.getConfig();
      const config = response.data;
      
      // 移除背景相关的配置
      const updatedConfig = {
        ...config,
        globalConfig: {
          ...(config.globalConfig || {}),
          backgroundImage: '',  // 清除背景图
          darkModeBackgroundImage: '', // 清除暗色模式背景图
          backgroundColor: ''   // 清除背景色
        }
      };
      
      // 保存更新后的配置
      await configApi.saveConfig(updatedConfig);
      
      // 重置body样式
      document.body.style.backgroundImage = 'none';
      document.body.style.backgroundColor = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundAttachment = '';
      
      return updatedConfig.globalConfig;
    } catch (error) {
      throw error;
    }
  }
};

// 摄像头相关API
export const cameraApi = {
  // 获取ONVIF摄像头源
  getOnvifSources: async () => {
    try {
      const response = await axios.get('./go2rtc/api/onvif');
      
      // 过滤只保留IPv4地址的源
      const filteredSources = response.data.sources.map(source => ({
        ...source,
        url: source.url.split('%20')[0]  // 只保留第一个URL（IPv4）
      }));
      
      return filteredSources;
    } catch (error) {
      throw error;
    }
  },
  
  // 获取预设位置
  getPresets: async (entityId, stream_url) => {
    try {
      const params = new URLSearchParams();
      if (stream_url) {
        params.append('stream_url', stream_url);
      }
      
      const url = `/onvif/presets/${entityId}${params.toString() ? '?' + params.toString() : ''}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to get presets:', error);
      throw error;
    }
  },
  
  // PTZ控制
  ptzControl: async (ptzData) => {
    try {
      const response = await axiosInstance.post('/onvif/ptz', ptzData);
      return response.data;
    } catch (error) {
      console.error('Failed to control PTZ:', error);
      throw error;
    }
  },
  
  // 移动到预设位置
  gotoPreset: async (entityId, presetToken, speed = 0.5, stream_url) => {
    try {
      const params = new URLSearchParams();
      params.append('speed', speed);
      if (stream_url) {
        params.append('stream_url', stream_url);
      }
      
      const url = `/onvif/preset/${entityId}/${presetToken}?${params.toString()}`;
      const response = await axiosInstance.post(url);
      return response.data;
    } catch (error) {
      console.error('Failed to goto preset:', error);
      throw error;
    }
  },
  
  // 设置预设位置
  setPreset: async (entityId, presetName, stream_url) => {
    try {
      const params = new URLSearchParams();
      if (stream_url) {
        params.append('stream_url', stream_url);
      }
      
      const url = `/onvif/preset/set/${entityId}/${presetName}${params.toString() ? '?' + params.toString() : ''}`;
      const response = await axiosInstance.post(url);
      return response.data;
    } catch (error) {
      console.error('Failed to set preset:', error);
      throw error;
    }
  },
  
  // 删除预设位置
  removePreset: async (entityId, presetToken, stream_url) => {
    try {
      const params = new URLSearchParams();
      if (stream_url) {
        params.append('stream_url', stream_url);
      }
      
      const url = `/onvif/preset/${entityId}/${presetToken}${params.toString() ? '?' + params.toString() : ''}`;
      const response = await axiosInstance.delete(url);
      return response.data;
    } catch (error) {
      console.error('Failed to remove preset:', error);
      throw error;
    }
  },
  
  // 获取摄像头信息
  getCameraInfo: async (entityId, stream_url) => {
    try {
      const params = new URLSearchParams();
      if (stream_url) {
        params.append('stream_url', stream_url);
      }
      
      const url = `/onvif/info/${entityId}${params.toString() ? '?' + params.toString() : ''}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to get camera info:', error);
      throw error;
    }
  },
  
  // 重启摄像头
  rebootCamera: async (entityId, stream_url) => {
    try {
      const params = new URLSearchParams();
      if (stream_url) {
        params.append('stream_url', stream_url);
      }
      
      const url = `/onvif/reboot/${entityId}${params.toString() ? '?' + params.toString() : ''}`;
      const response = await axiosInstance.post(url);
      return response.data;
    } catch (error) {
      console.error('Failed to reboot camera:', error);
      throw error;
    }
  }
};

// 更新相关API
export const updateApi = {
  // 检查更新
  checkUpdate: async () => {
    try {
      const response = await axiosInstance.get('/version');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // 确认更新
  confirmUpdate: async () => {
    try {
      const response = await axiosInstance.get('/update');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 上传更新包
  uploadPackage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('package', file);
      
      const response = await axiosInstance.post('/upload-update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.code === 200) {
        return response.data;
      } else {
        throw new Error(response.data.message || '上传失败');
      }
    } catch (error) {
      throw error;
    }
  },

  // 应用手动更新
  applyManualUpdate: async (packageInfo) => {
    try {
      const response = await axiosInstance.post('/manual-update', packageInfo);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 获取当前版本信息
  getCurrentVersion: async () => {
    try {
      const response = await axios.get('./version.json');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// 系统相关API
export const systemApi = {
  // 检查系统初始化状态
  checkInitStatus: async () => {
    try {
      const response = await publicAxiosInstance.get('/common/init_info');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 获取HASS配置
  getHassConfig: async () => {
    try {
      const response = await axiosInstance.get('/user_config/hass_config');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // 更新HASS配置
  updateHassConfig: async (config) => {
    try {
      const response = await axiosInstance.put('/user_config/hass_config', config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // 重新初始化
  reinitialize: async () => {
    try {
      const response = await axiosInstance.post('/common/reinitialize');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // 下载日志
  downloadLog: async (config = {}) => {
    try {
      const response = await axiosInstance.get('/common/download_log', {
        ...config,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 

export const hassApi = {
  // 获取用电量统计数据
  getEnergyStatistics: async (entityId) => {
    try { 
      const response = await axiosInstance.get(`/hass/energy/statistics/${entityId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // 获取今日用电量数据
  getTodayConsumption: async (entityId) => {
    try {
      const response = await axiosInstance.get(`/hass/energy/today/${entityId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // 获取每日用电量数据
  getDailyConsumption: async (entityId, days) => {
    try {
      const response = await axiosInstance.get(`/hass/energy/daily/${entityId}?days=${days}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  } 
};

