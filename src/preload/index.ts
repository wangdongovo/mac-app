import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  versions: {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
  },
  fs: {
    readDir: (path: string) => ipcRenderer.invoke('fs:readDir', path),
  },
  system: {
    getOverview: () => ipcRenderer.invoke('system:getOverview'),
  },
  image: {
    saveToCache: (args: { fileName: string; dataUrl: string }) => ipcRenderer.invoke('image:saveToCache', args),
    getCacheSize: () => ipcRenderer.invoke('image:getCacheSize'),
    clearCache: () => ipcRenderer.invoke('image:clearCache'),
  },
});