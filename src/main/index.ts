import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import fs from 'node:fs/promises'
import os from 'node:os'
import { exec } from 'node:child_process'
import util from 'node:util'
import started from 'electron-squirrel-startup'
import { registerV2RayHandlers } from './v2ray'

const execAsync = util.promisify(exec)

// Setup IPC handlers
ipcMain.handle('fs:readDir', async (_, dirPath) => {
  try {
    const targetPath = dirPath || process.cwd()
    const files = await fs.readdir(targetPath)
    return files
  } catch (error) {
    console.error('Failed to read directory', error)
    return []
  }
})

ipcMain.handle('system:getOverview', async () => {
  try {
    // 1. Serial Number (macOS)
    let serialNumber = 'Unknown'
    try {
      const { stdout } = await execAsync('ioreg -l | grep IOPlatformSerialNumber')
      const match = stdout.match(/"IOPlatformSerialNumber"\s*=\s*"(.+)"/)
      if (match && match[1]) {
        serialNumber = match[1]
      }
    } catch (e) {
      console.error('Failed to get serial number', e)
    }

    // 2. Network Info
    let ip = 'Unknown'
    const interfaces = os.networkInterfaces()
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          ip = iface.address
          break
        }
      }
      if (ip !== 'Unknown') break
    }

    let gateway = 'Unknown'
    try {
      const { stdout } = await execAsync('route -n get default')
      const match = stdout.match(/gateway:\s+(.+)/)
      if (match && match[1]) gateway = match[1]
    } catch (e) {
      // ignore
    }

    const dns: string[] = []
    try {
      const { stdout } = await execAsync('scutil --dns')
      const matches = stdout.matchAll(/nameserver\[\d+\]\s*:\s*(.+)/g)
      for (const m of matches) {
        if (!dns.includes(m[1])) dns.push(m[1])
      }
    } catch (e) {
      // ignore
    }

    // 3. Node/NPM
    let nodeVersion = 'Unknown'
    let npmVersion = 'Unknown'
    let npmRegistry = 'Unknown'

    const env = { ...process.env, PATH: '/usr/local/bin:/opt/homebrew/bin:' + (process.env.PATH || '') }

    try {
      const { stdout } = await execAsync('node -v', { env })
      nodeVersion = stdout.trim()
    } catch (e) {
      // ignore
    }

    try {
      const { stdout } = await execAsync('npm -v', { env })
      npmVersion = stdout.trim()
    } catch (e) {
      // ignore
    }

    try {
      const { stdout } = await execAsync('npm config get registry', { env })
      npmRegistry = stdout.trim()
    } catch (e) {
      // ignore
    }

    return {
      serialNumber,
      network: {
        ip,
        gateway,
        dns,
      },
      devEnv: {
        nodeVersion,
        npmVersion,
        npmRegistry,
      },
    }
  } catch (error) {
    console.error('System info error', error)
    throw error
  }
})

// Image Cache logic
let CACHE_DIR: string;

function registerImageHandlers() {
  CACHE_DIR = path.join(app.getPath('userData'), 'image-cache');

  ipcMain.handle('image:saveToCache', async (_, { fileName, dataUrl }) => {
    try {
      await fs.mkdir(CACHE_DIR, { recursive: true });
      const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
      const filePath = path.join(CACHE_DIR, fileName);
      await fs.writeFile(filePath, base64Data, 'base64');
      return filePath;
    } catch (error) {
      console.error('Failed to save image to cache', error);
      throw error;
    }
  });

  ipcMain.handle('image:getCacheSize', async () => {
    try {
      await fs.mkdir(CACHE_DIR, { recursive: true });
      const files = await fs.readdir(CACHE_DIR);
      let totalSize = 0;
      for (const file of files) {
        const stats = await fs.stat(path.join(CACHE_DIR, file));
        totalSize += stats.size;
      }
      return totalSize;
    } catch (error) {
      console.error('Failed to get cache size', error);
      return 0;
    }
  });

  ipcMain.handle('image:clearCache', async () => {
    try {
      const files = await fs.readdir(CACHE_DIR);
      for (const file of files) {
        await fs.unlink(path.join(CACHE_DIR, file));
      }
      return true;
    } catch (error) {
      console.error('Failed to clear cache', error);
      return false;
    }
  });
}


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit()
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 1100,
    minHeight: 800,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 14, y: 14 },
    frame: false,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    )
  }

  // Open the DevTools.
  // 开发环境打开控制台
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  registerImageHandlers();
  registerV2RayHandlers();
  createWindow();
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
