/**
 * Electron主进程文件
 * 管理应用窗口、系统托盘和全局快捷键
 */
const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, nativeImage } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// 设置控制台输出编码为UTF-8，解决中文乱码问题
if (process.platform === 'win32') {
  // 在Windows上设置控制台代码页为UTF-8
  process.env.CHCP = '65001';
  // 重写console.log以确保正确的编码输出
  const originalLog = console.log;
  console.log = (...args) => {
    const message = args.map(arg => 
      typeof arg === 'string' ? Buffer.from(arg, 'utf8').toString('utf8') : arg
    );
    originalLog.apply(console, message);
  };
}

/**
 * 应用类
 * 管理Electron应用的生命周期和功能
 */
class PTableApp {
  constructor() {
    this.mainWindow = null;
    this.settingsWindow = null; // 设置窗口
    this.tray = null;
    this.isQuitting = false;
    this.currentHotkey = null; // 当前注册的快捷键
    
    this.initializeApp();
  }

  /**
   * 初始化应用
   * 设置应用事件监听器
   */
  initializeApp() {
    // 应用准备就绪时创建窗口
    app.whenReady().then(() => {
      this.createMainWindow();
      this.createTray();
      this.registerGlobalShortcuts();
      this.setupIpcHandlers();
    });

    // 所有窗口关闭时的处理
    app.on('window-all-closed', () => {
      // 在macOS上，除非用户明确退出，否则保持应用运行
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // 应用激活时的处理
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });

    // 应用退出前的处理
    app.on('before-quit', () => {
      this.isQuitting = true;
      if (this.settingsWindow) {
        this.settingsWindow.destroy();
        this.settingsWindow = null;
      }
    });

    // 应用即将退出时的处理
    app.on('will-quit', () => {
      // 注销所有全局快捷键
      globalShortcut.unregisterAll();
    });
  }

