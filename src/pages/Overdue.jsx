import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';
import { AlertTriangle, Clock } from 'lucide-react';

const Overdue = () => {
  const { data: overdueTasks, isLoading } = useQuery({
    queryKey: ['dashboard-overdue'],
    queryFn: async () => {
      const { data } = await axios.get('/dashboard/overdue');
      return data;
    }
  });

  if (isLoading) return <div className="p-8">Memuat data...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Overdue Monitoring</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase">Total Overdue</div>
            <div className="text-3xl font-bold text-gray-800">{overdueTasks?.length || 0}</div>
            <div className="text-[10px] text-gray-400">Di beberapa aplikasi</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase">Terlambat Terlama</div>
            <div className="text-3xl font-bold text-gray-800">
              +{overdueTasks && overdueTasks.length > 0 ? Math.max(...overdueTasks.map(t => t.days_late)) : 0} hari
            </div>
            <div className="text-[10px] text-gray-400">
              {overdueTasks && overdueTasks.length > 0 ? overdueTasks.sort((a,b) => b.days_late - a.days_late)[0].title : '-'}
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider">REQUIREMENTS OVERDUE</h2>
      <div className="space-y-4">
        {overdueTasks?.map((task) => (
          <div key={task.id} className="bg-white p-5 rounded-xl border-l-4 border-l-red-500 border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-2xl font-bold text-red-600">+{task.days_late}d</div>
              <div>
                <div className="font-bold text-gray-800">{task.title}</div>
                <div className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">
                  {task.timeline?.project?.title} → {task.timeline?.title} → PIC: {task.assigned_user?.name || 'Unassigned'}
                </div>
              </div>
            </div>
            <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase ${
              task.priority === 'mendesak' ? 'bg-red-50 text-red-700' :
              task.priority === 'penting' ? 'bg-orange-50 text-orange-700' :
              'bg-yellow-50 text-yellow-700'
            }`}>
              {task.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Overdue;
