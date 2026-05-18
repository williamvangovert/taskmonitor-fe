import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProject } from '../../api/projects';
import { createTimeline } from '../../api/timelines';
import { ArrowLeft, Plus, ChevronRight } from 'lucide-react';
import Modal from '../../components/common/Modal';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    priority: 'sedang'
  });
  
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id),
  });

  const mutation = useMutation({
    mutationFn: (data) => createTimeline(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        priority: 'sedang'
      });
    }
  });

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
            <Link to="/projects">Projects</Link>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="text-gray-500">{project.title}</span>
          </div>
          
          <button 
            onClick={() => navigate('/projects')}
            className="flex items-center space-x-2 text-primary-600 font-semibold text-sm hover:underline mb-4"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Projects</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">{project.title}</h1>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase">
              {project.status?.replace('_', ' ')}
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
            {new Date(project.start_date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })} - 
            {new Date(project.end_date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })} · 
            {project.timelines?.length || 0} Timelines · {project.requirements_count || 0} Requirements
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Progress Project</div>
          <div className="text-4xl font-bold text-blue-600 mb-1">{project.progress_percentage}%</div>
          <div className="text-xs text-gray-400">Rata-rata semua timeline</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2 text-red-500">Overdue Timelines</div>
          <div className="text-4xl font-bold text-gray-800 mb-1">
            {project.timelines?.filter(t => t.status === 'overdue').length || 0}
          </div>
          <div className="text-xs text-gray-400">Perlu perhatian</div>
        </div>
      </div>

      {/* Timelines List */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase mb-4 tracking-wider">
          TIMELINES — KLIK UNTUK LIHAT REQUIREMENTS
        </h2>
        <div className="space-y-4">
          {project.timelines?.map((timeline) => (
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
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    timeline.status === 'overdue' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {timeline.status?.replace('_', ' ')}
                  </span>
                  <div className="text-xs font-bold text-gray-600 mt-2">{timeline.progress_percentage}%</div>
                  <div className="text-[10px] text-gray-400">{timeline.requirements_count || 0} reqs</div>
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
      {/* Timeline Creation Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Timeline"
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
            {mutation.isPending ? 'Adding...' : 'Add Timeline'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
