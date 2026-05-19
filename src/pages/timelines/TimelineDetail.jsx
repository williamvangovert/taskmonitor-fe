import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRequirements, createRequirement, updateRequirement, deleteRequirement } from '../../api/requirements';
import { List, LayoutGrid, Clock, Plus, Edit2, Trash2, CheckCircle, MoreVertical } from 'lucide-react';
import Modal from '../../components/common/Modal';

const TimelineDetail = () => {
  const { tid } = useParams();
  const queryClient = useQueryClient();
  const [view, setView] = useState('list'); // Default to list view
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    due_date: '',
    priority: 'sedang',
    status: 'pending'
  });
  
  const { data: requirements, isLoading, error } = useQuery({
    queryKey: ['requirements', tid],
    queryFn: () => getRequirements(tid),
  });

  const mutation = useMutation({
    mutationFn: (data) => editingRequirement ? updateRequirement(tid, editingRequirement.id, data) : createRequirement(tid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements', tid] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project'] }); // Invalidate all project details just in case
      closeModal();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (reqId) => deleteRequirement(tid, reqId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements', tid] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ reqId, status }) => updateRequirement(tid, reqId, { status, is_completed: status === 'completed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements', tid] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
    }
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRequirement(null);
    setFormData({
      title: '',
      description: '',
      due_date: '',
      priority: 'sedang',
      status: 'pending'
    });
  };

  const openEditModal = (e, req) => {
    e.stopPropagation();
    setEditingRequirement(req);
    setFormData({
      title: req.title,
      description: req.description || '',
      start_date: req.start_date ? new Date(req.start_date).toISOString().split('T')[0] : '',
      end_date: req.end_date ? new Date(req.end_date).toISOString().split('T')[0] : '',
      due_date: req.due_date ? new Date(req.due_date).toISOString().split('T')[0] : '',
      priority: req.priority,
      status: req.status || 'pending'
    });
    setIsModalOpen(true);
  };

  const handleDelete = (e, reqId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this requirement?')) {
      deleteMutation.mutate(reqId);
    }
  };

  const handleStatusChange = (e, reqId, newStatus) => {
    e.stopPropagation();
    statusMutation.mutate({ reqId, status: newStatus });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) return <div className="p-8">Memuat rincian tugas...</div>;
  if (error) return <div className="p-8 text-red-500">Error memuat data.</div>;

  const columns = [
    { title: 'Pending', status: 'pending', color: 'bg-gray-100' },
    { title: 'In Progress', status: 'in_progress', color: 'bg-blue-50' },
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
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requirements?.map(req => (
                <tr key={req.id} className={`hover:bg-gray-50 ${req.status === 'completed' ? 'opacity-70' : ''}`}>
                  <td className={`px-6 py-4 font-semibold text-sm ${req.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                    {req.title}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {req.start_date && req.end_date ? (
                      `${new Date(req.start_date).toLocaleDateString('id-ID')} - ${new Date(req.end_date).toLocaleDateString('id-ID')}`
                    ) : (
                      new Date(req.due_date).toLocaleDateString('id-ID')
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">{req.status?.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getPriorityBadge(req.priority)}`}>
                      {req.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {req.status !== 'completed' && (
                        <button 
                          onClick={(e) => handleStatusChange(e, req.id, 'completed')}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Mark as Done"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button 
                        onClick={(e) => openEditModal(e, req)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, req.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
                      <div className="flex items-center space-x-1">
                        <select
                          className="text-[10px] bg-gray-50 border-gray-200 rounded px-1 py-0.5 text-gray-600 focus:outline-none"
                          value={req.status}
                          onChange={(e) => handleStatusChange(e, req.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                        <button onClick={(e) => openEditModal(e, req)} className="text-gray-400 hover:text-blue-600"><Edit2 size={12} /></button>
                        <button onClick={(e) => handleDelete(e, req.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={12} /></button>
                      </div>
                    </div>
                    <div className={`text-sm font-bold mb-4 ${req.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {req.title}
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <div className="flex items-center text-gray-400">
                        {req.start_date && req.end_date ? (
                          `${new Date(req.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${new Date(req.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
                        ) : (
                          new Date(req.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                        )}
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
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingRequirement ? "Edit Requirement" : "Add New Requirement"}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value, due_date: e.target.value})}
              />
            </div>
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
          {editingRequirement && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
              <select 
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          )}
          <button 
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors disabled:bg-gray-400 mt-4"
          >
            {mutation.isPending ? 'Saving...' : (editingRequirement ? 'Update Requirement' : 'Add Requirement')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default TimelineDetail;
