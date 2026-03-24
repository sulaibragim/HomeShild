import { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle2 } from 'lucide-react';

const mockRequests = [
  {
    id: 'REQ-001',
    appliance: 'Samsung Refrigerator',
    issue: 'Not cooling properly',
    status: 'scheduled',
    date: 'Tomorrow, 2:30 PM',
    technician: 'Phoenix Repair',
  },
  {
    id: 'REQ-002',
    appliance: 'LG Washer',
    issue: 'Loud banging noise',
    status: 'awaiting',
    date: 'Pending Quote',
    technician: 'Awaiting Bids',
  },
];

export function ActiveRequestsWidget() {
  const [requests, setRequests] = useState<any[]>(mockRequests);

  useEffect(() => {
    const loadAppointments = () => {
      try {
        const saved = localStorage.getItem('homeiq_appointments');
        if (saved) {
          const appointments = JSON.parse(saved);
          const formattedAppointments = appointments.map((app: any) => {
            let applianceName = 'Appliance Repair';
            if (app.applianceId) {
              try {
                const savedApps = localStorage.getItem('homeiq_appliances');
                if (savedApps) {
                  const appsList = JSON.parse(savedApps);
                  const foundApp = appsList.find((a: any) => a.id === app.applianceId);
                  if (foundApp) {
                    applianceName = foundApp.name || `${foundApp.brand} ${foundApp.typeId}`;
                  }
                }
              } catch (e) {}
            }
            
            return {
              id: `REQ-${app.id}`,
              appliance: applianceName,
              issue: app.description || 'Scheduled Maintenance',
              status: app.status || 'scheduled',
              date: new Date(app.date).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
              technician: app.companyName || 'Technician',
            };
          });
          
          // Combine mock requests with real appointments
          setRequests([...formattedAppointments, ...mockRequests]);
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
      <div className="flex items-center justify-between border-b border-glass-border pb-4">
        <h2 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-3">
          <Activity className="w-8 h-8 text-cyan" />
          Active Work
        </h2>
      </div>

      <div className="flex flex-col gap-6">
        {requests.map((req, i) => (
          <div key={i} className="bg-base/80 border-2 border-glass-border rounded-2xl p-6 hover:border-cyan/50 transition-colors relative overflow-hidden group">
            {req.status === 'scheduled' && (
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-cyan shadow-[0_0_15px_rgba(0,245,255,0.8)]" />
            )}
            {req.status === 'awaiting' && (
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
            )}
            
            <div className="flex flex-col gap-4 pl-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold px-3 py-1 rounded-full border ${
                    req.status === 'scheduled' ? "bg-cyan/10 text-cyan border-cyan/20" : "bg-amber-400/10 text-amber-400 border-amber-400/20"
                  }`}>
                    {req.status === 'scheduled' ? 'SCHEDULED' : 'AWAITING'}
                  </span>
                </div>
                <h3 className="font-display font-bold text-2xl">{req.appliance}</h3>
                <p className="text-lg text-gray-300">{req.issue}</p>
              </div>
              
              <div className="flex flex-col gap-2 mt-2 p-4 bg-glass rounded-xl">
                <div className="flex items-center gap-3 text-lg font-bold text-white">
                  <Clock className="w-6 h-6 text-violet" />
                  {req.date}
                </div>
                <p className="text-base text-gray-400 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> {req.technician}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
