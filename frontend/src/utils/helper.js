import { listIcons } from '@iconify/react';

import md5 from 'crypto-js/md5';

export const hashPassword = (password) => {
  return md5(password).toString();
}; 

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

export const getMdiIcons = (type='light') => {
  const allIcons = listIcons();
  console.log(allIcons);
  // 预定义常用的 MDI 图标
  let icons = [];
  if (type === 'light') {
    icons = [
      // 天花灯具
      'mdi:ceiling-light',
      'mdi:light-flood-down',
      'mdi:light-recessed',
      'mdi:chandelier',
      'mdi:track-light',
      // 壁灯
      'mdi:wall-sconce',
      'mdi:wall-sconce-flat',
      'mdi:wall-sconce-round',
      'mdi:coach-lamp',
      // 台灯/落地灯
      'mdi:desk-lamp',
      'mdi:floor-lamp',
      'mdi:floor-lamp-dual',
      'mdi:floor-lamp-torchiere',
      'mdi:lamp',
      'mdi:lamp-outline',
      // 装饰灯具
      'mdi:led-strip',
      'mdi:led-strip-variant',
      'mdi:string-lights',
      'mdi:lava-lamp',
      'mdi:vanity-light',
      // 室外灯具
      'mdi:outdoor-lamp',
      'mdi:post-lamp',
      'mdi:spotlight',
      'mdi:spotlight-beam',
      // 灯泡
      'mdi:lightbulb',
      'mdi:lightbulb-outline',
      'mdi:lightbulb-on',
      'mdi:lightbulb-off',
      'mdi:lightbulb-group',
      'mdi:lightbulb-multiple',
      'mdi:lightbulb-spot',
      'mdi:lightbulb-fluorescent-tube',
      'mdi:led-off',
      'mdi:led-on',
      'mdi:led-variant-off',
      'mdi:led-variant-on'
    ];
  } else if (type === 'socket') {
    icons = [
      'mdi:power-socket',
      'mdi:power-socket-eu',
      'mdi:power-socket-us',
      'mdi:power-socket-uk',
      'mdi:power-socket-au',
      'mdi:power-socket-de',
      'mdi:power-socket-fr',
      'mdi:power-socket-it',
      'mdi:power-socket-ch',
      'mdi:power-socket-jp',
      'mdi:power-socket-mx',
      // 开关
      'mdi:toggle-switch-variant',
      'mdi:toggle-switch-variant-off',
      'mdi:toggle-switch',
      'mdi:toggle-switch-off',
      // 厨房电器
      'mdi:refrigerator',
      'mdi:microwave',
      'mdi:coffee-maker',
      'mdi:kettle',
      'mdi:toaster',
      'mdi:blender',
      // 生活电器
      'mdi:washing-machine',
      'mdi:tumble-dryer',
      'mdi:air-conditioner',
      'mdi:vacuum',
      'mdi:hair-dryer',
      'mdi:iron',
      // 娱乐设备
      'mdi:tv',
      'mdi:tv-box',
      'mdi:youtube-tv',
      'mdi:nintendo-switch',
      'mdi:playstation',
      'mdi:xbox',
      // 办公设备
      'mdi:computer-classic',
      'mdi:laptop',
      'mdi:desktop-tower-monitor',
      'mdi:printer',
      'mdi:scanner',
      'mdi:server',
      // 其他电器
      'mdi:fan',
      'mdi:air-purifier',
      'mdi:water-heater',
      'mdi:water-pump',
      'mdi:battery-charging',

      'mdi:bicycle-electric'
    ];
  } else if (type === 'scene') {
    icons = [
      // 离家/回家场景
      'mdi:home',
      'mdi:home-outline',
      'mdi:home-export-outline',
      'mdi:home-import-outline',
      'mdi:home-automation',
      'mdi:door-closed',
      'mdi:door-open',
      'mdi:exit-run',
      'mdi:login',
      'mdi:logout',
      
      // 睡眠/起床场景
      'mdi:bed',
      'mdi:bed-empty',
      'mdi:power-sleep',
      'mdi:weather-night',
      'mdi:weather-sunset',
      'mdi:weather-sunny',
      'mdi:alarm',
      
      // 工作/娱乐场景
      'mdi:briefcase',
      'mdi:desk',
      'mdi:movie',
      'mdi:gamepad',
      'mdi:television',
      'mdi:book-open',
      'mdi:party-popper',
      
      // 用餐场景
      'mdi:food',
      'mdi:food-fork-drink',
      'mdi:coffee',
      'mdi:silverware-fork-knife',
      
      // 清洁/打扫场景
      'mdi:broom',
      'mdi:vacuum',
      'mdi:washing-machine',
      
      // 安全/警戒场景
      'mdi:shield-home',
      'mdi:shield-lock',
      'mdi:cctv',
      'mdi:alert',
      'mdi:bell',
      
      // 节能场景
      'mdi:leaf',
      'mdi:power-plug-off',
      'mdi:battery-charging',
      'mdi:weather-sunset-down',
      
      // 其他常用场景
      'mdi:cog',
      'mdi:timer',
      'mdi:calendar-clock',
      'mdi:playlist-check',
      'mdi:heart',
      'mdi:star',
      'mdi:flash'
    ];
  }

  return icons.map(name => ({
    name,
    label: name.replace('mdi:', '').split('-').map(
      word => word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }));
};