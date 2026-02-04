import { spawn, exec, ChildProcess } from 'node:child_process';
import util from 'node:util';
import path from 'node:path';
import { app, ipcMain } from 'electron';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
// @ts-ignore
import tcpPing from 'tcp-ping';
const execAsync = util.promisify(exec);

// Helper to set system proxy on macOS
const setSystemProxy = async (enabled: boolean, httpPort = 1087, socksPort = 1080) => {
  if (process.platform !== 'darwin') return; // Only macOS for now

  try {
    // Get all network services
    const { stdout } = await execAsync('networksetup -listallnetworkservices');
    const services = stdout.split('\n').filter(s => s && !s.includes('*')); // Filter out empty lines and those with * (disabled)

    for (const service of services) {
      try {
        if (enabled) {
          // HTTP
          await execAsync(`networksetup -setwebproxy "${service}" 127.0.0.1 ${httpPort}`);
          // HTTPS
          await execAsync(`networksetup -setsecurewebproxy "${service}" 127.0.0.1 ${httpPort}`);
          // SOCKS
          await execAsync(`networksetup -setsocksfirewallproxy "${service}" 127.0.0.1 ${socksPort}`);
          // Turn on (ensure they are actually on)
           await execAsync(`networksetup -setwebproxystate "${service}" on`);
           await execAsync(`networksetup -setsecurewebproxystate "${service}" on`);
           await execAsync(`networksetup -setsocksfirewallproxystate "${service}" on`);
        } else {
          // Turn off
          await execAsync(`networksetup -setwebproxystate "${service}" off`);
          await execAsync(`networksetup -setsecurewebproxystate "${service}" off`);
          await execAsync(`networksetup -setsocksfirewallproxystate "${service}" off`);
        }
      } catch (e) {
        // Ignore errors for services that might not exist or be active or read-only
        // console.error(`Failed to set proxy for ${service}`, e);
      }
    }
  } catch (e) {
    console.error('Failed to list network services', e);
  }
};

// Placeholder for V2Ray config types - can be expanded
interface V2RayConfig {
  log: { loglevel: string };
  inbounds: any[];
  outbounds: any[];
  [key: string]: any;
}

export class V2RayService {
  private process: ChildProcess | null = null;
  private binPath: string;
  private configPath: string;

  constructor() {
    // Assuming v2ray binary is in resources folder or parallel to app
    // For dev: maybe in a specific 'bin' folder
    const isDev = process.env.NODE_ENV === 'development';
    const platform = process.platform;
    
    let binName = 'v2ray';
    if (platform === 'win32') binName = 'v2ray.exe';

    // Simplified path resolution for now - expecting it in 'bin' folder in project root or resources
    this.binPath = isDev 
      ? path.join(process.cwd(), 'bin', binName)
      : path.join(process.resourcesPath, 'bin', binName);
      
    this.configPath = path.join(app.getPath('userData'), 'v2ray_config.json');
  }

  async start(config: V2RayConfig): Promise<{ success: boolean; message?: string }> {
    if (this.process) {
      return { success: false, message: 'V2Ray is already running' };
    }

    if (!existsSync(this.binPath)) {
        return { success: false, message: `V2Ray binary not found at ${this.binPath}` };
    }

    try {
      // Write config to file
      await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));

      this.process = spawn(this.binPath, ['run', '-c', this.configPath]);

      this.process.stdout?.on('data', (data) => {
        console.log(`V2Ray: ${data}`);
      });

      this.process.stderr?.on('data', (data) => {
        console.error(`V2Ray Error: ${data}`);
      });

      this.process.on('close', (code) => {
        console.log(`V2Ray exited with code ${code}`);
        this.process = null;
        setSystemProxy(false); // Ensure proxy is off when process dies
      });
      
      await setSystemProxy(true); // Enable proxy
      
      return { success: true };
    } catch (err: any) {
        console.error('Failed to start V2Ray', err);
        return { success: false, message: err.message || 'Unknown error' };
    }
  }

  async stop(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
    await setSystemProxy(false);
  }

  getStatus(): boolean {
    return !!this.process;
  }

  async ping(address: string, port: number): Promise<number> {
      return new Promise((resolve) => {
          tcpPing.ping({ address, port, attempts: 1, timeout: 2000 }, (err: any, data: any) => {
              if (err || !data || data.results.length === 0 || data.results[0].err) {
                  resolve(-1); // Error or timeout
              } else {
                  resolve(Math.round(data.avg));
              }
          });
      });
  }

  async fetchSubscription(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Failed to fetch subscription', error);
      throw error;
    }
  }
}

export const registerV2RayHandlers = () => {
    const service = new V2RayService();

    ipcMain.handle('v2ray:connect', async (_, config: V2RayConfig) => {
        return await service.start(config);
    });

    ipcMain.handle('v2ray:disconnect', async () => {
        await service.stop();
        return true;
    });

    ipcMain.handle('v2ray:status', () => {
        return service.getStatus();
    });

    ipcMain.handle('v2ray:ping', async (_, { address, port }: { address: string, port: number }) => {
        return await service.ping(address, port);
    });

    ipcMain.handle('v2ray:fetchSubscription', async (_, url: string) => {
        return await service.fetchSubscription(url);
    });
};
