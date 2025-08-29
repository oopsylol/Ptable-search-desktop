/**
 * 极简搜索页面组件
 * 提供极简的元素搜索界面，只显示输入框和搜索结果
 */
import React, { useState, useEffect, useCallback } from 'react';
import { elements } from '../data/elements';
import { Element } from '../types/element';

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Element[]>([]);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

  /**
   * 执行搜索操作
   * @param query - 搜索查询字符串
   */
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase().trim();
    
    const results = elements.filter(element => {
      // 按名称搜索（中文和英文）
      if (element.name.toLowerCase().includes(lowerQuery) ||
          element.nameZh.includes(lowerQuery)) {
        return true;
      }
      
      // 按符号搜索
      if (element.symbol.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      // 按原子序数搜索
      if (element.atomicNumber.toString().includes(lowerQuery)) {
        return true;
      }
      
      return false;
    });
    
    setSearchResults(results);
  }, []);

  // 使用 useEffect 处理搜索延迟
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  /**
   * 处理搜索输入变化
   * @param e - 输入事件
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  /**
   * 处理输入框焦点
   */
  const handleInputFocus = () => {
    setIsInputFocused(true);
  };

  /**
   * 处理输入框失焦
   */
  const handleInputBlur = () => {
    setIsInputFocused(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start pt-20 px-4">
      {/* 极简输入框 */}
      <div className="w-full max-w-md mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={searchQuery === '' && searchResults.length === 0 && !isInputFocused ? "没有该元素" : "搜索元素..."}
          className={`w-full px-4 py-3 text-lg text-white bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-300 ${
            !isInputFocused && searchQuery === '' ? 'opacity-50' : 'opacity-100'
          }`}
        />
      </div>

      {/* 搜索结果 - 100x100 元素卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full max-w-6xl">
        {searchResults.map((element) => (
          <div
            key={element.atomicNumber}
            className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex flex-col items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
            title={`${element.nameZh} (${element.name}) - 原子序数: ${element.atomicNumber}`}
          >
            <div className="text-xs font-medium mb-1">{element.atomicNumber}</div>
            <div className="text-xl font-bold mb-1">{element.symbol}</div>
            <div className="text-xs text-center leading-tight">{element.nameZh}</div>
          </div>
        ))}
      </div>

      {/* 无结果提示 */}
      {searchQuery && searchResults.length === 0 && (
        <div className="text-gray-400 text-center mt-8">
          <div className="text-lg">没有找到匹配的元素</div>
          <div className="text-sm mt-2">请尝试输入元素名称、符号或原子序数</div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;