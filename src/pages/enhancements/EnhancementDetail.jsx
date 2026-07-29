import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEnhancement } from '../../api/enhancements';
import { createTimeline, updateTimeline, deleteTimeline } from '../../api/timelines';
import { ArrowLeft, Plus, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import Modal from '../../components/common/Modal';

const EnhancementDetail = () => {
  const { projectId, enhancementId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    priority: 'sedang',
    status: 'pending',
    pic: ''
  });
  
  const { data: enhancement, isLoading } = useQuery({
    queryKey: ['enhancement', projectId, enhancementId],
    queryFn: () => getEnhancement(projectId, enhancementId),
  });

  const mutation = useMutation({
    mutationFn: (data) => editingTimeline 
      ? updateTimeline(projectId, editingTimeline.id, { ...data, enhancement_id: enhancementId }) 
      : createTimeline(projectId, { ...data, enhancement_id: enhancementId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhancement', projectId, enhancementId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      closeModal();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (timelineId) => deleteTimeline(projectId, timelineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhancement', projectId, enhancementId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTimeline(null);
    setFormData({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      priority: 'sedang',
      status: 'pending',
      pic: ''
    });
  };

  const openEditModal = (e, timeline) => {
    e.stopPropagation();
    setEditingTimeline(timeline);
    setFormData({
      title: timeline.title,
      description: timeline.description || '',
      start_date: timeline.start_date ? new Date(timeline.start_date).toISOString().split('T')[0] : '',
      end_date: timeline.end_date ? new Date(timeline.end_date).toISOString().split('T')[0] : '',
      priority: timeline.priority,
      status: timeline.status || 'pending',
      pic: timeline.pic || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (e, timelineId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this timeline?')) {
      deleteMutation.mutate(timelineId);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) return <div className="p-8">Memuat data...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center space-x-2 text-sm text-blue-600 font-medium mb-4">
            <Link to="/projects">Aplikasi</Link>
            <ChevronRight size={14} className="text-gray-400" />
            <Link to={`/projects/${projectId}`}>Detail Aplikasi</Link>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="text-gray-500">{enhancement.title}</span>
          </div>
          
          <button 
            onClick={() => navigate(`/projects/${projectId}`)}
            className="flex items-center space-x-2 text-primary-600 font-semibold text-sm hover:underline mb-4"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Aplikasi</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">{enhancement.title}</h1>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold uppercase">
              {enhancement.status?.replace('_', ' ')}
            </span>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Plus size={18} />
              <span>New Timeline</span>
            </button>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {enhancement.description}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {enhancement.timelines?.length || 0} Timelines · {enhancement.timelines?.reduce((acc, t) => acc + (t.requirements_count || 0), 0) || 0} Tasks
          </div>
          {enhancement.pic && (
            <div className="flex items-center space-x-2 mt-3">
              <div className="w-7 h-7 bg-indigo-100 text-indigo-700 flex items-center justify-center rounded-full text-[10px] font-bold">
                {enhancement.pic.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <span className="text-xs text-gray-500">PIC: </span>
                <span className="text-xs font-semibold text-gray-700">{enhancement.pic}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Progress Enhancement</div>
          <div className="text-4xl font-bold text-indigo-600 mb-1">{enhancement.progress_percentage}%</div>
          <div className="text-xs text-gray-400">Rata-rata semua timeline di Enhancement ini</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2 text-red-500">Overdue Timelines</div>
          <div className="text-4xl font-bold text-gray-800 mb-1">
            {enhancement.timelines?.filter(t => t.status === 'overdue').length || 0}
          </div>
          <div className="text-xs text-gray-400">Perlu perhatian</div>
        </div>
      </div>

      {/* Timelines List */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase mb-4 tracking-wider">
          TIMELINES — KLIK UNTUK LIHAT TASKS
        </h2>
        <div className="space-y-4">
          {enhancement.timelines?.length === 0 && (
            <div className="text-sm text-gray-500 p-4 border border-dashed rounded-xl text-center">Belum ada timeline di Enhancement ini.</div>
          )}
          {enhancement.timelines?.map((timeline) => (
            <div 
              key={timeline.id}
              onClick={() => navigate(`/timelines/${timeline.id}`)}
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg group-hover:text-primary-600 transition-colors">
                    {timeline.title}
                  </h3>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(timeline.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - 
                    {new Date(timeline.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} · 
                    {timeline.duration_days} hari
                  </div>
                  {timeline.pic && (
                    <div className="flex items-center space-x-1 mt-1">
                      <div className="w-5 h-5 bg-indigo-100 text-indigo-700 flex items-center justify-center rounded-full text-[9px] font-bold">
                        {timeline.pic.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <span className="text-xs text-gray-500">PIC: <span className="font-semibold">{timeline.pic}</span></span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2 justify-end">
                    <button 
                      onClick={(e) => openEditModal(e, timeline)}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, timeline.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      timeline.status === 'overdue' ? 'bg-red-50 text-red-600' : 
                      timeline.status === 'completed' ? 'bg-green-50 text-green-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {timeline.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-gray-600 mt-2">{timeline.progress_percentage}%</div>
                  <div className="text-[10px] text-gray-400">{timeline.requirements_count || 0} tasks</div>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    timeline.status === 'overdue' ? 'bg-red-500' : 'bg-blue-500'
                  }`} 
                  style={{ width: `${timeline.progress_percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Timeline Modal Form */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingTimeline ? "Edit Timeline" : "Add New Timeline"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Timeline Title</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="E.g. Phase 1: Planning"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
              <input 
                type="date" 
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
              <input 
                type="date" 
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">PIC (Person In Charge)</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              value={formData.pic}
              onChange={(e) => setFormData({...formData, pic: e.target.value})}
              placeholder="Nama PIC Timeline"
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
          {editingTimeline && (
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
            {mutation.isPending ? 'Saving...' : (editingTimeline ? 'Update Timeline' : 'Add Timeline')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default EnhancementDetail;
