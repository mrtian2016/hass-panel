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
      window.location.href = '/login';
      return Promise.reject(new Error('登录已过期，请重新登录'));
    }
    return Promise.reject(error);
  }
);


// 应用背景设置到body
const applyBackgroundToBody = (globalConfig) => {
  if (!globalConfig) return;

  // 设置背景颜色
  if (globalConfig.backgroundColor) {
    document.body.style.backgroundColor = globalConfig.backgroundColor;
  } else {
    document.body.style.backgroundColor = '';
  }

  // 设置背景图片
  if (globalConfig.backgroundImage) {
    document.body.style.backgroundImage = `url(${globalConfig.backgroundImage})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
  } else {
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundPosition = '';
    document.body.style.backgroundAttachment = '';
  }
};

// 配置相关API
export const configApi = {
  // 获取最新配置
  getConfig: async () => {
    try {
      const response = await axiosInstance.get('/user_config/config');
      const config = response.data;
      // 获取配置时自动应用背景设置
      if (config.globalConfig) {
        applyBackgroundToBody(config.globalConfig);
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
      const response = await axios.get('/version.json');
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

