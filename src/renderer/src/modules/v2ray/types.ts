export interface V2RayNode {
  id: string;
  protocol: 'vmess' | 'vless' | 'shadowsocks' | 'trojan';
  subscriptionId?: string;
  name: string;
  address: string;
  port: number;
  uuid: string;
  alterId: number;
  security: string;
  network: string;
  path?: string;
  host?: string;
  tls?: string;
  latency?: number;
}

export interface V2RaySubscription {
  id: string;
  name: string;
  url: string;
  updatedAt?: number;
  nodes?: V2RayNode[];
}

export interface V2RayConfig {
  log: { loglevel: string };
  inbounds: any[];
  outbounds: any[];
}
