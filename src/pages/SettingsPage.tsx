/**
 * 设置页面组件
 * 提供用户偏好设置和配置选项
 */
import React, { useState } from 'react';
import { UserSettings } from '../types';

/**
 * 设置页面属性接口
 */
interface SettingsPageProps {
  /** 当前设置 */
  settings: UserSettings;
  /** 设置变更回调 */
  onSettingsChange: (settings: Partial<UserSettings>) => void;
  /** 返回上一页回调 */
  onNavigateBack: () => void;
}

/**
 * 设置页面组件
 * 管理应用的各种配置选项
 */
const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onSettingsChange,
  onNavigateBack
}) => {
  // 本地设置状态
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);

  /**
   * 处理设置项变更
   */
  const handleSettingChange = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ): void => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange({ [key]: value });
  };

  /**
   * 处理窗口大小变更
   */
  const handleWindowSizeChange = (dimension: 'width' | 'height', value: number): void => {
    const newWindowSize = {
      ...localSettings.window_size,
      [dimension]: value
    };
    handleSettingChange('window_size', newWindowSize);
  };

  /**
   * 重置为默认设置
   */
  const handleResetToDefaults = (): void => {
    const defaultSettings: UserSettings = {
      start_minimized: true,
      theme: 'light',
      hotkey: 'Ctrl+Shift+E',
      show_atomic_weight: true,
      show_category: true,
      window_size: {
        width: 400,
        height: 300
      }
    };
    
    setLocalSettings(defaultSettings);
    onSettingsChange(defaultSettings);
  };

  return (
    <div className="settings-page min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="settings-header bg-white shadow-sm p-6">
        <div className="max-w-md mx-auto flex items-center">
          <button
            onClick={onNavigateBack}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="返回搜索页面"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">应用设置</h1>
        </div>
      </div>

      {/* 设置内容 */}
      <div className="settings-content p-6">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* 启动设置 */}
          <div className="setting-section bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">启动设置</h3>
            
            <div className="setting-item flex items-center justify-between">
              <div>
                <label className="text-gray-700 font-medium">启动时最小化</label>
                <p className="text-sm text-gray-500">应用启动后自动最小化到系统托盘</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.start_minimized}
                  onChange={(e) => handleSettingChange('start_minimized', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* 界面设置 */}
          <div className="setting-section bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">界面设置</h3>
            
            {/* 主题选择 */}
            <div className="setting-item mb-4">
              <label className="block text-gray-700 font-medium mb-2">界面主题</label>
              <select
                value={localSettings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value as 'light' | 'dark')}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="light">浅色主题</option>
                <option value="dark">深色主题</option>
              </select>
            </div>

            {/* 窗口大小 */}
            <div className="setting-item">
              <label className="block text-gray-700 font-medium mb-2">窗口大小</label>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-500 mb-1">宽度</label>
                  <input
                    type="number"
                    min="300"
                    max="800"
                    value={localSettings.window_size.width}
                    onChange={(e) => handleWindowSizeChange('width', parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-500 mb-1">高度</label>
                  <input
                    type="number"
                    min="200"
                    max="600"
                    value={localSettings.window_size.height}
                    onChange={(e) => handleWindowSizeChange('height', parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 显示设置 */}
          <div className="setting-section bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">显示设置</h3>
            
            <div className="space-y-4">
              <div className="setting-item flex items-center justify-between">
                <div>
                  <label className="text-gray-700 font-medium">显示原子量</label>
                  <p className="text-sm text-gray-500">在搜索结果中显示元素的原子量</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.show_atomic_weight}
                    onChange={(e) => handleSettingChange('show_atomic_weight', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="setting-item flex items-center justify-between">
                <div>
                  <label className="text-gray-700 font-medium">显示元素类别</label>
                  <p className="text-sm text-gray-500">在搜索结果中显示元素的类别标签</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.show_category}
                    onChange={(e) => handleSettingChange('show_category', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 快捷键设置 */}
          <div className="setting-section bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">快捷键设置</h3>
            
            <div className="setting-item">
              <label className="block text-gray-700 font-medium mb-2">全局快捷键</label>
              <input
                type="text"
                value={localSettings.hotkey}
                onChange={(e) => handleSettingChange('hotkey', e.target.value)}
                placeholder="例如: Ctrl+Shift+E"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">用于快速显示/隐藏应用窗口</p>
            </div>
          </div>

          {/* 重置按钮 */}
          <div className="setting-section">
            <button
              onClick={handleResetToDefaults}
              className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium"
            >
              重置为默认设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;