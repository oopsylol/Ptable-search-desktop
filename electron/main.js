/**
 * Electron主进程文件
 * 管理应用窗口、系统托盘和全局快捷键
 */
const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, nativeImage } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

/**
 * 应用类
 * 管理Electron应用的生命周期和功能
 */
class PTableApp {
  constructor() {
    this.mainWindow = null;
    this.tray = null;
    this.isQuitting = false;
    
    this.initializeApp();
  }

  /**
   * 初始化应用
   * 设置应用事件监听器
   */
  initializeApp() {
    // 应用准备就绪时创建窗口
    app.whenReady().then(() => {
      this.createWindow();
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
        this.createWindow();
      }
    });

    // 应用退出前的处理
    app.on('before-quit', () => {
      this.isQuitting = true;
    });

    // 应用即将退出时的处理
    app.on('will-quit', () => {
      // 注销所有全局快捷键
      globalShortcut.unregisterAll();
    });
  }

  /**
   * 创建主窗口
   * 设置窗口属性和行为
   */
  createWindow() {
    try {
      // 创建浏览器窗口
      this.mainWindow = new BrowserWindow({
        width: 400,
        height: 500,
        minWidth: 350,
        minHeight: 400,
        maxWidth: 600,
        maxHeight: 700,
        show: false, // 初始不显示，等加载完成后再显示
        autoHideMenuBar: true, // 隐藏菜单栏
        resizable: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          enableRemoteModule: false,
          preload: path.join(__dirname, 'preload.js')
        },
        icon: this.getAppIcon()
      });

      // 加载应用内容
      if (isDev) {
        this.mainWindow.loadURL('http://localhost:3000');
        // 开发模式下打开开发者工具
        this.mainWindow.webContents.openDevTools();
      } else {
        this.mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
      }

      // 窗口准备显示时的处理
      this.mainWindow.once('ready-to-show', () => {
        // 检查是否应该启动时最小化
        const shouldStartMinimized = this.getSettings().start_minimized;
        if (!shouldStartMinimized) {
          this.mainWindow.show();
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

      console.log('Main window created successfully');
    } catch (error) {
      console.error('创建主窗口失败:', error);
    }
  }

  /**
   * 创建系统托盘
   * 设置托盘图标和菜单
   */
  createTray() {
    try {
      const trayIcon = this.getTrayIcon();
      this.tray = new Tray(trayIcon);

      // 设置托盘提示文本
      this.tray.setToolTip('元素周期表查询工具');

      // 创建托盘菜单
      const contextMenu = Menu.buildFromTemplate([
        {
          label: '显示窗口',
          click: () => this.showWindow()
        },
        {
          label: '隐藏窗口',
          click: () => this.hideWindow()
        },
        { type: 'separator' },
        {
          label: '退出应用',
          click: () => this.quitApp()
        }
      ]);

      this.tray.setContextMenu(contextMenu);

      // 双击托盘图标显示/隐藏窗口
      this.tray.on('double-click', () => {
        this.toggleWindow();
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

      const success = globalShortcut.register(hotkey, () => {
        this.toggleWindow();
      });

      if (success) {
        console.log(`Global shortcut ${hotkey} registered successfully`);
      } else {
        console.warn(`Global shortcut ${hotkey} registration failed`);
      }
    } catch (error) {
      console.error('注册全局快捷键失败:', error);
    }
  }

  /**
   * 设置IPC处理器
   * 处理渲染进程的消息
   */
  setupIpcHandlers() {
    // 最小化到托盘
    ipcMain.handle('minimize-to-tray', () => {
      this.hideWindow();
    });

    // 获取应用设置
    ipcMain.handle('get-settings', () => {
      return this.getSettings();
    });

    // 保存应用设置
    ipcMain.handle('save-settings', (event, settings) => {
      this.saveSettings(settings);
    });

    console.log('IPC handlers setup completed');
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