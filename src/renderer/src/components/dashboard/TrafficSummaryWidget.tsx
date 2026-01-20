import { Card, CardHeader } from '../Card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const data = [
  { name: 'Upload', value: 25.5 },
  { name: 'Download', value: 45.3 },
  { name: 'Direct', value: 25.5 },
  { name: 'Proxy', value: 46.2 },
];

const COLORS = ['#a78bfa', '#60a5fa', '#c4b5fd', '#3b82f6'];

export function TrafficSummaryWidget() {
  return (
    <Card className="h-full">
      <CardHeader title="流量汇总" icon={PieChartIcon} />
      
      <div className="flex justify-center gap-4 mb-4 text-xs font-medium">
        <span className="px-3 py-1 bg-gray-100 rounded-md text-gray-800 cursor-pointer">今天</span>
        <span className="px-3 py-1 text-gray-400 cursor-pointer hover:bg-gray-50 rounded-md">本月</span>
        <span className="px-3 py-1 text-gray-400 cursor-pointer hover:bg-gray-50 rounded-md">上月</span>
      </div>

      <div className="flex flex-1 items-center gap-8">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={75}
                paddingAngle={0}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-xs text-gray-400 mb-1">总计</div>
            <div className="text-xl font-bold text-gray-800">46.2 MB</div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-y-4 gap-x-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center text-[10px]">↑</div>
            <div className="text-xs text-gray-500">上传 986.0 KB</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center text-[10px]">↓</div>
            <div className="text-xs text-gray-500">下载 45.3 MB</div>
          </div>
          <div className="col-span-2">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-300"></div> 直接连接</span>
              <span>25.5 KB</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-300 w-[10%]"></div>
            </div>
          </div>
          <div className="col-span-2">
             <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div> 策略</span>
              <span>46.2 MB</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 w-[80%]"></div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
