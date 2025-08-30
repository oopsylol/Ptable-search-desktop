/**
 * 国际化配置文件
 * 配置i18next支持中英文切换
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';

/**
 * 语言资源配置
 */
const resources = {
  'zh-CN': {
    translation: zhCN
  },
  'en-US': {
    translation: enUS
  }
};

/**
 * 初始化i18next
 */
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh-CN', // 默认语言
    fallbackLng: 'zh-CN', // 回退语言
    interpolation: {
      escapeValue: false // React已经处理了XSS
    },
    debug: process.env.NODE_ENV === 'development'
  });

export default i18n;

/**
 * 支持的语言列表
 */
export const supportedLanguages = [
  { code: 'zh-CN', name: '中文' },
  { code: 'en-US', name: 'English' }
];

/**
 * 获取当前语言
 */
export const getCurrentLanguage = () => i18n.language;

/**
 * 切换语言
 * @param language - 语言代码
 */
export const changeLanguage = (language: string) => {
  i18n.changeLanguage(language);
  // 保存到本地存储
  localStorage.setItem('language', language);
};

/**
 * 从本地存储加载语言设置
 */
export const loadLanguageFromStorage = () => {
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage && supportedLanguages.some(lang => lang.code === savedLanguage)) {
    i18n.changeLanguage(savedLanguage);
  }
};