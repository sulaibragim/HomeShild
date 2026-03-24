import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export function CalendarWidget() {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // Simple mock calendar for March 2024
  // Starts on Friday (1st)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: 5 }, (_, i) => i); // Sun to Thu

  const [events, setEvents] = useState<Record<number, { title: string, type: string }>>({
    12: { title: 'HVAC', type: 'maintenance' },
    15: { title: 'Fridge', type: 'technician' },
    21: { title: 'Cleaning', type: 'cleaning' },
  });

  useEffect(() => {
    const loadAppointments = () => {
      try {
        const saved = localStorage.getItem('homeiq_appointments');
        if (saved) {
          const appointments = JSON.parse(saved);
          const newEvents = { ...events };
          appointments.forEach((app: any) => {
            // Parse date and extract day if it's in March 2024
            const d = new Date(app.date);
            if (!isNaN(d.getTime())) {
              // For simplicity, just use the day of the month
              const day = d.getDate();
              newEvents[day] = { title: app.companyName || 'Repair', type: 'technician' };
            }
          });
          setEvents(newEvents);
        }
      } catch (e) {
        console.error("Failed to load appointments", e);
      }
    };

    loadAppointments();
    window.addEventListener('storage', loadAppointments);
    return () => window.removeEventListener('storage', loadAppointments);
  }, []);

  return (
    <div className="glass-card p-6 md:p-8 flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-cyan" />
          March 2024
        </h2>
        <div className="flex items-center gap-2">
          <button className="p-3 rounded-xl bg-glass hover:bg-glass-border text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button className="p-3 rounded-xl bg-glass hover:bg-glass-border text-white transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 md:gap-4 mt-4">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-gray-400 font-bold text-lg md:text-xl pb-2">
            {day}
          </div>
        ))}
        
        {emptyDays.map(i => (
          <div key={`empty-${i}`} className="aspect-square rounded-xl bg-glass/20"></div>
        ))}
        
        {days.map(day => {
          const event = events[day as keyof typeof events];
          return (
            <div 
              key={day} 
              className={`aspect-square rounded-xl flex flex-col items-center justify-center relative border-2 transition-colors cursor-pointer ${
                event ? 'border-glass-border bg-glass hover:bg-glass-border' : 'border-transparent hover:bg-glass/50'
              }`}
            >
              <span className={`text-xl md:text-2xl font-bold ${event ? 'text-white' : 'text-gray-300'}`}>
                {day}
              </span>
              {event && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                  <span className={`w-3 h-3 rounded-full ${
                    event.type === 'technician' ? 'bg-cyan shadow-[0_0_8px_rgba(0,245,255,0.8)]' : 
                    event.type === 'maintenance' ? 'bg-violet shadow-[0_0_8px_rgba(123,47,255,0.8)]' : 
                    'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  }`}></span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-6 mt-auto pt-6 border-t border-glass-border">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-cyan shadow-[0_0_8px_rgba(0,245,255,0.8)]"></span>
          <span className="text-lg font-medium">Repairs</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-violet shadow-[0_0_8px_rgba(123,47,255,0.8)]"></span>
          <span className="text-lg font-medium">Maintenance</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
          <span className="text-lg font-medium">Cleaning</span>
        </div>
      </div>
    </div>
  );
}
