/**
 * 极简搜索页面组件
 * 只显示一个200x40px的美化搜索框
 */
import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { elements, Element } from '../data/elements';

/**
 * SearchPage组件的ref接口
 */
export interface SearchPageRef {
  clearSearch: () => void;
}

const SearchPage = forwardRef<SearchPageRef>((props, ref) => {
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
          element.nameZh.toLowerCase().includes(lowerQuery)) {
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

  /**
   * 处理元素卡片点击 - 复制元素信息到剪贴板
   * @param element - 被点击的元素
   */
  const handleElementClick = async (element: Element) => {
    try {
      // 构建要复制的元素信息
      const elementInfo = `元素信息：
原子序数：${element.atomicNumber}
元素符号：${element.symbol}
中文名称：${element.nameZh}
英文名称：${element.name}
元素类别：${element.category || '未知'}`;
      
      // 复制到剪贴板
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(elementInfo);
        console.log('元素信息已复制到剪贴板:', element.symbol);
        
        // 简单的视觉反馈 - 可以考虑添加toast提示
        const clickedElement = document.activeElement as HTMLElement;
        if (clickedElement) {
          const originalTransform = clickedElement.style.transform;
          clickedElement.style.transform = 'scale(0.95)';
          setTimeout(() => {
            clickedElement.style.transform = originalTransform;
          }, 150);
        }
      } else {
        // 降级方案：使用传统的复制方法
        const textArea = document.createElement('textarea');
        textArea.value = elementInfo;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        console.log('元素信息已复制到剪贴板（降级方案）:', element.symbol);
      }
    } catch (error) {
      console.error('复制到剪贴板失败:', error);
      // 可以在这里添加错误提示
    }
  };

  /**
   * 清空搜索内容
   */
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  /**
   * 根据元素类别获取背景颜色
   * @param category - 元素类别
   * @returns 背景颜色类名
   */
  const getCategoryColor = (category: string): string => {
    const colorMap: { [key: string]: string } = {
      '碱金属': 'bg-red-500',
      '碱土金属': 'bg-orange-500',
      '过渡金属': 'bg-blue-500',
      '镧系元素': 'bg-green-500',
      '锕系元素': 'bg-purple-500',
      '非金属': 'bg-yellow-500',
      '卤素': 'bg-teal-500',
      '稀有气体': 'bg-indigo-500',
      '金属': 'bg-gray-500',
      '类金属': 'bg-pink-500'
    };
    return colorMap[category] || 'bg-gray-500';
  };

  /**
   * 暴露给父组件的方法
   */
  useImperativeHandle(ref, () => ({
    clearSearch
  }), [clearSearch]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent">
      {/* 极简美化搜索框 - 200x40px */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder="搜索元素..."
          className={`w-[300px] h-20 px-6 text-lg bg-gray-800 border-2 border-gray-600 rounded-full focus:outline-none focus:border-blue-400 focus:shadow-lg transition-all duration-300 text-center hover:shadow-md ${
            searchQuery && searchResults.length === 0 ? 'text-red-400' : 'text-white'
          } ${
            !isInputFocused && searchQuery === '' ? 'opacity-60' : 'opacity-100'
          }`}
        />
        
        {/* 搜索结果显示为正方形卡片网格 */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 mt-3 w-[300px] max-h-[400px] overflow-y-auto z-50 p-4">
            <div className="grid grid-cols-4 gap-3">
              {searchResults.map((element) => (
                <div
                  key={element.atomicNumber}
                  className={`w-20 h-20 ${getCategoryColor(element.category || '')} rounded-xl flex flex-col items-center justify-center text-white font-bold cursor-pointer transform hover:scale-110 transition-all duration-300 hover:shadow-xl shadow-lg border border-white/20`}
                  onClick={() => handleElementClick(element)}
                >
                  <div className="text-xs opacity-90 font-medium">{element.atomicNumber}</div>
                  <div className="text-lg font-bold">{element.symbol}</div>
                  <div className="text-xs opacity-90 truncate w-full text-center font-medium">{element.nameZh}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        


      </div>
    </div>
  );
});

SearchPage.displayName = 'SearchPage';

export default SearchPage;