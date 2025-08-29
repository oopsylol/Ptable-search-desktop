/**
 * 主应用组件
 * 管理应用的整体布局和路由
 */
import React, { useState, useEffect } from 'react';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';
import { UserSettings } from './types';

/**
 * 应用页面类型
 */
type PageType = 'search' | 'settings';

/**
 * 主应用组件
 * 负责页面路由和全局状态管理
 */
const App: React.FC = () => {
  // 当前页面状态
  const [currentPage, setCurrentPage] = useState<PageType>('search');
  
  // 用户设置状态
  const [settings, setSettings] = useState<UserSettings>({
    start_minimized: true,
    theme: 'light',
    hotkey: 'Ctrl+Shift+E',
    show_atomic_weight: true,
    show_category: true,
    window_size: {
      width: 400,
      height: 300
    }
  });

  /**
   * 加载用户设置
   * 从本地存储或默认配置加载设置
   */
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('ptable-settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      }
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  }, []);

  /**
   * 保存用户设置
   * 将设置保存到本地存储
   */
  const saveSettings = (newSettings: Partial<UserSettings>): void => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      localStorage.setItem('ptable-settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  };

  /**
   * 页面切换处理函数
   */
  const handlePageChange = (page: PageType): void => {
    setCurrentPage(page);
  };

  /**
   * 渲染当前页面
   */
  const renderCurrentPage = (): React.ReactNode => {
    switch (currentPage) {
      case 'search':
        return (
          <SearchPage 
            settings={settings}
            onNavigateToSettings={() => handlePageChange('settings')}
          />
        );
      case 'settings':
        return (
          <SettingsPage 
            settings={settings}
            onSettingsChange={saveSettings}
            onNavigateBack={() => handlePageChange('search')}
          />
        );
      default:
        return <SearchPage settings={settings} onNavigateToSettings={() => handlePageChange('settings')} />;
    }
  };

  return (
    <div className={`app ${settings.theme}`}>
      {renderCurrentPage()}
    </div>
  );
};

export default App;