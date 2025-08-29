/**
 * 搜索输入组件
 * 提供搜索输入框和实时搜索功能
 */
import React from 'react';

/**
 * 搜索输入组件属性接口
 */
interface SearchInputProps {
  /** 输入值 */
  value: string;
  /** 输入变化回调 */
  onChange: (value: string) => void;
  /** 占位符文本 */
  placeholder?: string;
  /** 是否正在加载 */
  isLoading?: boolean;
}

/**
 * 搜索输入组件
 * 提供带有搜索图标和加载状态的输入框
 */
const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = '输入元素名称或符号',
  isLoading = false
}) => {
  /**
   * 处理输入变化
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value);
  };

  /**
   * 处理键盘事件
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    // 可以在这里添加快捷键处理逻辑
    if (event.key === 'Escape') {
      onChange('');
    }
  };

  return (
    <div className="search-input-container relative">
      {/* 搜索图标 */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        ) : (
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        )}
      </div>

      {/* 输入框 */}
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={
          "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg " +
          "focus:ring-2 focus:ring-blue-500 focus:border-transparent " +
          "transition-colors duration-200 text-lg"
        }
        autoFocus
        disabled={isLoading}
      />

      {/* 清除按钮 */}
      {value && (
        <button
          onClick={() => onChange('')}
          className={
            "absolute inset-y-0 right-0 pr-3 flex items-center " +
            "text-gray-400 hover:text-gray-600 transition-colors duration-200"
          }
          type="button"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchInput;