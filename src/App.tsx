import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { Dashboard } from './components/Dashboard';
import { ApplianceView } from './components/ApplianceView';
import { AIFab } from './components/AIFab';

export default function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <div className="flex h-screen w-full overflow-hidden bg-base text-white font-sans selection:bg-cyan/30">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet/5 blur-[120px]" />
      </div>
      
      <div className="relative z-10 flex h-full w-full">
        <Sidebar 
          isExpanded={isSidebarExpanded} 
          setIsExpanded={setIsSidebarExpanded} 
          currentView={currentView}
          setCurrentView={setCurrentView}
        />
        <div className="flex flex-col flex-1 min-w-0">
          <TopNav />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {currentView === 'dashboard' && <Dashboard setCurrentView={setCurrentView} />}
            {currentView === 'appliances' && <ApplianceView onBack={() => setCurrentView('dashboard')} />}
            {/* Fallback for other views */}
            {currentView !== 'dashboard' && currentView !== 'appliances' && (
              <div className="flex flex-col items-center justify-center h-full">
                <h2 className="text-3xl font-display font-bold mb-4">Coming Soon</h2>
                <button onClick={() => setCurrentView('dashboard')} className="px-6 py-3 bg-cyan text-base font-bold rounded-xl">Back to Dashboard</button>
              </div>
            )}
          </main>
        </div>
        <AIFab />
      </div>
    </div>
  );
}
