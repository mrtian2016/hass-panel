import { defaultConfig } from './defaultConfig';

// 从外部JSON文件加载用户配置
async function loadUserConfig() {
  try {
    const response = await fetch('./config/userConfig.json');
    if (!response.ok) {
      console.log('未找到用户配置文件，使用默认配置');
      return {};
    }
    return await response.json();
  } catch (e) {
    console.log('加载用户配置失败，使用默认配置', e);
    return {};
  }
}

// 导出配置加载函数
export async function loadConfig() {
  const userConfig = await loadUserConfig();
  return userConfig
}

// 初始配置使用默认值
export let entityConfig = null;

// 初始化配置
loadConfig().then(config => {
  entityConfig = config;
});

// 导出配置验证函数
// export const validateConfig = (config) => {
  // TODO: 添加配置验证逻辑
//   return true;
// }; 