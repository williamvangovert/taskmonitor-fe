import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';
import { 
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Legend,
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


  const statusData = stats?.status_distribution ? Object.keys(stats.status_distribution)
    .filter(key => key !== 'in_progress')
    .map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
      value: parseInt(stats.status_distribution[key] || 0)
    })) : [];

  const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#6366f1'];
  
  const STATUS_COLORS = {
    'Pending': '#eab308',
    'In Progress': '#3b82f6',
    'Completed': '#22c55e',
    'Overdue': '#ef4444'
  };

  // Data for Pie Chart
  const total = parseInt(stats?.total_requirements || 0);
  const completed = parseInt(stats?.status_distribution?.completed || 0);
  const overdue = parseInt(stats?.overdue_count || 0);
  const upcoming = parseInt(stats?.upcoming_deadlines || 0);
  const onTrack = Math.max(0, total - completed - overdue - upcoming);

  const pieData = [
    { name: 'Selesai', value: completed, color: '#22c55e' },
    { name: 'Mendekati Deadline', value: upcoming, color: '#eab308' },
    { name: 'Melewati Tenggat', value: overdue, color: '#ef4444' },
    { name: 'Aman (On Track)', value: onTrack, color: '#3b82f6' }
  ].filter(item => item.value > 0);

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
                      backgroundColor: STATUS_COLORS[entry.name] || '#6b7280'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progres Deadline Tasks */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-6">Progres Tenggat Waktu Tasks</h2>
          <div className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} tasks`, 'Jumlah']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={48} 
                    iconType="circle" 
                    formatter={(value, entry) => {
                      const totalVal = pieData.reduce((sum, item) => sum + item.value, 0);
                      const percentage = totalVal > 0 ? ((entry.payload.value / totalVal) * 100).toFixed(0) : 0;
                      return `${value}: ${entry.payload.value} (${percentage}%)`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                Belum ada data tasks
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
