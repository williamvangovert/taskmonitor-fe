import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRequirements, createRequirement } from '../../api/requirements';
import { List, LayoutGrid, Clock, Plus } from 'lucide-react';
import Modal from '../../components/common/Modal';

const TimelineDetail = () => {
  const { tid } = useParams();
  const queryClient = useQueryClient();
  const [view, setView] = useState('kanban'); // Default to kanban for MS Planner feel
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'sedang'
  });
  
  const { data: requirements, isLoading, error } = useQuery({
    queryKey: ['requirements', tid],
    queryFn: () => getRequirements(tid),
  });

  const mutation = useMutation({
    mutationFn: (data) => createRequirement(tid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements', tid] });
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        due_date: '',
        priority: 'sedang'
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

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
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg shadow-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            <span>New Requirement</span>
          </button>
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
      {/* Requirement Creation Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Requirement"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Requirement Title</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="E.g. Define technical specs"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Due Date</label>
            <input 
              type="date" 
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              value={formData.due_date}
              onChange={(e) => setFormData({...formData, due_date: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Priority</label>
            <select 
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
            >
              <option value="rendah">Rendah</option>
              <option value="sedang">Sedang</option>
              <option value="penting">Penting</option>
              <option value="mendesak">Mendesak</option>
            </select>
          </div>
          <button 
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors disabled:bg-gray-400"
          >
            {mutation.isPending ? 'Adding...' : 'Add Requirement'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default TimelineDetail;
