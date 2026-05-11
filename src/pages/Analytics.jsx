import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const Analytics = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await axios.get('/dashboard/stats');
      return data;
    }
  });

  // Mock data for "Workload per User" based on design
  const workloadData = [
    { name: 'Dani Pratama', tasks: 15 },
    { name: 'Budi Santoso', tasks: 12 },
    { name: 'Sari Wulandari', tasks: 10 },
    { name: 'Rina Kartika', tasks: 8 },
    { name: 'Hendra Tan', tasks: 6 },
  ];

  const statusData = stats?.status_distribution ? Object.keys(stats.status_distribution).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
    value: stats.status_distribution[key]
  })) : [];

  const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#6366f1'];

  if (isLoading) return <div className="p-8">Memuat data...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Completion</div>
          <div className="text-4xl font-bold text-green-600">{stats?.completion_rate || 0}%</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">On-Time Rate</div>
          <div className="text-4xl font-bold text-blue-600">79%</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Overdue Rate</div>
          <div className="text-4xl font-bold text-red-600">21%</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Velocity/minggu</div>
          <div className="text-4xl font-bold text-gray-800">14</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Workload per User */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-6">Workload per User</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={workloadData} margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="tasks" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribusi Status */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-6">Distribusi Status</h2>
          <div className="space-y-6">
            {statusData.map((entry, index) => (
              <div key={entry.name} className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-600">
                  <span>{entry.name}</span>
                  <span>{Math.round((entry.value / (stats?.total_requirements || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full" 
                    style={{ 
                      width: `${(entry.value / (stats?.total_requirements || 1)) * 100}%`,
                      backgroundColor: COLORS[index % COLORS.length]
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
