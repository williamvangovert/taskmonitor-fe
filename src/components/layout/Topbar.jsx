import { User, Bell, Menu } from 'lucide-react';

const Topbar = ({ onMenuToggle }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Administrator' };

  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center space-x-3">
        <button 
          onClick={onMenuToggle}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="text-sm text-gray-500 font-medium">
          Monitoring IT Projects
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center space-x-2 pl-4 border-l">
          <div className="w-8 h-8 bg-primary-100 text-primary-700 flex items-center justify-center rounded-full">
            <User size={18} />
          </div>
          <span className="text-sm font-medium">{user.name}</span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
