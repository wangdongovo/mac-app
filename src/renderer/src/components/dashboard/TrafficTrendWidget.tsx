import { Card, CardHeader } from '../Card';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';
import { Calendar } from 'lucide-react';

const data = [
  { name: '周日', uv: 0 },
  { name: '周六', uv: 0 },
  { name: '周五', uv: 0 },
  { name: '周四', uv: 0 },
  { name: '周三', uv: 0 },
  { name: '周二', uv: 0 },
  { name: '周一', uv: 4000 },
];

export function TrafficTrendWidget() {
  return (
    <Card className="h-full">
      <CardHeader title="7 天流量趋势" icon={Calendar} />
      
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-1">日均</div>
        <div className="text-2xl font-bold text-gray-800">0 KB</div>
      </div>

      <div className="flex-1 min-h-[100px] w-full relative">
         <div className="absolute top-1/2 w-full border-t border-dashed border-orange-300 z-0"></div>
         <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <Bar dataKey="uv" fill="#e5e7eb" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 6 ? '#f97316' : '#e5e7eb'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        {data.map((d, i) => (
          <span key={i}>{d.name}</span>
        ))}
      </div>
    </Card>
  )
}
