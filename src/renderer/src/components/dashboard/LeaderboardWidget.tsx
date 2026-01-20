import { Card, CardHeader } from '../Card';
import { ListOrdered } from 'lucide-react';

const listData = [
  { policy: 'HK-ViuTV', process: '', interface: '', host: '35.6 MB', color: 'bg-purple-500', width: '90%' },
  { policy: 'HK-HKTV', process: '', interface: '', host: '6.0 MB', color: 'bg-purple-500', width: '20%' },
  { policy: 'DE-Server', process: '', interface: '', host: '4.5 MB', color: 'bg-purple-500', width: '15%' },
  { policy: '直接连接', process: '', interface: '', host: '25.5 KB', color: 'bg-blue-500', width: '1%' },
  { policy: 'TW-FriDay', process: '', interface: '', host: '16.8 KB', color: 'bg-blue-500', width: '1%' },
  { policy: 'KR-Gaming', process: '', interface: '', host: '1.5 KB', color: 'bg-blue-500', width: '1%' },
];

export function LeaderboardWidget() {
  return (
    <Card className="h-full">
      <CardHeader title="排行榜" icon={ListOrdered} />
      
      <div className="flex-1 overflow-auto">
        <div className="flex text-xs font-semibold text-gray-400 mb-3 px-2">
          <div className="flex-[2] flex items-center gap-2">
             <ListOrdered className="w-3 h-3" />
             <span>策略</span>
          </div>
          <div className="flex-1 text-center">进程</div>
          <div className="flex-1 text-center">网络接口</div>
          <div className="flex-[1] text-right">主机名</div>
        </div>

        <div className="space-y-3">
          {listData.map((item, i) => (
            <div key={i} className="flex items-center text-xs text-gray-600 px-2 group hover:bg-gray-50 rounded-lg py-1 transition-colors">
              <div className="flex-[2] flex items-center gap-2 font-medium text-gray-700">
                <div className="w-5 h-5 rounded-md bg-blue-500 text-white flex items-center justify-center text-[10px]">
                  {/* Icon placeholder based on first letter or type */}
                  {item.policy === '直接连接' ? '直' : 'I'}
                </div>
                {item.policy}
              </div>
              <div className="flex-[2] px-2">
                 <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                   <div className={`h-full ${item.color} rounded-full`} style={{ width: item.width }}></div>
                 </div>
              </div>
              <div className="flex-[1] text-right font-mono text-gray-500">{item.host}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
