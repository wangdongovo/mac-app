import { Card, CardHeader } from '../Card';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ArrowUp, ArrowDown, Activity } from 'lucide-react';

const data = [
  { name: '1', uv: 40, pv: 24 },
  { name: '2', uv: 30, pv: 13 },
  { name: '3', uv: 20, pv: 98 },
  { name: '4', uv: 27, pv: 39 },
  { name: '5', uv: 18, pv: 48 },
  { name: '6', uv: 23, pv: 38 },
  { name: '7', uv: 34, pv: 43 },
  { name: '8', uv: 50, pv: 30 },
  { name: '9', uv: 40, pv: 20 },
  { name: '10', uv: 60, pv: 50 },
];

export function TrafficRealtimeWidget() {
  return (
    <Card className="h-full">
      <CardHeader title="实时流量" icon={Activity} />
      <div className="flex justify-between mb-4 px-1">
        <div>
           <div className="flex items-center text-xs text-purple-500 mb-1 font-medium">
             <ArrowUp className="w-3 h-3 mr-1" /> 上传速度
           </div>
           <div className="text-2xl font-bold text-purple-600">17.5 KB/s</div>
        </div>
        <div className="text-right">
           <div className="flex items-center justify-end text-xs text-blue-500 mb-1 font-medium">
             <ArrowDown className="w-3 h-3 mr-1" /> 下载速度
           </div>
           <div className="text-2xl font-bold text-blue-500">17.7 KB/s</div>
        </div>
      </div>
      <div className="flex-1 min-h-[100px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="uv" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorUv)" strokeWidth={2} />
            <Area type="monotone" dataKey="pv" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPv)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
       <div className="flex justify-between mt-4 text-xs text-gray-400 font-medium">
         <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div> 上传 1.2 MB</span>
         <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> 下载 49.7 MB</span>
       </div>
    </Card>
  )
}
