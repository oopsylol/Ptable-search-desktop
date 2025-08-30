/**
 * 化学元素数据文件
 * 包含118个化学元素的完整信息
 */
import elementsData from './elements.json';

/**
 * 元素接口定义
 */
export interface Element {
  /** 原子序数 */
  atomicNumber: number;
  /** 元素符号 */
  symbol: string;
  /** 中文名称 */
  nameZh: string;
  /** 英文名称 */
  name: string;
  /** 拉丁名称 */
  nameLatin?: string;
  /** 原子量 */
  atomicMass: number;
  /** 元素类别 */
  category?: string;
  /** 周期 */
  period: number;
  /** 族 */
  group: number;
}

/**
 * 转换JSON数据为Element接口格式
 * @param data - 原始JSON数据
 * @returns 转换后的Element数组
 */
const transformElements = (data: any[]): Element[] => {
  return data.map(item => ({
    atomicNumber: item.atomic_number,
    symbol: item.symbol,
    nameZh: item.name_zh,
    name: item.name_en,
    nameLatin: item.name_latin,
    atomicMass: item.atomic_weight,
    category: item.category,
    period: item.period,
    group: item.group
  }));
};

/**
 * 导出化学元素数据数组
 */
export const elements: Element[] = transformElements(elementsData);

/**
 * 默认导出
 */
export default elements;