/**
 * Electron预加载脚本
 * 在渲染进程中安全地暴露Node.js API
 */
const { contextBridge, ipcRenderer } = require('electron');

/**
 * 向渲染进程暴露安全的API
 */
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * 最小化窗口到系统托盘
   */
  minimizeToTray: () => {
    ipcRenderer.send('minimize-to-tray');
  },

  /**
   * 更新应用设置
   * @param {Object} settings - 设置对象
   */
  updateSettings: (settings) => {
    ipcRenderer.send('update-settings', settings);
  },

  /**
   * 监听显示设置消息
   * @param {Function} callback - 回调函数
   */
  onShowSettings: (callback) => {
    ipcRenderer.on('show-settings', callback);
  },

  /**
   * 监听清空搜索消息
   * @param {Function} callback - 回调函数
   */
  onClearSearch: (callback) => {
    ipcRenderer.on('clear-search', callback);
  },

  /**
   * 移除所有监听器
   * @param {string} channel - 消息通道
   */
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },

  /**
   * 获取应用版本信息
   */
  getAppVersion: () => {
    return ipcRenderer.invoke('get-app-version');
  },

  /**
   * 获取系统信息
   */
  getSystemInfo: () => {
    return ipcRenderer.invoke('get-system-info');
  },

  /**
   * 监听主进程消息
   * @param {string} channel - 消息通道
   * @param {Function} callback - 回调函数
   */
  onMessage: (channel, callback) => {
    ipcRenderer.on(channel, callback);
  },

  /**
   * 移除消息监听器
   * @param {string} channel - 消息通道
   * @param {Function} callback - 回调函数
   */
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  },

  /**
   * 关闭设置窗口
   */
  closeSettingsWindow: () => {
    ipcRenderer.send('close-settings-window');
  },

  /**
   * 显示设置窗口
   */
  showSettings: () => {
    ipcRenderer.send('show-settings-window');
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