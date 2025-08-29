/**
 * Electron预加载脚本
 * 在渲染进程中安全地暴露Electron API
 */
const { contextBridge, ipcRenderer } = require('electron');

/**
 * 暴露给渲染进程的API
 * 通过contextBridge安全地暴露功能
 */
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * 最小化到托盘
   * 将应用窗口最小化到系统托盘
   */
  minimizeToTray: () => {
    return ipcRenderer.invoke('minimize-to-tray');
  },

  /**
   * 获取应用设置
   * 从主进程获取当前的应用设置
   */
  getSettings: () => {
    return ipcRenderer.invoke('get-settings');
  },

  /**
   * 保存应用设置
   * 将设置保存到主进程
   */
  saveSettings: (settings) => {
    return ipcRenderer.invoke('save-settings', settings);
  },

  /**
   * 获取应用版本信息
   * 返回应用的版本和构建信息
   */
  getAppInfo: () => {
    return {
      name: 'PTable',
      version: '1.0.0',
      description: '元素周期表查询工具'
    };
  },

  /**
   * 检查是否在Electron环境中运行
   * 用于区分Electron和浏览器环境
   */
  isElectron: () => {
    return true;
  },

  /**
   * 获取平台信息
   * 返回当前运行的操作系统平台
   */
  getPlatform: () => {
    return process.platform;
  }
});

/**
 * 日志记录函数
 * 在开发模式下输出调试信息
 */
if (process.env.NODE_ENV === 'development') {
  console.log('Electron预加载脚本已加载');
  console.log('可用的API:', Object.keys(window.electronAPI || {}));
}

/**
 * 错误处理
 * 捕获并记录预加载脚本中的错误
 */
process.on('uncaughtException', (error) => {
  console.error('预加载脚本未捕获的异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('预加载脚本未处理的Promise拒绝:', reason, promise);
});