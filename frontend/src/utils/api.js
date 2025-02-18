import { debounce, throttle } from './throttleDebounce';

// 通用请求函数
const request = async (endpoint, options = {}) => {
  const localToken = localStorage.getItem('hass_panel_token');
  const token = JSON.parse(localToken);
  const accessToken = token.access_token;
  if (!accessToken) {
    throw new Error('未找到认证token');
  }

  const response = await fetch(`./api${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '请求失败');
  }

  const data = await response.json();
  return data;
};

// 创建防抖和节流的请求函数
const debouncedRequest = debounce(async (endpoint, options = {}) => {
  return await request(endpoint, options);
}, 100);

const throttledRequest = throttle(async (endpoint, options = {}) => {
  return await request(endpoint, options);
}, 100);

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
  // 获取最新配置 (使用节流，因为是读取操作)
  getConfig: async () => {
    try {
      const response = await throttledRequest('/user_config/config');
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

  // 保存配置 (使用防抖，因为是写入操作)
  saveConfig: async (config, showMessage = true) => {
    try {
      const response = await debouncedRequest('/user_config/config', {
        method: 'POST',
        body: JSON.stringify(config),
      });
      
      // 保存配置时自动应用背景设置
      if (config.globalConfig) {
        applyBackgroundToBody(config.globalConfig);
      }
      
     
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取版本列表 (使用节流)
  getVersions: async () => {
    try {
      const response = await throttledRequest('/user_config/versions');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 获取指定版本 (使用节流)
  getVersion: async (filename) => {
    try {
      const response = await throttledRequest(`/user_config/versions/${filename}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 删除指定版本 (使用防抖)
  deleteVersion: async (filename) => {
    try {
      const response = await debouncedRequest(`/user_config/versions/${filename}`, {
        method: 'DELETE',
      }); 
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 上传图片
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('./api/common/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('hass_panel_token'))?.access_token}`,
        },
        body: formData
      });

      const result = await response.json();
      if (result.code === 200) {
        return {
          url: result.data.file_path,
          file_path: result.data.file_path
        };
      } else {
        throw new Error(result.message || '上传失败');
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
      const config = await configApi.getConfig();
      
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
      const config = await configApi.getConfig();
      
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
      const config = await configApi.getConfig();
      
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
      const accessToken = window.env?.REACT_APP_HASS_TOKEN || JSON.parse(localStorage.getItem('hassTokens'))?.access_token;
      const response = await fetch('./go2rtc/api/onvif', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });
      if (!response.ok) {
        throw new Error('请求失败');
      }
      const data = await response.json();
      
      // 过滤只保留IPv4地址的源
      const filteredSources = data.sources.map(source => ({
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
      const response = await request('/update');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 上传更新包
  uploadPackage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('package', file);
      
      const accessToken = window.env?.REACT_APP_HASS_TOKEN || JSON.parse(localStorage.getItem('hassTokens'))?.access_token;
      
      const response = await fetch('./api/upload-update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData
      });

      const result = await response.json();
      console.log(result)
      if (result.code === 200) {
        return result;
      } else {
        throw new Error(result.message || '上传失败');
      }
    } catch (error) {
      throw error;
    }
  },

  // 应用手动更新
  applyManualUpdate: async (packageInfo) => {
    try {
      const response = await request('/manual-update', {
        method: 'POST',
        body: JSON.stringify(packageInfo),
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 获取当前版本信息
  getCurrentVersion: async () => {
    try {
      const response = await fetch('./version.json');
      return await response.json();
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
      const response = await fetch('./api/common/init_info');
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  // 获取HASS配置
  getHassConfig: async () => {
    const token = localStorage.getItem('hass_panel_token');
    if (!token) {
      throw new Error('未找到认证token');
    }

    try {
      const response = await fetch('./api/user_config/hass_config', {
        headers: {
          'Authorization': `Bearer ${JSON.parse(token).access_token}`
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
}; 