/**
 * 类型定义文件
 * 定义应用中使用的所有TypeScript类型接口
 */

/**
 * 化学元素接口
 * 定义元素的基本属性
 */
export interface Element {
  /** 原子序数 */
  atomic_number: number;
  /** 元素符号 */
  symbol: string;
  /** 中文名称 */
  name_zh: string;
  /** 英文名称 */
  name_en: string;
  /** 拉丁名称 */
  name_latin: string;
  /** 原子量 */
  atomic_weight: number;
  /** 元素类别 */
  category: string;
  /** 周期 */
  period: number;
  /** 族 */
  group: number;
}

/**
 * 搜索结果接口
 * 定义搜索返回的结果结构
 */
export interface SearchResult {
  /** 匹配的元素列表 */
  elements: Element[];
  /** 匹配结果总数 */
  total: number;
}

/**
 * 用户设置接口
 * 定义用户偏好设置
 */
export interface UserSettings {
  /** 启动时最小化 */
  start_minimized: boolean;
  /** 界面主题 */
  theme: 'light' | 'dark';
  /** 全局快捷键 */
  hotkey: string;
  /** 显示原子量 */
  show_atomic_weight: boolean;
  /** 显示元素类别 */
  show_category: boolean;
  /** 窗口大小 */
  window_size: {
    width: number;
    height: number;
  };
}

/**
 * 搜索查询参数接口
 * 定义搜索请求的参数
 */
export interface SearchQuery {
  /** 搜索关键词 */
  query: string;
  /** 是否精确匹配 */
  exact?: boolean;
}