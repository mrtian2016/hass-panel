import { createClient } from 'webdav';
import { message } from 'antd';

// 清理旧版本，只保留最新的5个版本
export const cleanOldVersions = async (client, currentFiles) => {
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
  
export const saveConfigToWebDAV = async (config) => {
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
  
export const loadConfigFromWebDAV = async () => {
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

// 获取版本列表
export const fetchVersionList = async () => {
    try {
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

      return configFiles;
    } catch (error) {
      console.error('获取版本列表失败:', error);
      throw error;
    }
};

// 恢复指定版本
export const restoreVersion = async (filename) => {
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

      return configData;
    } catch (error) {
      console.error('恢复配置失败:', error);
      throw error;
    }
};

// 删除指定版本
export const deleteVersion = async (filename) => {
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
    } catch (error) {
      console.error('删除版本失败:', error);
      throw error;
    }
};
