import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';
import { 
  AlertCircle, 
  Clock, 
  UserPlus, 
  CheckCircle2, 
  TrendingUp,
  Check
} from 'lucide-react';

const Notifications = () => {
  const queryClient = useQueryClient();
  
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await axios.get('/notifications');
      return data.data; // Karena Laravel paginate mengembalikan objek dengan key 'data'
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => axios.post('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const getIcon = (type) => {
    switch (type) {
      case 'overdue': return <AlertCircle size={18} className="text-red-600" />;
      case 'reminder': return <Clock size={18} className="text-orange-600" />;
      case 'assignment': return <UserPlus size={18} className="text-blue-600" />;
      case 'progress': return <TrendingUp size={18} className="text-primary-600" />;
      case 'completion': return <CheckCircle2 size={18} className="text-green-600" />;
      default: return <Clock size={18} className="text-gray-600" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'overdue': return 'bg-red-50';
      case 'reminder': return 'bg-orange-50';
      case 'assignment': return 'bg-blue-50';
      case 'progress': return 'bg-primary-50';
      case 'completion': return 'bg-green-50';
      default: return 'bg-gray-50';
    }
  };

  if (isLoading) return <div className="p-8">Memuat notifikasi...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Notifikasi</h1>
        <button 
          onClick={() => markAllReadMutation.mutate()}
          className="bg-white border border-gray-200 px-6 py-2 rounded-xl shadow-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Tandai semua dibaca
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="space-y-4">
          {notifications?.length > 0 ? (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`flex items-start space-x-4 p-4 rounded-xl transition-colors ${notif.is_read ? 'bg-white' : 'bg-blue-50/50'}`}
              >
                <div className={`p-2 rounded-full ${getBgColor(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800 text-sm">{notif.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{notif.message}</div>
                  <div className="text-[10px] text-gray-400 mt-2">
                    {new Date(notif.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })} · {notif.type.charAt(0).toUpperCase() + notif.type.slice(1)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">Tidak ada notifikasi baru</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
