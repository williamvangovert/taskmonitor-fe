import React from 'react';
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
  ChevronRight
} from 'lucide-react';

const Dashboard = () => {
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
        <StatCard 
          title="Deadline 7 hari" 
          value={stats?.upcoming_deadlines || 0} 
          subValue="Upcoming" 
          icon={Clock} 
          color="orange"
        />
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
              <div key={task.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
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
              <div key={task.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{task.title}</div>
                  <div className="text-xs text-gray-400">H-{task.days_until} · {task.timeline?.project?.title}</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                  task.days_until <= 1 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                }`}>
                  {task.days_until <= 1 ? 'Besok' : `${task.days_until} hari`}
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
          {/* Placeholder for project progress bars as per design */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-gray-800">Project Alpha — E-Commerce Platform</span>
              <div className="flex items-center space-x-3">
                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px]">In Progress</span>
                <span>82%</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '82%' }}></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-gray-800">Project Beta — CRM Redesign</span>
              <div className="flex items-center space-x-3">
                <span className="bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded text-[10px]">In Progress</span>
                <span>57%</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '57%' }}></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-gray-800">Project Gamma — Mobile App v3</span>
              <div className="flex items-center space-x-3">
                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px]">Overdue</span>
                <span>34%</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '34%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
