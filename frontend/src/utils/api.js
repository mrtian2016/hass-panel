import { message } from 'antd';
import { debounce, throttle } from './throttleDebounce';

// 通用请求函数
const request = async (endpoint, options = {}) => {
  const localToken = localStorage.getItem('hassTokens');
  const token = JSON.parse(localToken);
  const accessToken = token.access_token;
  if (!accessToken) {
    throw new Error('未找到认证token');
  }

  const response = await fetch(`/api${endpoint}`, {
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
}, 200);

const throttledRequest = throttle(async (endpoint, options = {}) => {
  return await request(endpoint, options);
}, 200);

// 配置相关API
export const configApi = {
  // 获取最新配置 (使用节流，因为是读取操作)
  getConfig: async () => {
    try {
      const response = await throttledRequest('/user_config/config');
      return response.data;
    } catch (error) {
    //   message.error('加载配置失败: ' + error.message);
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
      if (showMessage) {
        message.success('保存成功');
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
    //   message.error('获取版本列表失败: ' + error.message);
      throw error;
    }
  },

  // 获取指定版本 (使用节流)
  getVersion: async (filename) => {
    try {
      const response = await throttledRequest(`/user_config/versions/${filename}`);
      return response.data;
    } catch (error) {
    //   message.error('获取版本失败: ' + error.message);
      throw error;
    }
  },

  // 删除指定版本 (使用防抖)
  deleteVersion: async (filename) => {
    try {
      const response = await debouncedRequest(`/user_config/versions/${filename}`, {
        method: 'DELETE',
      });
      message.success('删除成功');
      return response;
    } catch (error) {
    //   message.error('删除失败: ' + error.message);
      throw error;
    }
  },
}; 