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
   * 初始化应用的主要界面窗口
   */
  createMainWindow() {
    try {
      // 创建浏览器窗口
      this.mainWindow = new BrowserWindow({
          width: 340,
          height: 120,
          minWidth: 340,
          minHeight: 120,
          maxWidth: 340,
          maxHeight: 550, // 允许搜索结果展开时增加高度
          show: false, // 初始时不显示窗口
          frame: false, // 隐藏窗口边框和标题栏
          autoHideMenuBar: true, // 隐藏菜单栏
        resizable: false, // 禁止调整大小
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
      
      // 添加调试事件监听器
      this.setupDebugListeners();
      
      // 加载应用内容
      if (isDev) {
        console.log('🚀 开发模式：加载 http://localhost:3000');
        this.mainWindow.loadURL('http://localhost:3000');
        // 开发模式下始终打开开发者工具
        this.mainWindow.webContents.openDevTools({ mode: 'detach' });
      } else {
        console.log('📦 生产模式：加载本地文件');
        this.mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
      }
      
      // 页面加载完成后的处理
      this.mainWindow.webContents.once('did-finish-load', () => {
        console.log('✅ 页面加载完成');
        // 注入调试脚本
        this.injectDebugScript();
      });

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

      console.log('Main window created successfully');
    } catch (error) {
      console.error('创建主窗口失败:', error);
    }
  }

  /**
   * 设置调试事件监听器
   * 监控资源加载和网络请求
   */
  setupDebugListeners() {
    if (!this.mainWindow) return;
    
    const webContents = this.mainWindow.webContents;
    
    // 监听页面开始加载
    webContents.on('did-start-loading', () => {
      console.log('🔄 页面开始加载...');
    });
    
    // 监听页面加载完成
    webContents.on('did-finish-load', () => {
      console.log('✅ 页面加载完成');
    });
    
    // 监听页面加载失败
    webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error('❌ 页面加载失败:', {
        errorCode,
        errorDescription,
        url: validatedURL
      });
    });
    
    // 监听资源加载
    webContents.session.webRequest.onBeforeRequest((details, callback) => {
      console.log('📥 请求资源:', details.url);
      if (details.url.includes('.css')) {
        console.log('🎨 CSS文件请求:', details.url);
      }
      callback({});
    });
    
    // 监听资源加载完成
    webContents.session.webRequest.onCompleted((details) => {
      if (details.url.includes('.css')) {
        console.log('✅ CSS文件加载完成:', {
          url: details.url,
          statusCode: details.statusCode,
          responseHeaders: details.responseHeaders
        });
      }
    });
    
    // 监听资源加载错误
    webContents.session.webRequest.onErrorOccurred((details) => {
      console.error('❌ 资源加载错误:', {
        url: details.url,
        error: details.error
      });
      if (details.url.includes('.css')) {
        console.error('🚨 CSS文件加载失败:', details.url);
      }
    });
    
    // 监听控制台消息
    webContents.on('console-message', (event, level, message, line, sourceId) => {
      const levelMap = { 0: 'LOG', 1: 'WARN', 2: 'ERROR' };
      console.log(`[${levelMap[level] || 'INFO'}] ${message}`);
      if (sourceId) {
        console.log(`  来源: ${sourceId}:${line}`);
      }
    });
  }
  
  /**
   * 注入调试脚本
   * 在页面中注入JavaScript代码来检查CSS加载情况
   */
  injectDebugScript() {
    if (!this.mainWindow) return;
    
    const debugScript = `
      console.log('🔍 开始CSS调试检查...');
      
      // 检查所有link标签
      const linkTags = document.querySelectorAll('link[rel="stylesheet"]');
      console.log('📋 找到', linkTags.length, '个CSS链接:');
      linkTags.forEach((link, index) => {
        console.log(\`  \${index + 1}. \${link.href}\`);
        
        // 检查CSS是否加载成功
        if (link.sheet) {
          console.log('    ✅ CSS样式表已加载，规则数量:', link.sheet.cssRules ? link.sheet.cssRules.length : '无法访问');
        } else {
          console.log('    ❌ CSS样式表未加载');
        }
      });
      
      // 检查style标签
      const styleTags = document.querySelectorAll('style');
      console.log('📋 找到', styleTags.length, '个内联样式标签');
      styleTags.forEach((style, index) => {
        console.log(\`  \${index + 1}. 内容长度: \${style.textContent.length} 字符\`);
      });
      
      // 检查Tailwind CSS类是否存在
      const testElement = document.createElement('div');
      testElement.className = 'bg-blue-500 p-4 rounded-lg';
      document.body.appendChild(testElement);
      
      setTimeout(() => {
        const computedStyle = window.getComputedStyle(testElement);
        console.log('🎨 Tailwind CSS测试:');
        console.log('  背景色:', computedStyle.backgroundColor);
        console.log('  内边距:', computedStyle.padding);
        console.log('  圆角:', computedStyle.borderRadius);
        
        if (computedStyle.backgroundColor === 'rgba(0, 0, 0, 0)' || computedStyle.backgroundColor === 'transparent') {
          console.error('🚨 Tailwind CSS可能未正确加载！');
        } else {
          console.log('✅ Tailwind CSS正常工作');
        }
        
        document.body.removeChild(testElement);
      }, 100);
      
      // 检查网络请求
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        console.log('🌐 Fetch请求:', args[0]);
        return originalFetch.apply(this, args);
      };
    `;
    
    this.mainWindow.webContents.executeJavaScript(debugScript)
      .then(() => {
        console.log('✅ 调试脚本注入成功');
      })
      .catch((error) => {
        console.error('❌ 调试脚本注入失败:', error);
      });
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
   * 显示设置窗口
   */
  showSettings() {
    if (this.mainWindow) {
      this.mainWindow.webContents.send('show-settings');
      this.mainWindow.show();
      this.mainWindow.focus();
      this.startAutoHideTimer();
    }
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
            console.log('自动隐藏时间已更新为:', this.autoHideDelay / 1000, '秒');
          }
        } catch (error) {
          console.error('更新设置失败:', error);
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