export interface SystemInfo {
  serialNumber: string;
  network: {
    ip: string;
    gateway: string;
    dns: string[];
  };
  devEnv: {
    nodeVersion: string;
    npmVersion: string;
    npmRegistry: string;
  };
}

export interface IElectronAPI {
  versions: {
    node: () => string;
    chrome: () => string;
    electron: () => string;
  };
  fs: {
    readDir: (path: string) => Promise<string[]>;
  };
  system: {
    getOverview: () => Promise<SystemInfo>;
  };
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}