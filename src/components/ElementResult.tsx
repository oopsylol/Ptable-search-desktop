/**
 * 元素结果显示组件
 * 显示搜索到的元素详细信息
 */
import React from 'react';
import { Element, UserSettings } from '../types';

/**
 * 元素结果组件属性接口
 */
interface ElementResultProps {
  /** 元素数据 */
  element: Element;
  /** 用户设置 */
  settings: UserSettings;
  /** 复制回调 */
  onCopy: () => void;
}

/**
 * 元素结果显示组件
 * 以卡片形式显示元素的详细信息
 */
const ElementResult: React.FC<ElementResultProps> = ({ element, settings, onCopy }) => {
  /**
   * 获取元素类别的颜色样式
   */
  const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      '非金属': 'bg-green-100 text-green-800',
      '稀有气体': 'bg-purple-100 text-purple-800',
      '碱金属': 'bg-blue-100 text-blue-800',
      '碱土金属': 'bg-indigo-100 text-indigo-800',
      '过渡金属': 'bg-yellow-100 text-yellow-800',
      '金属': 'bg-gray-100 text-gray-800',
      '类金属': 'bg-orange-100 text-orange-800',
      '卤素': 'bg-red-100 text-red-800'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-800';
  };

  /**
   * 处理复制操作
   */
  const handleCopy = async (): Promise<void> => {
    try {
      await onCopy();
      // 可以添加复制成功的视觉反馈
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  return (
    <div className="element-result bg-white rounded-lg shadow-md p-8 border border-gray-200 hover:shadow-lg transition-shadow duration-200 min-h-[200px]">
      {/* 元素符号和基本信息 */}
      <div className="element-header flex items-center justify-between mb-4">
        <div className="element-symbol-section flex items-center space-x-4">
          {/* 元素符号 */}
          <div className="element-symbol bg-blue-500 text-white rounded-lg w-16 h-16 flex items-center justify-center">
            <span className="text-2xl font-bold">{element.symbol}</span>
          </div>
          
          {/* 原子序数 */}
          <div className="atomic-number text-sm text-gray-500">
            <span className="block">原子序数</span>
            <span className="text-lg font-semibold text-gray-800">{element.atomic_number}</span>
          </div>
        </div>

        {/* 复制按钮 */}
        <button
          onClick={handleCopy}
          className="copy-button p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          title="复制元素信息"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
      </div>

      {/* 元素名称 */}
      <div className="element-names mb-4">
        <div className="chinese-name text-xl font-bold text-gray-800 mb-1">
          {element.name_zh}
        </div>
        <div className="english-names text-gray-600">
          <span className="english-name">{element.name_en}</span>
          {element.name_latin !== element.name_en && (
            <span className="latin-name ml-2 text-sm">({element.name_latin})</span>
          )}
        </div>
      </div>

      {/* 详细信息 */}
      <div className="element-details space-y-2">
        {/* 原子量 */}
        {settings.show_atomic_weight && (
          <div className="atomic-weight flex justify-between items-center">
            <span className="text-gray-600">原子量:</span>
            <span className="font-medium">{element.atomic_weight}</span>
          </div>
        )}

        {/* 元素类别 */}
        {settings.show_category && (
          <div className="category flex justify-between items-center">
            <span className="text-gray-600">类别:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(element.category)}`}>
              {element.category}
            </span>
          </div>
        )}

        {/* 周期和族 */}
        <div className="period-group flex justify-between items-center">
          <span className="text-gray-600">位置:</span>
          <span className="font-medium">第{element.period}周期 第{element.group}族</span>
        </div>
      </div>
    </div>
  );
};

export default ElementResult;