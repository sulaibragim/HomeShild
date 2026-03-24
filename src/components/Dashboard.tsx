import { CalendarWidget } from './widgets/CalendarWidget';
import { WalletWidget } from './widgets/WalletWidget';
import { ActiveRequestsWidget } from './widgets/ActiveRequestsWidget';
import { HistoryWidget } from './widgets/HistoryWidget';
import { Wrench, Hammer, Sparkles, ThermometerSnowflake } from 'lucide-react';

const categories = [
  { id: 'appliances', label: 'Appliance Repair', icon: Wrench, color: 'text-cyan', bg: 'bg-cyan/10', border: 'border-cyan/20', hover: 'hover:border-cyan/50 hover:bg-cyan/20' },
  { id: 'handyman', label: 'Handyman', icon: Hammer, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', hover: 'hover:border-amber-400/50 hover:bg-amber-400/20' },
  { id: 'cleaning', label: 'Cleaning', icon: Sparkles, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', hover: 'hover:border-emerald-400/50 hover:bg-emerald-400/20' },
  { id: 'hvac', label: 'HVAC', icon: ThermometerSnowflake, color: 'text-violet', bg: 'bg-violet/10', border: 'border-violet/20', hover: 'hover:border-violet/50 hover:bg-violet/20' },
];

export function Dashboard({ setCurrentView }: { setCurrentView: (view: string) => void }) {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      
      {/* Top Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
        {categories.map((cat) => (
          <button 
            key={cat.id}
            onClick={() => setCurrentView(cat.id)}
            className={`flex flex-col items-center justify-center p-6 md:p-8 rounded-3xl border-2 transition-all duration-300 ${cat.bg} ${cat.border} ${cat.hover} group`}
          >
            <div className={`p-5 rounded-2xl bg-base border border-glass-border mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
              <cat.icon className={`w-12 h-12 md:w-16 md:h-16 ${cat.color}`} />
            </div>
            <span className="font-display font-bold text-xl md:text-2xl text-center">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Calendar (Large portion) */}
        <div className="lg:col-span-2">
          <CalendarWidget />
        </div>

        {/* Active Work (Next to it) */}
        <div className="lg:col-span-1">
          <ActiveRequestsWidget />
        </div>
      </div>

      {/* Rest of the information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <HistoryWidget />
        <WalletWidget />
      </div>
    </div>
  );
}
