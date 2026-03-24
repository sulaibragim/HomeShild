import { LayoutDashboard, Wrench, Hammer, Sparkles, ThermometerSnowflake, UserCircle, Settings, LogOut } from 'lucide-react';
import { clsx } from 'clsx';

export function Sidebar({ 
  isExpanded, 
  setIsExpanded,
  currentView,
  setCurrentView
}: { 
  isExpanded: boolean, 
  setIsExpanded: (v: boolean) => void,
  currentView: string,
  setCurrentView: (v: string) => void
}) {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'appliances', icon: Wrench, label: 'Appliance Repair' },
    { id: 'handyman', icon: Hammer, label: 'Handyman' },
    { id: 'cleaning', icon: Sparkles, label: 'Cleaning' },
    { id: 'hvac', icon: ThermometerSnowflake, label: 'HVAC' },
    { id: 'personal', icon: UserCircle, label: 'Personal Services' },
  ];

  return (
    <aside 
      className={clsx(
        "bg-sidebar border-r border-glass-border transition-all duration-300 ease-in-out hidden md:flex flex-col",
        isExpanded ? "w-72" : "w-24"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="h-20 flex items-center px-6 border-b border-glass-border">
        <div className="flex items-center gap-4 overflow-hidden whitespace-nowrap">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan to-violet flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,245,255,0.3)]">
            <span className="font-display font-bold text-2xl text-base">H</span>
          </div>
          <span className={clsx(
            "font-display font-bold text-3xl tracking-tight transition-opacity duration-300",
            isExpanded ? "opacity-100" : "opacity-0"
          )}>
            Home<span className="text-cyan">IQ</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 py-8 flex flex-col gap-3 px-4">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button 
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={clsx(
                "flex items-center gap-5 px-4 py-4 rounded-2xl transition-all duration-200 group relative overflow-hidden",
                isActive ? "bg-cyan/10 text-cyan" : "text-gray-400 hover:bg-glass hover:text-white"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan rounded-r-full shadow-[0_0_10px_rgba(0,245,255,0.8)]" />
              )}
              <item.icon className={clsx("w-8 h-8 shrink-0", isActive && "drop-shadow-[0_0_8px_rgba(0,245,255,0.5)]")} />
              <span className={clsx(
                "font-bold text-lg whitespace-nowrap transition-opacity duration-300",
                isExpanded ? "opacity-100" : "opacity-0"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-glass-border flex flex-col gap-3">
        <button className="flex items-center gap-5 px-4 py-4 rounded-2xl text-gray-400 hover:bg-glass hover:text-white transition-all duration-200">
          <Settings className="w-8 h-8 shrink-0" />
          <span className={clsx(
            "font-bold text-lg whitespace-nowrap transition-opacity duration-300",
            isExpanded ? "opacity-100" : "opacity-0"
          )}>
            Settings
          </span>
        </button>
        <button className="flex items-center gap-5 px-4 py-4 rounded-2xl text-gray-400 hover:bg-glass hover:text-white transition-all duration-200">
          <LogOut className="w-8 h-8 shrink-0" />
          <span className={clsx(
            "font-bold text-lg whitespace-nowrap transition-opacity duration-300",
            isExpanded ? "opacity-100" : "opacity-0"
          )}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}
