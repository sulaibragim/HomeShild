import { Bell, Search, User } from 'lucide-react';

export function TopNav() {
  return (
    <header className="h-16 border-b border-glass-border bg-base/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <div className="md:hidden font-display font-bold text-xl tracking-tight">
          Home<span className="text-cyan">IQ</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search appliances, services..." 
            className="bg-glass border border-glass-border rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan transition-colors w-64"
          />
        </div>
        
        <button className="relative p-2 rounded-full hover:bg-glass transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-violet rounded-full"></span>
        </button>
        
        <button className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan to-violet p-[2px]">
          <div className="w-full h-full rounded-full bg-sidebar flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
        </button>
      </div>
    </header>
  );
}
