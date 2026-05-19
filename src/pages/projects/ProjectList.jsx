import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getProjects, createProject, updateProject, deleteProject } from '../../api/projects';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../../components/common/Modal';

const ProjectList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    priority: 'sedang',
    status: 'pending'
  });

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects', currentPage, filterStatus],
    queryFn: () => getProjects(currentPage, filterStatus)
  });

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const projects = projectsData?.data;
  const lastPage = projectsData?.last_page || 1;
  const total = projectsData?.total || 0;

  const mutation = useMutation({
    mutationFn: (data) => editingProject ? updateProject(editingProject.id, data) : createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      closeModal();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      priority: 'sedang',
      status: 'pending'
    });
  };

  const openEditModal = (e, project) => {
    e.stopPropagation();
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
      end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '',
      priority: project.priority,
      status: project.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'mendesak': return 'bg-red-500';
      case 'penting': return 'bg-orange-500';
      case 'sedang': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700';
      case 'in_progress': return 'bg-blue-50 text-blue-700';
      case 'overdue': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  if (isLoading) return <div className="p-8">Memuat data...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Daftar Projects</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <Plus size={20} />
          <span>New Project</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex space-x-2">
          <button 
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              filterStatus === 'all' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-50 font-medium'
            }`}
          >
            Semua
          </button>
          <button 
            onClick={() => handleFilterChange('in_progress')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              filterStatus === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50 font-medium'
            }`}
          >
            In Progress
          </button>
          <button 
            onClick={() => handleFilterChange('completed')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              filterStatus === 'completed' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-50 font-medium'
            }`}
          >
            Completed
          </button>
          <button 
            onClick={() => handleFilterChange('overdue')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              filterStatus === 'overdue' ? 'bg-red-100 text-red-700' : 'text-gray-500 hover:bg-gray-50 font-medium'
            }`}
          >
            Overdue
          </button>
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-wider font-bold">
            <tr>
              <th className="px-6 py-4">Project</th>
              <th className="px-6 py-4">Prioritas</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Progress</th>
              <th className="px-6 py-4">Periode</th>
              <th className="px-6 py-4">PIC</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {projects?.map((project) => (
              <tr
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-5">
                  <div className="font-bold text-gray-800 text-sm">{project.title}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {project.timelines_count || 0} timelines · {project.requirements_count || 0} reqs
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${getPriorityColor(project.priority)}`}></span>
                    <span className="text-xs font-semibold capitalize">{project.priority}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusStyle(project.status)}`}>
                    {project.status?.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-24">
                      <div
                        className={`h-1.5 rounded-full ${project.status === 'overdue' ? 'bg-red-500' : 'bg-green-600'}`}
                        style={{ width: `${project.progress_percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-gray-600">{project.progress_percentage}%</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-xs text-gray-600 font-medium">
                    {new Date(project.start_date).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })} -
                    {new Date(project.end_date).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="w-7 h-7 bg-blue-100 text-blue-700 flex items-center justify-center rounded-full text-[10px] font-bold">
                    {project.creator?.name?.split(' ').map(n => n[0]).join('') || '??'}
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={(e) => openEditModal(e, project)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, project.id)}
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

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="p-4 flex justify-center items-center space-x-2 border-t border-gray-50">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Sebelumnya
            </button>
            <span className="text-xs text-gray-500">
              Halaman {currentPage} dari {lastPage}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(lastPage, p + 1))}
              disabled={currentPage === lastPage}
              className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Berikutnya
            </button>
          </div>
        )}

        <div className="p-4 bg-gray-50 text-center text-[10px] text-gray-400 italic">
          ✨ Klik baris project untuk melihat timeline di dalamnya
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProject ? "Edit Project" : "Create New Project"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Project Title</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="E.g. Website Redesign"
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
          {editingProject && (
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
                <option value="archived">Archived</option>
              </select>
            </div>
          )}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors disabled:bg-gray-400 mt-4"
          >
            {mutation.isPending ? 'Saving...' : (editingProject ? 'Update Project' : 'Create Project')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectList;