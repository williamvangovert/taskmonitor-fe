import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getProjects, createProject, updateProject, deleteProject, getProject } from '../../api/projects';
import { createTimeline, updateTimeline, deleteTimeline } from '../../api/timelines';
import { createRequirement, updateRequirement, deleteRequirement } from '../../api/requirements';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Layers, FileText, Clock, CheckCircle } from 'lucide-react';
import Modal from '../../components/common/Modal';

const ExpandedProjectDetails = ({ projectId }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedTimelines, setExpandedTimelines] = useState(new Set());
  
  // Timeline Modal State
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState(null);
  const [timelineFormData, setTimelineFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    priority: 'sedang',
    progress_percentage: 0
  });

  // Requirement Modal State
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState(null);
  const [activeTimelineId, setActiveTimelineId] = useState(null);
  const [reqFormData, setReqFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    due_date: '',
    status: 'pending',
    priority: 'sedang'
  });

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId)
  });

  // Mutations
  const timelineMutation = useMutation({
    mutationFn: (data) => editingTimeline ? updateTimeline(projectId, editingTimeline.id, data) : createTimeline(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      closeTimelineModal();
    }
  });

  const deleteTimelineMutation = useMutation({
    mutationFn: (timelineId) => deleteTimeline(projectId, timelineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    }
  });

  const reqMutation = useMutation({
    mutationFn: (data) => editingReq ? updateRequirement(activeTimelineId, editingReq.id, data) : createRequirement(activeTimelineId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      closeReqModal();
    }
  });

  const deleteReqMutation = useMutation({
    mutationFn: ({timelineId, reqId}) => deleteRequirement(timelineId, reqId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    }
  });

  const closeTimelineModal = () => {
    setIsTimelineModalOpen(false);
    setEditingTimeline(null);
    setTimelineFormData({ title: '', description: '', start_date: '', end_date: '', priority: 'sedang', progress_percentage: 0 });
  };

  const closeReqModal = () => {
    setIsReqModalOpen(false);
    setEditingReq(null);
    setActiveTimelineId(null);
    setReqFormData({ title: '', description: '', start_date: '', end_date: '', due_date: '', status: 'pending', priority: 'sedang' });
  };

  const openEditTimeline = (e, timeline) => {
    e.stopPropagation();
    setEditingTimeline(timeline);
    setTimelineFormData({
      title: timeline.title,
      description: timeline.description || '',
      start_date: timeline.start_date ? new Date(timeline.start_date).toISOString().split('T')[0] : '',
      end_date: timeline.end_date ? new Date(timeline.end_date).toISOString().split('T')[0] : '',
      priority: timeline.priority || 'sedang',
      progress_percentage: timeline.progress_percentage || 0
    });
    setIsTimelineModalOpen(true);
  };

  const openEditReq = (e, timelineId, req) => {
    e.stopPropagation();
    setEditingReq(req);
    setActiveTimelineId(timelineId);
    setReqFormData({
      title: req.title,
      description: req.description || '',
      start_date: req.start_date ? new Date(req.start_date).toISOString().split('T')[0] : '',
      end_date: req.end_date ? new Date(req.end_date).toISOString().split('T')[0] : '',
      due_date: req.due_date ? new Date(req.due_date).toISOString().split('T')[0] : '',
      status: req.status,
      priority: req.priority || 'sedang'
    });
    setIsReqModalOpen(true);
  };

  const openCreateReq = (e, timelineId) => {
    e.stopPropagation();
    setActiveTimelineId(timelineId);
    setIsReqModalOpen(true);
  };

  if (isLoading) return <div className="p-6 text-center text-gray-500 text-sm">Memuat detail project...</div>;
  if (!project) return null;

  const toggleTimeline = (e, timelineId) => {
    e.stopPropagation();
    setExpandedTimelines(prev => {
      const next = new Set(prev);
      if (next.has(timelineId)) next.delete(timelineId);
      else next.add(timelineId);
      return next;
    });
  };

  return (
    <div className="bg-gray-50 p-6 border-b border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-gray-800 font-bold">
          <Layers size={18} className="text-primary-600" />
          <h3 className="text-sm">Timelines ({project.timelines?.length || 0})</h3>
        </div>
        <button
          onClick={() => setIsTimelineModalOpen(true)}
          className="flex items-center space-x-1 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          <Plus size={14} />
          <span>New Timeline</span>
        </button>
      </div>
      
      {project.timelines?.length === 0 ? (
        <div className="text-xs text-gray-500 italic">Belum ada timeline di project ini.</div>
      ) : (
        <div className="space-y-3">
          {project.timelines?.map(timeline => {
            const isExpanded = expandedTimelines.has(timeline.id);
            return (
              <div key={timeline.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div 
                  onClick={(e) => toggleTimeline(e, timeline.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded-md ${isExpanded ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                      <ChevronRight size={16} className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-gray-800">{timeline.title}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(timeline.start_date).toLocaleDateString('id-ID')} - {new Date(timeline.end_date).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-xs font-bold text-gray-700">{timeline.progress_percentage}%</div>
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${timeline.progress_percentage}%` }}></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => openEditTimeline(e, timeline)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Hapus timeline ini?')) deleteTimelineMutation.mutate(timeline.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Requirements Dropdown */}
                {isExpanded && (
                  <div className="bg-gray-50 border-t border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center">
                        <FileText size={12} className="mr-1" /> Requirements
                      </div>
                      <button
                        onClick={(e) => openCreateReq(e, timeline.id)}
                        className="flex items-center space-x-1 bg-white border border-gray-200 px-2 py-1 rounded text-[10px] font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        <Plus size={10} />
                        <span>Add Req</span>
                      </button>
                    </div>
                    {timeline.requirements?.length === 0 ? (
                      <div className="text-xs text-gray-400 italic">Tidak ada requirement.</div>
                    ) : (
                      <div className="space-y-2">
                        {timeline.requirements?.map(req => (
                          <div 
                            key={req.id} 
                            onClick={(e) => { e.stopPropagation(); navigate(`/timelines/${timeline.id}`); }}
                            className="bg-white p-3 rounded-md border border-gray-200 flex justify-between items-center cursor-pointer hover:border-primary-300 transition-colors"
                          >
                            <div>
                              <div className="text-sm font-semibold text-gray-800">{req.title}</div>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-[10px] flex items-center text-gray-500 font-medium">
                                  <Clock size={10} className="mr-1" />
                                  {req.start_date && req.end_date ? (
                                    `${new Date(req.start_date).toLocaleDateString('id-ID')} - ${new Date(req.end_date).toLocaleDateString('id-ID')}`
                                  ) : (
                                    `Due: ${new Date(req.due_date).toLocaleDateString('id-ID')}`
                                  )}
                                </span>
                                {req.status === 'completed' && (
                                  <span className="text-[10px] flex items-center text-green-600 font-medium ml-2"><CheckCircle size={10} className="mr-1" /> Selesai</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 text-[10px] rounded uppercase font-bold ${
                                req.status === 'completed' ? 'bg-green-50 text-green-700' :
                                req.status === 'in_progress' ? 'bg-blue-50 text-blue-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {req.status?.replace('_', ' ')}
                              </span>
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={(e) => openEditReq(e, timeline.id, req)}
                                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Hapus requirement ini?')) deleteReqMutation.mutate({timelineId: timeline.id, reqId: req.id});
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Timeline Modal */}
      <Modal isOpen={isTimelineModalOpen} onClose={closeTimelineModal} title={editingTimeline ? "Edit Timeline" : "Create Timeline"}>
        <form onSubmit={(e) => { e.preventDefault(); timelineMutation.mutate(timelineFormData); }} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
            <input type="text" required className="w-full px-4 py-2 rounded-lg border border-gray-200" value={timelineFormData.title} onChange={(e) => setTimelineFormData({...timelineFormData, title: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
              <input type="date" required className="w-full px-4 py-2 rounded-lg border border-gray-200" value={timelineFormData.start_date} onChange={(e) => setTimelineFormData({...timelineFormData, start_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
              <input type="date" required className="w-full px-4 py-2 rounded-lg border border-gray-200" value={timelineFormData.end_date} onChange={(e) => setTimelineFormData({...timelineFormData, end_date: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Priority</label>
            <select className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" value={timelineFormData.priority} onChange={(e) => setTimelineFormData({...timelineFormData, priority: e.target.value})}>
              <option value="rendah">Rendah</option>
              <option value="sedang">Sedang</option>
              <option value="penting">Penting</option>
              <option value="mendesak">Mendesak</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded-lg font-bold mt-2">{timelineMutation.isPending ? 'Saving...' : 'Save'}</button>
        </form>
      </Modal>

      {/* Requirement Modal */}
      <Modal isOpen={isReqModalOpen} onClose={closeReqModal} title={editingReq ? "Edit Requirement" : "Create Requirement"}>
        <form onSubmit={(e) => { e.preventDefault(); reqMutation.mutate(reqFormData); }} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
            <input type="text" required className="w-full px-4 py-2 rounded-lg border border-gray-200" value={reqFormData.title} onChange={(e) => setReqFormData({...reqFormData, title: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
              <input type="date" className="w-full px-4 py-2 rounded-lg border border-gray-200" value={reqFormData.start_date} onChange={(e) => setReqFormData({...reqFormData, start_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
              <input type="date" className="w-full px-4 py-2 rounded-lg border border-gray-200" value={reqFormData.end_date} onChange={(e) => setReqFormData({...reqFormData, end_date: e.target.value, due_date: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Due Date</label>
            <input type="date" required className="w-full px-4 py-2 rounded-lg border border-gray-200" value={reqFormData.due_date} onChange={(e) => setReqFormData({...reqFormData, due_date: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Priority</label>
            <select className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" value={reqFormData.priority} onChange={(e) => setReqFormData({...reqFormData, priority: e.target.value})}>
              <option value="rendah">Rendah</option>
              <option value="sedang">Sedang</option>
              <option value="penting">Penting</option>
              <option value="mendesak">Mendesak</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
            <select className="w-full px-4 py-2 rounded-lg border border-gray-200" value={reqFormData.status} onChange={(e) => setReqFormData({...reqFormData, status: e.target.value})}>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded-lg font-bold">{reqMutation.isPending ? 'Saving...' : 'Save'}</button>
        </form>
      </Modal>
    </div>
  );
};

const ProjectList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [expandedProjects, setExpandedProjects] = useState(new Set());
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

  const toggleExpandProject = (e, projectId) => {
    e.stopPropagation();
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
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
        {/* Keterangan A/B Testing */}
        <div className="bg-blue-50 border-b border-blue-100 p-3 px-4 text-xs text-blue-800 flex items-center justify-center font-medium space-x-2">
          <span>🔵 <b>Mode A</b>: Navigasi per halaman</span>
          <span className="text-gray-300">|</span>
          <span className="text-green-700">🟢 <b>Mode B</b>: Expand di tempat</span>
        </div>

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
            {projects?.map((project, index) => {
              const mode = index % 2 === 0 ? 'A' : 'B';
              const isExpanded = expandedProjects.has(project.id);
              
              return (
                <React.Fragment key={project.id}>
                  <tr
                    onClick={(e) => {
                      if (mode === 'A') {
                        navigate(`/projects/${project.id}`);
                      } else {
                        toggleExpandProject(e, project.id);
                      }
                    }}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2">
                        <div className="font-bold text-gray-800 text-sm">{project.title}</div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          mode === 'A' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          Mode {mode}
                        </span>
                      </div>
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
                        {mode === 'B' && (
                          <div className={`p-1 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                            <ChevronDown size={16} />
                          </div>
                        )}
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
                  
                  {/* Expanded Row for Mode B */}
                  {mode === 'B' && isExpanded && (
                    <tr>
                      <td colSpan="7" className="p-0 border-b border-gray-100 bg-gray-50/50">
                        <ExpandedProjectDetails projectId={project.id} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
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