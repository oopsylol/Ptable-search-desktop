/**
 * 元素搜索工具函数
 * 提供元素数据的搜索和过滤功能
 */
import { Element, SearchResult, SearchQuery } from '../types';
import elementsData from '../data/elements.json';

/**
 * 元素数据缓存
 * 避免重复加载JSON数据
 */
let cachedElements: Element[] | null = null;

/**
 * 获取所有元素数据
 * 返回缓存的元素数据或从JSON文件加载
 */
const getAllElements = (): Element[] => {
  if (!cachedElements) {
    try {
      cachedElements = elementsData as Element[];
    } catch (error) {
      console.error('加载元素数据失败:', error);
      cachedElements = [];
    }
  }
  return cachedElements;
};

/**
 * 标准化搜索字符串
 * 移除空格并转换为小写
 */
const normalizeSearchString = (str: string): string => {
  return str.trim().toLowerCase();
};

/**
 * 检查字符串是否匹配
 * 支持精确匹配和模糊匹配
 */
const isMatch = (target: string, query: string, exact: boolean = false): boolean => {
  const normalizedTarget = normalizeSearchString(target);
  const normalizedQuery = normalizeSearchString(query);
  
  if (exact) {
    return normalizedTarget === normalizedQuery;
  }
  
  return normalizedTarget.includes(normalizedQuery);
};

/**
 * 计算匹配分数
 * 用于结果排序，分数越高排序越靠前
 */
const calculateMatchScore = (element: Element, query: string): number => {
  const normalizedQuery = normalizeSearchString(query);
  let score = 0;
  
  // 精确匹配得分最高
  if (normalizeSearchString(element.symbol) === normalizedQuery) score += 100;
  if (normalizeSearchString(element.name_zh) === normalizedQuery) score += 90;
  if (normalizeSearchString(element.name_en) === normalizedQuery) score += 85;
  if (normalizeSearchString(element.name_latin) === normalizedQuery) score += 80;
  
  // 开头匹配得分较高
  if (normalizeSearchString(element.symbol).startsWith(normalizedQuery)) score += 50;
  if (normalizeSearchString(element.name_zh).startsWith(normalizedQuery)) score += 45;
  if (normalizeSearchString(element.name_en).startsWith(normalizedQuery)) score += 40;
  if (normalizeSearchString(element.name_latin).startsWith(normalizedQuery)) score += 35;
  
  // 包含匹配得分最低
  if (normalizeSearchString(element.symbol).includes(normalizedQuery)) score += 20;
  if (normalizeSearchString(element.name_zh).includes(normalizedQuery)) score += 15;
  if (normalizeSearchString(element.name_en).includes(normalizedQuery)) score += 10;
  if (normalizeSearchString(element.name_latin).includes(normalizedQuery)) score += 5;
  
  return score;
};

/**
 * 搜索元素
 * 根据查询条件搜索匹配的元素
 */
export const searchElements = async (query: string, exact: boolean = false): Promise<SearchResult> => {
  return new Promise((resolve) => {
    try {
      const elements = getAllElements();
      
      if (!query.trim()) {
        resolve({ elements: [], total: 0 });
        return;
      }
      
      // 过滤匹配的元素
      const matchedElements = elements.filter((element) => {
        return (
          isMatch(element.symbol, query, exact) ||
          isMatch(element.name_zh, query, exact) ||
          isMatch(element.name_en, query, exact) ||
          isMatch(element.name_latin, query, exact) ||
          (!exact && element.atomic_number.toString().includes(query.trim()))
        );
      });
      
      // 按匹配分数排序
      const sortedElements = matchedElements
        .map((element) => ({
          element,
          score: calculateMatchScore(element, query)
        }))
        .sort((a, b) => b.score - a.score)
        .map(({ element }) => element);
      
      resolve({
        elements: sortedElements,
        total: sortedElements.length
      });
    } catch (error) {
      console.error('搜索过程中发生错误:', error);
      resolve({ elements: [], total: 0 });
    }
  });
};

/**
 * 根据原子序数获取元素
 * 通过原子序数精确查找元素
 */
export const getElementById = (atomicNumber: number): Element | null => {
  try {
    const elements = getAllElements();
    return elements.find(element => element.atomic_number === atomicNumber) || null;
  } catch (error) {
    console.error('获取元素失败:', error);
    return null;
  }
};

/**
 * 根据符号获取元素
 * 通过元素符号精确查找元素
 */
export const getElementBySymbol = (symbol: string): Element | null => {
  try {
    const elements = getAllElements();
    return elements.find(element => 
      normalizeSearchString(element.symbol) === normalizeSearchString(symbol)
    ) || null;
  } catch (error) {
    console.error('获取元素失败:', error);
    return null;
  }
};

/**
 * 获取随机元素
 * 返回一个随机选择的元素，用于演示或测试
 */
export const getRandomElement = (): Element | null => {
  try {
    const elements = getAllElements();
    if (elements.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * elements.length);
    return elements[randomIndex];
  } catch (error) {
    console.error('获取随机元素失败:', error);
    return null;
  }
};

/**
 * 获取元素统计信息
 * 返回元素数据的基本统计
 */
export const getElementStats = () => {
  try {
    const elements = getAllElements();
    const categories = new Set(elements.map(e => e.category));
    const periods = new Set(elements.map(e => e.period));
    const groups = new Set(elements.map(e => e.group));
    
    return {
      totalElements: elements.length,
      categories: Array.from(categories).sort(),
      periods: Array.from(periods).sort((a, b) => a - b),
      groups: Array.from(groups).sort((a, b) => a - b)
    };
  } catch (error) {
    console.error('获取统计信息失败:', error);
    return {
      totalElements: 0,
      categories: [],
      periods: [],
      groups: []
    };
  }
};