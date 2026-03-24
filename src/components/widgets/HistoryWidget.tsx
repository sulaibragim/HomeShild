import { History, Wrench, Sparkles, ThermometerSnowflake, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

const history = [
  {
    date: 'March 10, 2024',
    appliance: 'Samsung Refrigerator',
    action: 'Replaced defrost heater',
    technician: 'Phoenix Appliance Repair',
    cost: '$220',
    icon: Wrench,
    color: 'cyan',
  },
  {
    date: 'February 28, 2024',
    appliance: 'HVAC System',
    action: 'Annual Maintenance & Filter Change',
    technician: 'Desert Air Pros',
    cost: '$150',
    icon: ThermometerSnowflake,
    color: 'violet',
  },
  {
    date: 'February 15, 2024',
    appliance: 'Whole House',
    action: 'Deep Cleaning Service',
    technician: 'Sparkle Cleaners',
    cost: '$300',
    icon: Sparkles,
    color: 'emerald-400',
  },
];

export function HistoryWidget() {
  return (
    <div className="glass-card p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-glass-border pb-4">
        <h2 className="text-xl font-display font-semibold flex items-center gap-3">
          <History className="w-6 h-6 text-violet" />
          Service History
        </h2>
        <button className="text-sm font-medium text-violet hover:text-violet/80 transition-colors">
          View All
        </button>
      </div>

      <div className="flex flex-col gap-6 pl-2">
        {history.map((item, i) => (
          <div key={i} className="relative flex gap-6 group">
            {/* Timeline line */}
            {i !== history.length - 1 && (
              <div className="absolute left-4 top-10 bottom-[-24px] w-px bg-glass-border group-hover:bg-violet/30 transition-colors" />
            )}
            
            {/* Timeline node */}
            <div className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border border-glass-border bg-base",
              item.color === 'cyan' ? "text-cyan shadow-[0_0_10px_rgba(0,245,255,0.3)]" :
              item.color === 'violet' ? "text-violet shadow-[0_0_10px_rgba(123,47,255,0.3)]" :
              "text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
            )}>
              <item.icon className="w-4 h-4" />
            </div>
            
            {/* Content */}
            <div className="flex flex-col gap-1 flex-1 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{item.date}</span>
                <span className="text-sm font-bold font-display text-white">{item.cost}</span>
              </div>
              <h3 className="font-display font-bold text-lg text-gray-200 group-hover:text-white transition-colors">{item.appliance}</h3>
              <p className="text-sm text-gray-400">{item.action}</p>
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-gray-500">{item.technician}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
