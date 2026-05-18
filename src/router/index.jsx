import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import Overdue from '../pages/Overdue';
import Analytics from '../pages/Analytics';
import Notifications from '../pages/Notifications';
import Settings from '../pages/Settings';
import Login from '../pages/Login';
import ProjectList from '../pages/projects/ProjectList';
import ProjectDetail from '../pages/projects/ProjectDetail';
import TimelineDetail from '../pages/timelines/TimelineDetail';

const ProtectedRoute = () => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '',
        element: <MainLayout />,
        children: [
          {
            path: '',
            element: <Dashboard />,
          },
          {
            path: 'overdue',
            element: <Overdue />,
          },
          {
            path: 'analytics',
            element: <Analytics />,
          },
          {
            path: 'notifications',
            element: <Notifications />,
          },
          {
            path: 'settings',
            element: <Settings />,
          },
          {
            path: 'projects',
            children: [
              {
                path: '',
                element: <ProjectList />,
              },
              {
                path: ':id',
                element: <ProjectDetail />,
              }
            ]
          },
          {
            path: 'timelines/:tid',
            element: <TimelineDetail />,
          }
        ]
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);

export default router;
