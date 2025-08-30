/**
 * Electron API类型声明文件
 * 为window.electronAPI提供TypeScript类型支持
 */

/**
 * 应用设置接口
 */
interface AppSettings {
  autoHideDelay?: number;
  hotkey?: string;
}

/**
 * Electron API接口
 * 定义渲染进程可以访问的Electron功能
 */
interface ElectronAPI {
  /**
   * 最小化到托盘
   * 将应用窗口最小化到系统托盘
   */
  minimizeToTray: () => void;

  /**
   * 更新应用设置
   * 将设置更新发送到主进程
   * @param settings - 设置对象
   */
  updateSettings: (settings: AppSettings) => void;

  /**
   * 监听显示设置消息
   * @param callback - 回调函数
   */
  onShowSettings: (callback: () => void) => void;

  /**
   * 监听清空搜索消息
   * @param callback - 回调函数
   */
  onClearSearch: (callback: () => void) => void;

  /**
   * 移除所有监听器
   * @param channel - 消息通道
   */
  removeAllListeners: (channel: string) => void;

  /**
   * 获取应用版本信息
   * 返回应用的版本和构建信息
   */
  getAppInfo: () => {
    name: string;
    version: string;
    description: string;
  };

  /**
   * 检查是否在Electron环境中运行
   * 用于区分Electron和浏览器环境
   */
  isElectron: () => boolean;

  /**
   * 获取平台信息
   * 返回当前运行的操作系统平台
   */
  getPlatform: () => string;
}

/**
 * 扩展Window接口
 * 添加electronAPI属性
 */
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};