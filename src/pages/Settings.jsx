import React from 'react';
import { UserPlus, Check, ShieldCheck } from 'lucide-react';

const Settings = () => {
  // Mock data for display based on your design
  const users = [
    { name: 'Budi Santoso', dept: 'Engineering', role: 'Manager', color: 'bg-blue-100 text-blue-700' },
    { name: 'Rina Kartika', dept: 'Engineering', role: 'Staff', color: 'bg-primary-100 text-primary-700' },
    { name: 'Dani Pratama', dept: 'Frontend', role: 'Staff', color: 'bg-indigo-100 text-indigo-700' },
    { name: 'Hendra Tan', dept: 'DevOps', role: 'Manager', color: 'bg-blue-100 text-blue-700' },
  ];

  const schedulers = [
    { name: 'H-7 Reminder', status: 'Aktif' },
    { name: 'H-3 Reminder', status: 'Aktif' },
    { name: 'H-1 Reminder', status: 'Aktif' },
    { name: 'Overdue Alert (harian)', status: 'Aktif' },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Management */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-800 mb-6 uppercase tracking-wider">User Management</h2>
          <div className="space-y-6 mb-8">
            {users.map((user, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${user.color}`}>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-800">{user.name}</div>
                    <div className="text-[10px] text-gray-400 font-medium">{user.dept}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full text-[10px] font-bold">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full flex items-center justify-center space-x-2 border border-gray-200 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
            <UserPlus size={18} />
            <span>Tambah User</span>
          </button>
        </div>

        {/* Reminder Scheduler */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-800 mb-6 uppercase tracking-wider">Reminder Scheduler</h2>
          <div className="space-y-6">
            {schedulers.map((sch, idx) => (
              <div key={idx} className="flex items-center justify-between py-1">
                <div className="text-sm font-semibold text-gray-700">{sch.name}</div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-lg text-[10px] font-bold">
                    {sch.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 p-4 bg-primary-50 rounded-xl flex items-start space-x-3 border border-primary-100">
            <ShieldCheck className="text-primary-600 mt-0.5" size={20} />
            <div>
              <div className="text-xs font-bold text-primary-800">Sistem Keamanan</div>
              <div className="text-[10px] text-primary-600 mt-1">
                Jadwal pengingat diatur secara otomatis oleh server setiap hari untuk memastikan efisiensi kerja tim.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
