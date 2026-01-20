import { Monitor, Globe } from 'lucide-react';
import { StatusWidget } from './dashboard/StatusWidget';
import { TrafficRealtimeWidget } from './dashboard/TrafficRealtimeWidget';
import { TrafficTrendWidget } from './dashboard/TrafficTrendWidget';
import { TrafficSummaryWidget } from './dashboard/TrafficSummaryWidget';
import { LeaderboardWidget } from './dashboard/LeaderboardWidget';

export function Dashboard() {
  return (
    <div className="p-6 h-full overflow-y-auto no-scrollbar">
      <div className="grid grid-cols-2 gap-4 auto-rows-fr">
        
        {/* Row 1 */}
        <StatusWidget 
          title="运行状态" 
          icon={Monitor}
          metrics={[
            { label: '运行时长', value: '5:02', color: 'text-blue-500' },
            { label: '连接数', value: '16', color: 'text-orange-500' },
            { label: '内存', value: '33 MB', color: 'text-teal-500' },
          ]}
          details={[
            { label: '状态', value: '已连接', indicator: 'bg-green-500' },
            { label: '内核', value: 'Smart', indicator: 'bg-purple-500' },
            { label: '系统', value: 'macOS 26.3' }, 
            { label: '版本', value: '26.5 (125)' },
          ]}
        />
        
        <StatusWidget 
          title="网络状态" 
          icon={Globe}
          metrics={[
            { label: '互联网', value: '403 ms', color: 'text-orange-500' },
            { label: 'DNS', value: '-', color: 'text-gray-400' },
            { label: '路由', value: '5 ms', color: 'text-green-500' },
          ]}
          details={[
            { label: '网络', value: 'Wi-Fi', indicator: 'bg-blue-500' },
            { label: '本地 IP', value: 'CN 深圳 ....168.28.236', indicator: 'bg-indigo-500' }, 
            { label: '代理 IP', value: 'US San Jo...4.21.32.100', indicator: 'bg-green-500' },
          ]}
        />

        {/* Row 2 */}
        <TrafficRealtimeWidget />
        <TrafficTrendWidget />

        {/* Row 3 */}
        <TrafficSummaryWidget />
        <LeaderboardWidget />
        
      </div>
    </div>
  )
}
