import { useEffect, useState } from 'react'
import {
  LayoutGrid,
  Copy,
  Check,
  Server,
  Network,
  Terminal,
} from 'lucide-react'
import { SystemInfo } from '@common/types'

export function OverviewPage() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    window.electronAPI.system.getOverview().then(setSystemInfo)
  }, [])

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="p-6 h-full overflow-y-auto no-scrollbar no-drag">
      <div className="flex items-center gap-2 mb-6">
        <LayoutGrid className="w-6 h-6 text-blue-500" />
        <h1 className="text-2xl font-bold text-gray-800">设备概览</h1>
      </div>

      <div className="grid grid-cols-1 rounded-2xl">
        {/* Computer Config / System Info */}
        <div className="bg-white p-6 ">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-gray-500" />
            电脑配置
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl">
              <div className="text-sm text-gray-500 mb-1">序列号</div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900 truncate">
                  {systemInfo?.serialNumber || '获取中...'}
                </span>
                {systemInfo?.serialNumber && (
                  <button
                    onClick={() =>
                      handleCopy(systemInfo.serialNumber, 'serial')
                    }
                    className="text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                    title="复制序列号"
                  >
                    {copiedField === 'serial' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
            {/* Placeholder for other config info if needed */}
            <div className="p-4  rounded-xl">
              <div className="text-sm text-gray-500 mb-1">系统信息</div>
              <div className="text-xl font-bold text-gray-900">macOS</div>
            </div>
          </div>
        </div>

        {/* Network Status */}
        <div className="bg-white p-6 ">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Network className="w-5 h-5 text-gray-500" />
            网络状态
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4  rounded-xl">
              <div className="text-sm text-gray-500 mb-1">IP 地址</div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900 truncate">
                  {systemInfo?.network.ip || '获取中...'}
                </span>
                {systemInfo?.network.ip && (
                  <button
                    onClick={() => handleCopy(systemInfo.network.ip, 'ip')}
                    className="text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                    title="复制 IP"
                  >
                    {copiedField === 'ip' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="p-4  rounded-xl">
              <div className="text-sm text-gray-500 mb-1">网关</div>
              <div className="text-lg font-bold text-gray-900 truncate">
                {systemInfo?.network.gateway || '未知'}
              </div>
            </div>
            <div className="p-4  rounded-xl">
              <div className="text-sm text-gray-500 mb-1">DNS</div>
              <div className="text-sm font-bold text-gray-900 break-all">
                {systemInfo?.network.dns.length > 0
                  ? systemInfo.network.dns.join(', ')
                  : '未知'}
              </div>
            </div>
          </div>
        </div>

        {/* Development Environment */}
        <div className="bg-white p-6 ">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-gray-500" />
            开发环境
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4  rounded-xl">
              <div className="text-sm text-gray-500 mb-1">Node 版本</div>
              <div className="text-lg font-bold text-gray-900">
                {systemInfo?.devEnv.nodeVersion || '未找到'}
              </div>
            </div>
            <div className="p-4  rounded-xl">
              <div className="text-sm text-gray-500 mb-1">NPM 版本</div>
              <div className="text-lg font-bold text-gray-900">
                {systemInfo?.devEnv.npmVersion || '未找到'}
              </div>
            </div>
            <div className="p-4  rounded-xl md:col-span-1">
              <div className="text-sm text-gray-500 mb-1">NPM 源</div>
              <div className="text-sm font-bold text-gray-900 break-all">
                {systemInfo?.devEnv.npmRegistry || '未知'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
