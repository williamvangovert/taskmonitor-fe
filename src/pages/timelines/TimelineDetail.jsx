import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getRequirements } from '../../api/requirements';
import { List, LayoutGrid } from 'lucide-react';

const TimelineDetail = () => {
  const { tid } = useParams();
  const [view, setView] = useState('kanban'); // Default to kanban for MS Planner feel
  
  const { data: requirements, isLoading, error } = useQuery({
    queryKey: ['requirements', tid],
    queryFn: () => getRequirements(tid),
  });

  if (isLoading) return <div className="p-8">Memuat rincian tugas...</div>;
  if (error) return <div className="p-8 text-red-500">Error memuat data.</div>;

  const columns = [
    { title: 'Pending', status: 'pending', color: 'bg-gray-100' },
    { title: 'In Progress', status: 'in_progress', color: 'bg-blue-50' },
    { title: 'In Review', status: 'review', color: 'bg-orange-50' },
    { title: 'Completed', status: 'completed', color: 'bg-green-50' },
  ];

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'mendesak': return 'bg-red-50 text-red-700';
      case 'penting': return 'bg-orange-50 text-orange-700';
      default: return 'bg-blue-50 text-blue-700';
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Requirements Detail</h1>
        <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <button 
            onClick={() => setView('list')}
            className={`p-2 rounded-md ${view === 'list' ? 'bg-gray-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List size={20} />
          </button>
          <button 
            onClick={() => setView('kanban')}
            className={`p-2 rounded-md ${view === 'kanban' ? 'bg-gray-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <LayoutGrid size={20} />
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Task Name</th>
                <th className="px-6 py-4">Deadline</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requirements?.map(req => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-700 text-sm">{req.title}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">{new Date(req.due_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">{req.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getPriorityBadge(req.priority)}`}>
                      {req.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex space-x-6 overflow-x-auto pb-6">
          {columns.map(col => (
            <div key={col.status} className="flex-shrink-0 w-80">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-bold text-gray-600 text-sm uppercase tracking-wider">{col.title}</h3>
                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">
                  {requirements?.filter(r => r.status === col.status).length || 0}
                </span>
              </div>
              <div className={`p-3 rounded-xl min-h-[500px] space-y-4 ${col.color} border-2 border-dashed border-gray-200/50`}>
                {requirements?.filter(r => r.status === col.status).map(req => (
                  <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-move">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${getPriorityBadge(req.priority)}`}>
                        {req.priority}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-gray-800 mb-4">{req.title}</div>
                    <div className="flex justify-between items-center text-[10px]">
                      <div className="flex items-center text-gray-400">
                        <Clock size={12} className="mr-1" />
                        {new Date(req.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </div>
                      <div className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold">
                        {req.assigned_user?.name?.[0] || '?'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelineDetail;
