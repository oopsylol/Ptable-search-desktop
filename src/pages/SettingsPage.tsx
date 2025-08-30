/**
 * 设置页面组件
 * 允许用户配置应用设置，如自动隐藏时间和快捷键
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages, changeLanguage, getCurrentLanguage } from '../i18n';

/**
 * 设置页面组件
 */
const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [autoHideDelay, setAutoHideDelay] = useState<number>(10); // 默认10秒
  const [hotkey, setHotkey] = useState<string>('Ctrl+Shift+E'); // 默认快捷键
  const [isRecording, setIsRecording] = useState<boolean>(false); // 是否正在录制快捷键
  const [currentLanguage, setCurrentLanguage] = useState<string>(getCurrentLanguage()); // 当前语言
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [autoStart, setAutoStart] = useState<boolean>(false); // 开机启动状态

  /**
   * 组件挂载时加载设置
   */
  useEffect(() => {
    // 从本地存储加载设置
    const savedDelay = localStorage.getItem('autoHideDelay');
    if (savedDelay) {
      setAutoHideDelay(parseInt(savedDelay));
    }
    
    const savedHotkey = localStorage.getItem('hotkey');
    if (savedHotkey) {
      setHotkey(savedHotkey);
    }

    // 从本地存储加载开机启动设置
    const savedAutoStart = localStorage.getItem('autoStart');
    if (savedAutoStart) {
      setAutoStart(savedAutoStart === 'true');
    }

    // 监听显示设置的消息
    const handleShowSettings = () => {
      setIsVisible(true);
    };

    // 添加事件监听器
    if (window.electronAPI) {
      window.electronAPI.onShowSettings(handleShowSettings);
    }

    return () => {
      // 清理事件监听器
      if (window.electronAPI && window.electronAPI.removeAllListeners) {
        window.electronAPI.removeAllListeners('show-settings');
      }
    };
  }, []);

  /**
   * 保存设置
   */
  const saveSettings = () => {
    try {
      // 保存到本地存储
      localStorage.setItem('autoHideDelay', autoHideDelay.toString());
      localStorage.setItem('hotkey', hotkey);
      localStorage.setItem('autoStart', autoStart.toString());
      
      // 通知主进程更新设置
      if (window.electronAPI) {
        window.electronAPI.updateSettings({ 
          autoHideDelay: autoHideDelay * 1000,
          hotkey: hotkey,
          autoStart: autoStart
        });
      }
      
      // 隐藏设置页面
      setIsVisible(false);
      
      console.log('设置已保存');
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  };

  /**
   * 取消设置
   */
  const cancelSettings = () => {
    // 重置为保存的值
    const savedDelay = localStorage.getItem('autoHideDelay');
    if (savedDelay) {
      setAutoHideDelay(parseInt(savedDelay));
    } else {
      setAutoHideDelay(10);
    }
    
    const savedHotkey = localStorage.getItem('hotkey');
    if (savedHotkey) {
      setHotkey(savedHotkey);
    } else {
      setHotkey('Ctrl+Shift+E');
    }
    
    const savedAutoStart = localStorage.getItem('autoStart');
    if (savedAutoStart) {
      setAutoStart(savedAutoStart === 'true');
    } else {
      setAutoStart(false);
    }
    
    setIsRecording(false);
    setIsVisible(false);
  };

  /**
   * 处理自动隐藏时间变化
   * @param e - 输入事件
   */
  const handleDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 60) {
      setAutoHideDelay(value);
    }
  };

  /**
   * 处理语言切换
   * @param e - 选择事件
   */
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setCurrentLanguage(newLanguage);
    changeLanguage(newLanguage);
  };

  /**
   * 处理开机启动开关变化
   * @param e - 复选框事件
   */
  const handleAutoStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoStart(e.target.checked);
  };

  /**
   * 开始录制快捷键
   */
  const startRecording = () => {
    setIsRecording(true);
    setHotkey(t('settings.recordingTip'));
  };

  /**
   * 处理快捷键录制
   * @param e - 键盘事件
   */
  const handleHotkeyRecord = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isRecording) return;
    
    e.preventDefault();
    
    const keys: string[] = [];
    
    // 检查修饰键
    if (e.ctrlKey) keys.push('Ctrl');
    if (e.altKey) keys.push('Alt');
    if (e.shiftKey) keys.push('Shift');
    if (e.metaKey) keys.push('Meta');
    
    // 检查主键
    if (e.key && !['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
      const mainKey = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      keys.push(mainKey);
      
      // 只有在有修饰键和主键的情况下才设置快捷键
      if (keys.length >= 2) {
        const hotkeyString = keys.join('+');
        setHotkey(hotkeyString);
        setIsRecording(false);
      }
    }
  };

  /**
   * 验证快捷键格式
   * @param hotkey - 快捷键字符串
   * @returns 是否有效
   */
  const isValidHotkey = (hotkey: string): boolean => {
    if (hotkey === t('settings.recordingTip')) return false;
    
    const parts = hotkey.split('+');
    if (parts.length < 2) return false;
    
    const modifiers = ['Ctrl', 'Alt', 'Shift', 'Meta'];
    const hasModifier = parts.some(part => modifiers.includes(part));
    
    return hasModifier;
  };

  /**
   * 检查快捷键冲突
   * @param hotkey - 快捷键字符串
   * @returns 冲突信息
   */
  const checkHotkeyConflict = (hotkey: string): { hasConflict: boolean; message?: string } => {
    // 常见的系统快捷键列表
    const systemHotkeys = [
      'Ctrl+C', 'Ctrl+V', 'Ctrl+X', 'Ctrl+Z', 'Ctrl+Y',
      'Ctrl+A', 'Ctrl+S', 'Ctrl+O', 'Ctrl+N', 'Ctrl+P',
      'Ctrl+F', 'Ctrl+H', 'Ctrl+R', 'Ctrl+T', 'Ctrl+W',
      'Alt+F4', 'Alt+Tab', 'Ctrl+Alt+Del', 'Ctrl+Shift+Esc',
      'Meta+L', 'Meta+R', 'Meta+D', 'Meta+E', 'Meta+Tab'
    ];

    // 检查是否与系统快捷键冲突
    if (systemHotkeys.includes(hotkey)) {
      return {
        hasConflict: true,
        message: t('settings.hotkeyConflict')
      };
    }

    // 检查是否为单个修饰键（无效）
    const singleModifiers = ['Ctrl', 'Alt', 'Shift', 'Meta'];
    if (singleModifiers.includes(hotkey)) {
      return {
        hasConflict: true,
        message: t('settings.hotkeyInvalid')
      };
    }

    return { hasConflict: false };
  };

  /**
   * 获取快捷键状态信息
   * @param hotkey - 快捷键字符串
   * @returns 状态信息
   */
  const getHotkeyStatus = (hotkey: string) => {
    if (hotkey === t('settings.recordingTip')) {
      return { isValid: false, message: '', color: 'text-gray-400' };
    }

    if (!isValidHotkey(hotkey)) {
      return { 
        isValid: false, 
        message: t('settings.hotkeyInvalid'), 
        color: 'text-red-400' 
      };
    }

    const conflict = checkHotkeyConflict(hotkey);
    if (conflict.hasConflict) {
      return { 
        isValid: true, 
        message: conflict.message, 
        color: 'text-yellow-400' 
      };
    }

    return { 
      isValid: true, 
      message: t('settings.hotkeyValid'), 
      color: 'text-green-400' 
    };
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg border border-gray-600 shadow-2xl p-6 w-[300px]">
        {/* 标题 */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-white mb-2">{t('settings.title')}</h2>
          <div className="w-12 h-0.5 bg-blue-500 mx-auto"></div>
        </div>

        {/* 设置项 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('settings.language')}
            </label>
            <select
              value={currentLanguage}
              onChange={handleLanguageChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-400 mt-1">
              {t('settings.languageDesc')}
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-300 mb-2">
              <span>{t('settings.autoStart')}</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={autoStart}
                  onChange={handleAutoStartChange}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                  autoStart ? 'bg-blue-600' : 'bg-gray-600'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    autoStart ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`}></div>
                </div>
              </div>
            </label>
            <div className="text-xs text-gray-400 mt-1">
              {t('settings.autoStartDesc')}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('settings.autoHideDelay')}
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="60"
                value={autoHideDelay}
                onChange={handleDelayChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
              <div className="absolute right-3 top-2 text-gray-400 text-sm pointer-events-none">
                {t('settings.autoHideDelay').includes('秒') ? '秒' : 's'}
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {t('settings.autoHideDelayDesc')}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('settings.globalHotkey')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={hotkey}
                onKeyDown={handleHotkeyRecord}
                readOnly={!isRecording}
                className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors ${
                  isRecording ? 'border-blue-500 bg-blue-900/20' : ''
                } ${
                  !isValidHotkey(hotkey) && !isRecording ? 'border-red-500' : ''
                }`}
                placeholder={t('settings.globalHotkeyDesc')}
              />
              <button
                type="button"
                onClick={startRecording}
                disabled={isRecording}
                className={`absolute right-2 top-1 px-2 py-1 text-xs rounded transition-colors ${
                  isRecording 
                    ? 'bg-blue-600 text-white cursor-not-allowed' 
                    : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                }`}
              >
                {isRecording ? t('settings.recording') : t('settings.record')}
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-1">
               {isRecording 
                 ? t('settings.recordingTip') 
                 : t('settings.globalHotkeyDesc')
               }
             </div>
             {!isRecording && (() => {
               const status = getHotkeyStatus(hotkey);
               return status.message && (
                 <div className={`text-xs mt-1 ${status.color}`}>
                   {status.message}
                 </div>
               );
             })()}
          </div>
        </div>

        {/* 按钮组 */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={cancelSettings}
            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            {t('settings.cancel')}
          </button>
          <button
            onClick={saveSettings}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            {t('settings.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;