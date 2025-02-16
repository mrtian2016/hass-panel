

// 添加版本号比较函数
export const compareVersions = (v1, v2) => {
    // 移除版本号中的 'v' 前缀
    const version1 = v1.replace('v', '').split('.');
    const version2 = v2.replace('v', '').split('.');
    
    // 比较每个版本号部分
    for (let i = 0; i < Math.max(version1.length, version2.length); i++) {
      const num1 = parseInt(version1[i] || 0);
      const num2 = parseInt(version2[i] || 0);
      
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    
    return 0;
  };

// 安全地解析数值，如果解析失败返回默认值
export const safeParseFloat = (value, defaultValue = 0) => {
  if (!value || value === 'unavailable' || value === 'unknown') return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

  // 安全地获取状态值，处理 null 和异常情况
export const safeGetState = (entity, defaultValue = '0') => {
  if (!entity || entity.state === 'unavailable' || entity.state === 'unknown') {
    return defaultValue;
  }
  return entity.state;
};