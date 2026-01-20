export interface IElectronAPI {
  versions: {
    node: () => string;
    chrome: () => string;
    electron: () => string;
  };
  fs: {
    readDir: (path: string) => Promise<string[]>;
  };
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}