/**
 * React应用主入口文件
 * 初始化React应用并挂载到DOM
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n'; // 初始化国际化
import { loadLanguageFromStorage } from './i18n';

/**
 * 应用初始化函数
 * 创建React根节点并渲染应用
 */
function initializeApp(): void {
  try {
    // 加载保存的语言设置
    loadLanguageFromStorage();
    
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    console.log('元素周期表查询应用已启动');
  } catch (error) {
    console.error('应用初始化失败:', error);
  }
}

// 初始化应用
initializeApp();