  /**
   * 创建主窗口
   * 初始化应用的主要界面窗口
   */
  createMainWindow() {
    try {
      // 创建浏览器窗口
      this.mainWindow = new BrowserWindow({
          width: 340,
          height: 400, // 增加初始高度以显示搜索结果
          minWidth: 340,
          minHeight: 120,
          maxWidth: 340,
          maxHeight: 800, // 允许搜索结果展开时增加高度
          show: false, // 初始时不显示窗口
          frame: false, // 隐藏窗口边框和标题栏
          autoHideMenuBar: true, // 隐藏菜单栏
        resizable: true, // 允许调整大小以适应搜索结果
        titleBarStyle: 'hidden', // 隐藏标题栏
        frame: false, // 无边框窗口
        transparent: true, // 透明窗口
        alwaysOnTop: true, // 始终置顶
        skipTaskbar: true, // 不在任务栏显示
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          enableRemoteModule: false,
          preload: path.join(__dirname, 'preload.js'),
          webSecurity: false,
          allowRunningInsecureContent: true
        },
        icon: path.join(__dirname, '../assets/icon.png') // 应用图标
      });

      // 自动隐藏定时器
      this.autoHideTimer = null;
      this.autoHideDelay = 10000; // 默认10秒

      // 清除缓存
      this.mainWindow.webContents.session.clearCache();
      this.mainWindow.webContents.session.clearStorageData();
      
      // 加载应用内容
      if (isDev) {
        this.mainWindow.loadURL('http://localhost:3000');
      } else {
        this.mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
      }

      // 窗口准备显示时的处理
      this.mainWindow.once('ready-to-show', () => {
        // 检查是否应该启动时最小化
        const shouldStartMinimized = this.getSettings().start_minimized;
        if (!shouldStartMinimized) {
          this.mainWindow.show();
          this.startAutoHideTimer(); // 启动自动隐藏定时器
        }
      });

      // 窗口关闭时的处理
      this.mainWindow.on('close', (event) => {
        if (!this.isQuitting) {
          event.preventDefault();
          this.mainWindow.hide();
        }
      });

      // 窗口最小化时的处理
      this.mainWindow.on('minimize', () => {
        this.mainWindow.hide();
      });

      // 窗口获得焦点时重置定时器
      this.mainWindow.on('focus', () => {
        this.startAutoHideTimer();
      });

      // 窗口失去焦点时启动定时器
      this.mainWindow.on('blur', () => {
        this.startAutoHideTimer();
      });

      // 窗口隐藏时清除定时器
      this.mainWindow.on('hide', () => {
        this.clearAutoHideTimer();
      });

      // 窗口关闭时清除定时器
      this.mainWindow.on('closed', () => {
        this.clearAutoHideTimer();
        this.mainWindow = null;
      });

      console.log('应用窗口创建成功');
    } catch (error) {
      console.error('创建主窗口失败:', error);
    }
  }


  


  /**
   * 启动自动隐藏定时器
   */
  startAutoHideTimer() {
    this.clearAutoHideTimer();
    this.autoHideTimer = setTimeout(() => {
      if (this.mainWindow && this.mainWindow.isVisible()) {
        this.mainWindow.hide();
      }
    }, this.autoHideDelay);
  }

  /**
   * 清除自动隐藏定时器
   */
  clearAutoHideTimer() {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }
  }

  /**
   * 创建默认图标
   * 当找不到图标文件时使用
   */
  createDefaultIcon() {
    // 创建一个16x16的简单图标
    const canvas = {
      width: 16,
      height: 16
    };
    
    // 创建一个简单的图标数据
    const iconData = Buffer.alloc(canvas.width * canvas.height * 4);
    
    // 填充为蓝色
    for (let i = 0; i < iconData.length; i += 4) {
      iconData[i] = 59;     // R
      iconData[i + 1] = 130; // G
      iconData[i + 2] = 246; // B
      iconData[i + 3] = 255; // A
    }
    
    return nativeImage.createFromBuffer(iconData, {
      width: canvas.width,
      height: canvas.height
    });
  }

  /**
   * 清空搜索内容
   */
  clearSearch() {
    if (this.mainWindow) {
      this.mainWindow.webContents.send('clear-search');
    }
  }

  /**
   * 创建设置窗口
   * 创建独立的设置窗口
   */
  createSettingsWindow() {
    try {
      // 如果设置窗口已存在，直接显示
      if (this.settingsWindow) {
        this.settingsWindow.show();
        this.settingsWindow.focus();
        return;
      }

      // 创建设置窗口
      this.settingsWindow = new BrowserWindow({
        width: 400,
        height: 500,
        minWidth: 380,
        minHeight: 450,
        maxWidth: 500,
        maxHeight: 600,
        show: false,
        frame: true, // 显示窗口边框和标题栏
        autoHideMenuBar: true,
        resizable: true,
        titleBarStyle: 'default',
        transparent: false,
        alwaysOnTop: false,
        skipTaskbar: false, // 在任务栏显示
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          enableRemoteModule: false,
          preload: path.join(__dirname, 'preload.js'),
          webSecurity: false,
          allowRunningInsecureContent: true
        },
        icon: path.join(__dirname, '../assets/icon.png'),
        title: '应用设置 - 元素周期表查询'
      });

      // 加载设置页面内容
      if (isDev) {
        // 开发模式下加载独立的设置页面
        this.settingsWindow.loadFile(path.join(__dirname, '../public/settings.html'));
      } else {
        // 生产模式下加载独立的设置页面
        this.settingsWindow.loadFile(path.join(__dirname, '../public/settings.html'));
      }

      // 窗口准备显示时的处理
      this.settingsWindow.once('ready-to-show', () => {
        this.settingsWindow.show();
        this.settingsWindow.focus();
      });

      // 窗口关闭时的处理
      this.settingsWindow.on('closed', () => {
        this.settingsWindow = null;
      });

      console.log('Settings window created successfully');
    } catch (error) {
      console.error('创建设置窗口失败:', error);
    }
  }

  /**
   * 显示设置窗口
   */
  showSettings() {
    this.createSettingsWindow();
  }

  /**
   * 创建系统托盘
   * 在系统托盘中显示应用图标和右键菜单
   */
  createTray() {
    try {
      // 使用assets目录下的图标文件
      const iconPath = path.join(__dirname, '../assets/icon.png');
      let trayIcon;
      
      try {
        // 检查图标文件是否存在
        const fs = require('fs');
        if (fs.existsSync(iconPath)) {
          trayIcon = iconPath;
        } else {
          console.warn('图标文件不存在，使用默认图标');
          trayIcon = this.createDefaultIcon();
        }
      } catch (error) {
        console.warn('加载图标文件失败，使用默认图标:', error.message);
        trayIcon = this.createDefaultIcon();
      }
      
      this.tray = new Tray(trayIcon);
      
      // 设置托盘提示文本
      this.tray.setToolTip('元素周期表查询');
      
      // 创建右键菜单
      const contextMenu = Menu.buildFromTemplate([
        {
          label: '显示',
          click: () => {
            if (this.mainWindow) {
              this.mainWindow.show();
              this.mainWindow.focus();
              this.startAutoHideTimer();
            }
          }
        },
        {
          label: '设置',
          click: () => {
            this.showSettings();
          }
        },
        {
          label: '清空搜索',
          click: () => {
            this.clearSearch();
          }
        },
        {
          type: 'separator'
        },
        {
          label: '退出',
          click: () => {
            app.quit();
          }
        }
      ]);
      
      // 设置托盘右键菜单
      this.tray.setContextMenu(contextMenu);
      
      // 托盘图标点击事件
      this.tray.on('click', () => {
        if (this.mainWindow) {
          if (this.mainWindow.isVisible()) {
            this.mainWindow.hide();
          } else {
            this.mainWindow.show();
            this.mainWindow.focus();
            this.startAutoHideTimer();
          }
        }
      });

      console.log('System tray created successfully');
    } catch (error) {
      console.error('创建系统托盘失败:', error);
    }
  }

  /**
   * 注册全局快捷键
   * 设置快捷键用于显示/隐藏窗口
   */
  registerGlobalShortcuts() {
    try {
      const settings = this.getSettings();
      const hotkey = settings.hotkey || 'Ctrl+Shift+E';
      this.currentHotkey = hotkey;

      const success = globalShortcut.register(hotkey, () => {
        this.toggleWindow();
      });

      if (success) {
        console.log('全局快捷键注册成功:', hotkey);
      } else {
        console.warn('[全局快捷键注册失败]', hotkey);
      }
    } catch (error) {
      console.error('[注册全局快捷键失败]', error);
    }
  }

  /**
   * 更新全局快捷键
   * 动态更新快捷键设置
   * @param {string} newHotkey - 新的快捷键
   */
  updateHotkey(newHotkey) {
    try {
      // 验证快捷键格式
      if (!this.isValidHotkey(newHotkey)) {
        console.error('[快捷键格式无效]', newHotkey);
        return false;
      }

      // 注销当前快捷键
      if (this.currentHotkey) {
        globalShortcut.unregister(this.currentHotkey);
        console.log('已注销快捷键:', this.currentHotkey);
      }

      // 注册新快捷键
      const success = globalShortcut.register(newHotkey, () => {
        this.toggleWindow();
      });

      if (success) {
        this.currentHotkey = newHotkey;
        console.log('快捷键更新成功:', newHotkey);
        return true;
      } else {
        console.warn('[快捷键注册失败]', newHotkey);
        // 如果新快捷键注册失败，尝试恢复原快捷键
        if (this.currentHotkey) {
          globalShortcut.register(this.currentHotkey, () => {
            this.toggleWindow();
          });
        }
        return false;
      }
    } catch (error) {
      console.error('[更新快捷键失败]', error);
      return false;
    }
  }

  /**
   * 验证快捷键格式
   * @param {string} hotkey - 快捷键字符串
   * @returns {boolean} 是否有效
   */
  isValidHotkey(hotkey) {
    if (!hotkey || typeof hotkey !== 'string') {
      return false;
    }

    const parts = hotkey.split('+');
    if (parts.length < 2) {
      return false;
    }

    const modifiers = ['Ctrl', 'Alt', 'Shift', 'Meta', 'Cmd', 'Command'];
    const hasModifier = parts.some(part => modifiers.includes(part));

    return hasModifier;
  }

  /**
   * 设置IPC处理器
   * 处理渲染进程发送的消息
   */
  setupIpcHandlers() {
    try {
      // 处理最小化到托盘的请求
      ipcMain.on('minimize-to-tray', () => {
        if (this.mainWindow) {
          this.mainWindow.hide();
        }
      });

      // 处理更新设置的请求
      ipcMain.on('update-settings', (event, settings) => {
        try {
          if (settings.autoHideDelay) {
            this.autoHideDelay = settings.autoHideDelay;
            console.log('自动隐藏时间已更新:', this.autoHideDelay / 1000, '秒');
          }
          
          if (settings.hotkey) {
            this.updateHotkey(settings.hotkey);
          }
        } catch (error) {
          console.error('[更新设置失败]', error);
        }
      });

      // 处理获取应用版本的请求
      ipcMain.handle('get-app-version', () => {
        return app.getVersion();
      });

      // 处理获取系统信息的请求
      ipcMain.handle('get-system-info', () => {
        return {
          platform: process.platform,
          arch: process.arch,
          version: process.version
        };
      });

      // 处理关闭设置窗口的请求
      ipcMain.on('close-settings-window', () => {
        if (this.settingsWindow) {
          this.settingsWindow.close();
        }
      });

      // 处理显示设置窗口的请求
      ipcMain.on('show-settings-window', () => {
        this.showSettings();
      });

      console.log('IPC handlers setup completed');
    } catch (error) {
      console.error('设置IPC处理器失败:', error);
    }
  }

  /**
   * 显示窗口
   */
  showWindow() {
    if (this.mainWindow) {
      this.mainWindow.show();
      this.mainWindow.focus();
    }
  }

  /**
   * 隐藏窗口
   */
  hideWindow() {
    if (this.mainWindow) {
      this.mainWindow.hide();
    }
  }

  /**
   * 切换窗口显示状态
   */
  toggleWindow() {
    if (this.mainWindow) {
      if (this.mainWindow.isVisible()) {
        this.hideWindow();
      } else {
        this.showWindow();
      }
    }
  }

  /**
   * 退出应用
   */
  quitApp() {
    this.isQuitting = true;
    app.quit();
  }

  /**
   * 获取应用图标
   */
  getAppIcon() {
    // 创建一个简单的应用图标
    const iconPath = path.join(__dirname, '../assets/icon.png');
    // 如果图标文件不存在，返回null使用默认图标
    try {
      return nativeImage.createFromPath(iconPath);
    } catch {
      return null;
    }
  }

  /**
   * 获取托盘图标
   */
  getTrayIcon() {
    // 创建一个简单的托盘图标
    const trayIconPath = path.join(__dirname, '../assets/tray-icon.png');
    try {
      return nativeImage.createFromPath(trayIconPath);
    } catch {
      // 如果图标文件不存在，创建一个简单的图标
      return nativeImage.createEmpty();
    }
  }

  /**
   * 获取应用设置
   */
  getSettings() {
    // 这里可以从文件或注册表读取设置
    // 暂时返回默认设置
    return {
      start_minimized: true,
      theme: 'light',
      hotkey: 'Ctrl+Shift+E',
      show_atomic_weight: true,
      show_category: true,
      window_size: {
        width: 400,
        height: 500
      }
    };
  }

  /**
   * 保存应用设置
   */
  saveSettings(settings) {
    // 这里可以将设置保存到文件或注册表
    console.log('保存设置:', settings);
  }
}

// 创建应用实例
new PTableApp();

// 防止应用被垃圾回收
app.on('ready', () => {
  console.log('Periodic Table Query App started');
});