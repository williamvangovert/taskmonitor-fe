import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';
import StatCard from '../components/cards/StatCard';
import { 
  Folder, 
  AlertTriangle, 
  Layers, 
  ListTodo, 
  Users, 
  TrendingUp,
  ChevronRight,
  Bell,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle
} from 'lucide-react';
import Modal from '../components/common/Modal';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Helper function to group tasks by project and timeline
const groupTasks = (tasks) => {
  if (!tasks) return [];
  const projectsMap = {};
  
  tasks.forEach(task => {
    const projectTitle = task.timeline?.project?.title || 'Project Tanpa Nama';
    const projectId = task.timeline?.project?.id || 'unknown';
    const timelineTitle = task.timeline?.title || 'Timeline Tanpa Nama';
    const timelineId = task.timeline?.id || 'unknown';
    
    if (!projectsMap[projectId]) {
      projectsMap[projectId] = {
        id: projectId,
        title: projectTitle,
        timelines: {}
      };
    }
    
    if (!projectsMap[projectId].timelines[timelineId]) {
      projectsMap[projectId].timelines[timelineId] = {
        id: timelineId,
        title: timelineTitle,
        tasks: []
      };
    }
    
    projectsMap[projectId].timelines[timelineId].tasks.push(task);
  });
  
  return Object.values(projectsMap).map(project => ({
    ...project,
    timelines: Object.values(project.timelines)
  }));
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await axios.get('/dashboard/stats');
      return data;
    }
  });

  const { data: overdueTasks } = useQuery({
    queryKey: ['dashboard-overdue'],
    queryFn: async () => {
      const { data } = await axios.get('/dashboard/overdue');
      return data;
    }
  });

  const { data: upcomingTasks } = useQuery({
    queryKey: ['dashboard-upcoming'],
    queryFn: async () => {
      const { data } = await axios.get('/dashboard/upcoming');
      return data;
    }
  });

  const { data: projects } = useQuery({
    queryKey: ['dashboard-projects'],
    queryFn: async () => {
      const { data } = await axios.get('/projects?limit=all');
      return data.data;
    }
  });

  const { data: criticalTasks, isLoading: isLoadingCritical } = useQuery({
    queryKey: ['dashboard-critical'],
    queryFn: async () => {
      const { data } = await axios.get('/dashboard/critical');
      return data;
    }
  });

  const { data: picPerformance } = useQuery({
    queryKey: ['dashboard-pic-performance'],
    queryFn: async () => {
      const { data } = await axios.get('/dashboard/pic-performance');
      return data;
    }
  });

  const [isCriticalModalOpen, setIsCriticalModalOpen] = React.useState(false);
  const [expandedPic, setExpandedPic] = useState(null);

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

  const renderGroupedTasks = (tasks, type = 'overdue') => {
    const grouped = groupTasks(tasks);
    if (grouped.length === 0) {
      return (
        <div className="text-sm text-gray-500 text-center py-8 italic bg-gray-50 rounded-lg">
          Tidak ada tugas {type === 'overdue' ? 'melewati tenggat' : 'mendekati deadline'}
        </div>
      );
    }
    
    return (
      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
        {grouped.map(project => (
          <div key={project.id} className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50/50">
            {/* Project Header */}
            <div className="bg-gray-100/70 px-3 py-1.5 border-b border-gray-200/50 flex items-center justify-between">
              <span className="font-bold text-[11px] text-gray-700 tracking-wide uppercase">Aplikasi: {project.title}</span>
            </div>
            
            <div className="p-2 space-y-3">
              {project.timelines.map(timeline => (
                <div key={timeline.id} className="space-y-1.5">
                  {/* Timeline Sub-header */}
                  <div className="text-[10px] font-bold text-primary-600 px-1.5 flex items-center space-x-1 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                    <span>Timeline: {timeline.title}</span>
                  </div>
                  
                  {/* Tasks List */}
                  <div className="space-y-1 pl-1.5">
                    {timeline.tasks.map(task => (
                      <div 
                        key={task.id}
                        onClick={() => navigate(`/timelines/${task.timeline_id}`)}
                        className="flex items-center justify-between p-2.5 hover:bg-white border border-transparent hover:border-gray-100 rounded-md transition-all cursor-pointer bg-white"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-800">{task.title}</span>
                          <span className="text-[10px] text-gray-400">
                            Assigned: {task.assigned_user?.name || 'Unassigned'}
                          </span>
                        </div>
                        
                        {type === 'overdue' ? (
                          <span className="text-red-600 font-bold text-[10px] bg-red-50 px-2 py-0.5 rounded-full">
                            +{task.days_late} hari
                          </span>
                        ) : (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            task.days_until <= 1 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                          }`}>
                            {task.days_until === 0 ? 'Hari ini' : task.days_until === 1 ? 'Besok' : `H-${task.days_until}`}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Memuat data...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <div className="flex space-x-2">
          {/* Top buttons/actions can go here */}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard 
          title="Total Projects" 
          value={stats?.total_projects || 0} 
          subValue="2 bulan ini" 
          trend="↑ 12%"
          icon={Folder} 
          color="blue"
        />
        <StatCard 
          title="Overdue Tasks" 
          value={stats?.overdue_count || 0} 
          subValue="Perlu tindakan" 
          icon={AlertTriangle} 
          color="red"
        />
        <div onClick={() => setIsCriticalModalOpen(true)} className="cursor-pointer group">
          <StatCard 
            title="Deadline 2 Hari" 
            value={stats?.critical_deadlines || 0} 
            subValue="Sangat Mendesak" 
            icon={Bell} 
            color="red"
            className="group-hover:shadow-md transition-shadow ring-2 ring-red-500/20"
          />
        </div>
        <StatCard 
          title="Requirements" 
          value={stats?.total_requirements || 0} 
          subValue={`${stats?.status_distribution?.completed || 0} selesai`} 
          icon={ListTodo} 
          color="green"
        />
        <StatCard 
          title="Avg Progress" 
          value="72%" 
          subValue="Semua project aktif" 
          icon={TrendingUp} 
        />
      </div>

      {/* PIC Performance Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800">Kinerja PIC — Tugas per Requirement</h2>
          <span className="text-xs text-gray-400">{picPerformance?.length || 0} PIC terdaftar</span>
        </div>

        {/* Bar Chart */}
        {picPerformance?.length > 0 ? (
          <>
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={picPerformance} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="completed" name="Selesai" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} barSize={40} />
                  <Bar dataKey="not_completed" name="Belum Selesai" stackId="a" fill="#eab308" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Expandable PIC List */}
            <div className="space-y-3">
              {picPerformance.map((pic) => (
                <div key={pic.name} className="border border-gray-100 rounded-xl overflow-hidden">
                  {/* PIC Header Row */}
                  <button
                    onClick={() => setExpandedPic(expandedPic === pic.name ? null : pic.name)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {pic.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-sm text-gray-800">{pic.name}</div>
                        <div className="text-xs text-gray-500">{pic.total} requirement total</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        ✓ {pic.completed} Selesai
                      </span>
                      <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                        ○ {pic.not_completed} Belum
                      </span>
                      {expandedPic === pic.name
                        ? <ChevronUp size={16} className="text-gray-400" />
                        : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </button>

                  {/* Expanded Task List */}
                  {expandedPic === pic.name && (
                    <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Not Completed Tasks */}
                      <div>
                        <div className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-2 flex items-center space-x-1">
                          <Circle size={12} className="fill-yellow-400 text-yellow-400" />
                          <span>Belum Selesai ({pic.not_completed})</span>
                        </div>
                        <div className="space-y-2">
                          {pic.tasks_not_completed?.length === 0 ? (
                            <div className="text-xs text-gray-400 italic py-2">Semua tugas sudah selesai! 🎉</div>
                          ) : (
                            pic.tasks_not_completed?.map((task) => (
                              <div
                                key={task.id}
                                onClick={() => navigate(`/timelines/${task.timeline_id}`)}
                                className="flex flex-col p-3 rounded-lg bg-yellow-50 border border-yellow-100 hover:bg-yellow-100 cursor-pointer transition-colors"
                              >
                                <span className="text-xs font-semibold text-gray-800">{task.title}</span>
                                <span className="text-[10px] text-gray-500 mt-0.5">{task.project_title} → {task.timeline_title}</span>
                                <div className="flex items-center justify-between mt-1">
                                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                    task.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>{task.status?.replace('_', ' ')}</span>
                                  {task.due_date && (
                                    <span className="text-[10px] text-gray-400">
                                      Due: {new Date(task.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Completed Tasks */}
                      <div>
                        <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center space-x-1">
                          <CheckCircle2 size={12} className="text-green-500" />
                          <span>Sudah Selesai ({pic.completed})</span>
                        </div>
                        <div className="space-y-2">
                          {pic.tasks_completed?.length === 0 ? (
                            <div className="text-xs text-gray-400 italic py-2">Belum ada tugas yang selesai.</div>
                          ) : (
                            pic.tasks_completed?.map((task) => (
                              <div
                                key={task.id}
                                onClick={() => navigate(`/timelines/${task.timeline_id}`)}
                                className="flex flex-col p-3 rounded-lg bg-green-50 border border-green-100 hover:bg-green-100 cursor-pointer transition-colors"
                              >
                                <span className="text-xs font-semibold text-gray-700 line-through decoration-green-400">{task.title}</span>
                                <span className="text-[10px] text-gray-500 mt-0.5">{task.project_title} → {task.timeline_title}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-32 flex items-center justify-center text-gray-400 text-sm italic">
            Belum ada data PIC pada requirement
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Overdue Tasks List */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col h-[450px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Overdue Tasks</h2>
            <button className="text-primary-600 text-sm font-medium flex items-center hover:underline">
              Lihat semua <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {renderGroupedTasks(overdueTasks, 'overdue')}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col h-[450px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Upcoming Deadlines</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            {renderGroupedTasks(upcomingTasks, 'upcoming')}
          </div>
        </div>
      </div>

      {/* Progress & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Progress Aplikasi Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col min-h-[350px]">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h2 className="text-lg font-bold text-gray-800">Progress Aplikasi</h2>
            <button 
              onClick={() => navigate('/projects')}
              className="text-primary-600 text-sm font-medium flex items-center hover:underline"
            >
              Lihat semua <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 max-h-[260px]">
            {projects?.map((project) => (
                <div 
                  key={project.id} 
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="space-y-2 cursor-pointer hover:bg-gray-50 p-3 -mx-3 rounded-xl transition-colors"
                >
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-gray-800">{project.title}</span>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        project.status === 'completed' ? 'bg-green-50 text-green-700' :
                        project.status === 'in_progress' ? 'bg-blue-50 text-blue-700' :
                        project.status === 'overdue' ? 'bg-red-50 text-red-700' :
                        'bg-gray-50 text-gray-700'
                      }`}>
                        {project.status?.replace('_', ' ')}
                      </span>
                      <span>{project.progress_percentage || 0}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${project.status === 'overdue' ? 'bg-red-500' : 'bg-green-600'}`} 
                      style={{ width: `${project.progress_percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {(!projects || projects.length === 0) && (
                <div className="text-sm text-gray-500 text-center py-4">Belum ada aplikasi</div>
              )}
            </div>
        </div>

        {/* Progres Tenggat Waktu Requirements (Pie Chart) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col min-h-[350px]">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Progres Tenggat Waktu Requirements</h2>
          <div className="relative w-full h-[260px] flex-1">
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
                Belum ada data requirements
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Critical Deadlines Modal */}
      <Modal
        isOpen={isCriticalModalOpen}
        onClose={() => setIsCriticalModalOpen(false)}
        title="Deadline Sangat Mendesak (2 Hari)"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {isLoadingCritical ? (
            <div className="text-center py-4">Memuat data...</div>
          ) : criticalTasks?.length === 0 ? (
            <div className="text-center py-8 text-gray-500 italic">Tidak ada deadline mendesak dalam 2 hari ke depan. ✨</div>
          ) : (
            criticalTasks?.map((task) => (
              <div 
                key={task.id} 
                onClick={() => navigate(`/timelines/${task.timeline_id}`)}
                className="p-4 bg-red-50 rounded-xl border border-red-100 flex justify-between items-center cursor-pointer hover:bg-red-100 transition-colors"
              >
                <div>
                  <div className="font-bold text-red-900">{task.title}</div>
                  <div className="text-xs text-red-600 mt-1">
                    Due: {new Date(task.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="text-[10px] text-red-400 font-medium uppercase mt-1">
                    {task.timeline?.project?.title} — {task.timeline?.title}
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                    H-{task.days_until}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        <button 
          onClick={() => setIsCriticalModalOpen(false)}
          className="w-full mt-6 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
        >
          Tutup
        </button>
      </Modal>


    </div>
  );
};

export default Dashboard;
