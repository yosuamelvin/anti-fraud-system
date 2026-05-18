import { Home, FolderOpen, FileText, BarChart3, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      roles: ['investigator', 'kepala_departemen', 'kepala_divisi', 'direktur', 'presiden_direktur', 'superuser']
    },
    {
      name: 'List Kasus',
      href: '/cases',
      icon: FolderOpen,
      roles: ['investigator', 'kepala_departemen', 'kepala_divisi', 'direktur', 'presiden_direktur', 'superuser']
    },
    {
      name: 'My Cases',
      href: '/my-cases',
      icon: FileText,
      roles: ['investigator']
    },
    {
      name: 'Report & Statistik',
      href: '/reports',
      icon: BarChart3,
      roles: ['kepala_departemen', 'kepala_divisi', 'direktur', 'presiden_direktur', 'superuser']
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['superuser']
    }
  ];

  const filteredNav = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 
          transform transition-transform duration-300 z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <nav className="p-4 space-y-1">
          {filteredNav.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;