/**
 * 主应用组件
 * 管理应用的整体状态和路由
 */
import React, { useEffect, useRef } from 'react';
import SearchPage from './pages/SearchPage';
import SimpleSettingsPage from './pages/SimpleSettingsPage';

/**
 * 主应用组件
 * 负责页面路由和全局状态管理
 */
const App: React.FC = () => {
  const searchPageRef = useRef<{ clearSearch: () => void }>(null);

  /**
   * 组件挂载时设置事件监听器
   */
  useEffect(() => {
    // 监听清空搜索的消息
    const handleClearSearch = () => {
      if (searchPageRef.current) {
        searchPageRef.current.clearSearch();
      }
    };

    // 添加事件监听器
    if (window.electronAPI) {
      window.electronAPI.onClearSearch(handleClearSearch);
    }

    return () => {
      // 清理事件监听器
      if (window.electronAPI && window.electronAPI.removeAllListeners) {
        window.electronAPI.removeAllListeners('clear-search');
      }
    };
  }, []);

  return (
    <div className="app w-full h-screen bg-transparent">
      <SearchPage ref={searchPageRef} />
      <SimpleSettingsPage />
    </div>
  );
};

export default App;