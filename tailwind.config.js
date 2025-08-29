/**
 * Tailwind CSS配置文件
 * 配置Tailwind CSS的内容路径和主题
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 自定义颜色
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // 元素类别颜色
        element: {
          metal: '#fbbf24',
          nonmetal: '#10b981',
          metalloid: '#f97316',
          noble: '#8b5cf6',
          alkali: '#3b82f6',
          alkaline: '#6366f1',
          transition: '#eab308',
          halogen: '#ef4444',
        }
      },
      fontFamily: {
        // 自定义字体
        'sans': ['Microsoft YaHei', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      spacing: {
        // 自定义间距
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        // 自定义动画
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        // 自定义阴影
        'element': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'element-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        // 自定义圆角
        'xl': '0.75rem',
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
  // 深色模式配置
  darkMode: 'class',
};