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