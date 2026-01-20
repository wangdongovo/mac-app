import { Card, CardHeader } from '../Card';

interface StatusWidgetProps {
  title: string;
  icon: any;
  metrics: { label: string; value: string; color?: string; icon?: any }[];
  details: { label: string; value: string; indicator?: string }[];
}

export function StatusWidget({ title, icon, metrics, details }: StatusWidgetProps) {
  return (
    <Card className="h-full">
      <CardHeader title={title} icon={icon} />
      <div className="flex justify-between mb-8 px-2">
        {metrics.map((m, i) => (
          <div key={i} className="flex flex-col">
            <span className="text-xs text-gray-400 mb-2 flex items-center gap-1">
               {m.icon && <m.icon className="w-3 h-3" />}
               {m.label}
            </span>
            <span className={`text-2xl font-bold tracking-tight ${m.color || 'text-gray-700'}`}>{m.value}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-4 bg-gray-50 p-3 rounded-xl mt-auto">
         {details.map((d, i) => (
           <div key={i} className="flex flex-col">
             <span className="text-xs text-gray-400 mb-1 flex items-center gap-1">
               {d.indicator && <span className={`w-2 h-2 rounded-full ${d.indicator}`}></span>}
               {d.label}
             </span>
             <span className="text-xs font-semibold text-gray-700 truncate" title={d.value}>{d.value}</span>
           </div>
         ))}
      </div>
    </Card>
  )
}
