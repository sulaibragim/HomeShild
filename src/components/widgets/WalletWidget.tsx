import { Wallet, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Appliance Repair', value: 450, color: '#00F5FF' },
  { name: 'Cleaning', value: 300, color: '#7B2FFF' },
  { name: 'Handyman', value: 150, color: '#34D399' },
  { name: 'HVAC', value: 200, color: '#F87171' },
];

export function WalletWidget() {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="glass-card p-6 flex flex-col gap-6 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan/20 blur-3xl rounded-full pointer-events-none"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <h2 className="text-lg font-display font-semibold flex items-center gap-2">
          <Wallet className="w-5 h-5 text-violet" />
          Spending
        </h2>
        <select className="bg-glass border border-glass-border rounded-md text-xs px-2 py-1 text-gray-300 focus:outline-none focus:border-cyan">
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="flex flex-col items-center justify-center relative z-10">
        <span className="text-sm text-gray-400 font-medium uppercase tracking-wider">Total Spent</span>
        <div className="flex items-end gap-2 mt-1">
          <span className="text-4xl font-display font-bold tracking-tighter">${total}</span>
          <span className="text-sm text-emerald-400 flex items-center mb-1">
            <TrendingUp className="w-3 h-3 mr-1" /> 12%
          </span>
        </div>
      </div>

      <div className="h-48 w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#0D0D14', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3 relative z-10">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: item.color, color: item.color }}></div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 truncate w-24">{item.name}</span>
              <span className="text-sm font-medium">${item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
