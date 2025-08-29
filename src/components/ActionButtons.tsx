/**
 * 操作按钮组件
 * 提供清空、设置、最小化等操作按钮
 */
import React from 'react';

/**
 * 操作按钮组件属性接口
 */
interface ActionButtonsProps {
  /** 清空搜索回调 */
  onClear: () => void;
  /** 打开设置回调 */
  onSettings: () => void;
  /** 最小化到托盘回调 */
  onMinimize: () => void;
  /** 是否有搜索结果 */
  hasResults: boolean;
}

/**
 * 操作按钮组件
 * 提供应用的主要操作按钮
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({
  onClear,
  onSettings,
  onMinimize,
  hasResults
}) => {
  /**
   * 按钮基础样式
   */
  const baseButtonClass = 
    "flex items-center justify-center px-4 py-2 rounded-lg " +
    "transition-colors duration-200 font-medium text-sm";

  /**
   * 主要按钮样式
   */
  const primaryButtonClass = 
    baseButtonClass + " bg-blue-500 text-white hover:bg-blue-600";

  /**
   * 次要按钮样式
   */
  const secondaryButtonClass = 
    baseButtonClass + " bg-gray-100 text-gray-700 hover:bg-gray-200";

  /**
   * 禁用按钮样式
   */
  const disabledButtonClass = 
    baseButtonClass + " bg-gray-100 text-gray-400 cursor-not-allowed";

  return (
    <div className="action-buttons-container">
      <div className="max-w-md mx-auto flex justify-between space-x-3">
        {/* 清空按钮 */}
        <button
          onClick={onClear}
          className={hasResults ? secondaryButtonClass : disabledButtonClass}
          disabled={!hasResults}
          title="清空搜索结果"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          清空
        </button>

        {/* 设置按钮 */}
        <button
          onClick={onSettings}
          className={secondaryButtonClass}
          title="打开设置"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          设置
        </button>

        {/* 最小化按钮 */}
        <button
          onClick={onMinimize}
          className={primaryButtonClass}
          title="最小化到托盘"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
          最小化
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;