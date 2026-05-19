import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';
import StatCard from '../components/cards/StatCard';
import { 
  Folder, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Layers, 
  ListTodo, 
  Users, 
  TrendingUp,
  ChevronRight,
  Bell
} from 'lucide-react';
import Modal from '../components/common/Modal';

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
      const { data } = await axios.get('/projects');
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

  const [isCriticalModalOpen, setIsCriticalModalOpen] = React.useState(false);
  const [isUpcomingModalOpen, setIsUpcomingModalOpen] = React.useState(false);

  if (isLoading) return <div className="p-8 text-center text-gray-500">Memuat data...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <div className="flex space-x-2">
          {/* Top buttons/actions can go here */}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        <div onClick={() => setIsUpcomingModalOpen(true)} className="cursor-pointer group">
          <StatCard 
            title="Deadline 7 hari" 
            value={stats?.upcoming_deadlines || 0} 
            subValue="Upcoming" 
            icon={Clock} 
            color="orange"
            className="group-hover:shadow-md transition-shadow ring-2 ring-orange-500/20"
          />
        </div>
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
          title="Completion Rate" 
          value={`${stats?.completion_rate || 0}%`} 
          subValue="5% vs bulan lalu" 
          trend="↑ 5%"
          icon={CheckCircle2} 
          color="green"
        />
        <StatCard 
          title="Timelines Aktif" 
          value={stats?.active_timelines || 0} 
          subValue="8 hampir deadline" 
          icon={Layers} 
        />
        <StatCard 
          title="Requirements" 
          value={stats?.total_requirements || 0} 
          subValue={`${stats?.status_distribution?.completed || 0} selesai`} 
          icon={ListTodo} 
        />
        <StatCard 
          title="Pengguna Aktif" 
          value={stats?.active_users || 0} 
          subValue="5 departemen" 
          icon={Users} 
        />
        <StatCard 
          title="Avg Progress" 
          value="72%" 
          subValue="Semua project aktif" 
          icon={TrendingUp} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Overdue Tasks List */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Overdue Tasks</h2>
            <button className="text-primary-600 text-sm font-medium flex items-center hover:underline">
              Lihat semua <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {overdueTasks?.slice(0, 4).map((task) => (
              <div 
                key={task.id} 
                onClick={() => navigate(`/timelines/${task.timeline_id}`)}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-red-600 font-bold text-sm bg-red-50 px-2 py-1 rounded">+{task.days_late}d</span>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">{task.title}</div>
                    <div className="text-xs text-gray-400">{task.assigned_user?.name || 'Unassigned'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Upcoming Deadlines</h2>
          </div>
          <div className="space-y-4">
            {upcomingTasks?.slice(0, 4).map((task) => (
              <div 
                key={task.id} 
                onClick={() => navigate(`/timelines/${task.timeline_id}`)}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{task.title}</div>
                  <div className="text-xs text-gray-400">H-{task.days_until} · {task.timeline?.project?.title}</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                  task.days_until <= 1 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                }`}>
                  {task.days_until === 0 ? 'Hari ini' : task.days_until === 1 ? 'Besok' : `H-${task.days_until}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Project Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800">Progress Project</h2>
          <button className="text-primary-600 text-sm font-medium flex items-center hover:underline">
            Lihat semua <ChevronRight size={16} />
          </button>
        </div>
        <div className="space-y-6">
          {projects?.slice(0, 4).map((project) => (
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
            <div className="text-sm text-gray-500 text-center py-4">Belum ada project</div>
          )}
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

      {/* Upcoming Deadlines Modal */}
      <Modal
        isOpen={isUpcomingModalOpen}
        onClose={() => setIsUpcomingModalOpen(false)}
        title="Upcoming Deadlines (7 Hari)"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="text-center py-4">Memuat data...</div>
          ) : upcomingTasks?.length === 0 ? (
            <div className="text-center py-8 text-gray-500 italic">Tidak ada deadline dalam 7 hari ke depan. ✨</div>
          ) : (
            upcomingTasks?.map((task) => (
              <div 
                key={task.id} 
                onClick={() => navigate(`/timelines/${task.timeline_id}`)}
                className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex justify-between items-center cursor-pointer hover:bg-orange-100 transition-colors"
              >
                <div>
                  <div className="font-bold text-orange-900">{task.title}</div>
                  <div className="text-xs text-orange-600 mt-1">
                    Due: {new Date(task.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="text-[10px] text-orange-400 font-medium uppercase mt-1">
                    {task.timeline?.project?.title} — {task.timeline?.title}
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                    {task.days_until === 0 ? 'Hari ini' : task.days_until === 1 ? 'Besok' : `H-${task.days_until}`}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        <button 
          onClick={() => setIsUpcomingModalOpen(false)}
          className="w-full mt-6 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
        >
          Tutup
        </button>
      </Modal>
    </div>
  );
};

export default Dashboard;
