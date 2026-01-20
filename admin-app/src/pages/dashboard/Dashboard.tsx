/* eslint-disable import/no-unresolved */
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/utils/constants';
import { Film, LogOut, Menu, Radio, Tv, Users, Video, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  // Mock data for charts - replace with actual API data later
  const userGrowthData = [
    { month: 'Jan', users: 120 },
    { month: 'Feb', users: 190 },
    { month: 'Mar', users: 300 },
    { month: 'Apr', users: 450 },
    { month: 'May', users: 580 },
    { month: 'Jun', users: 720 },
  ];

  const channelData = [
    { name: 'Channel 1', videos: 45 },
    { name: 'Channel 2', videos: 38 },
    { name: 'Channel 3', videos: 52 },
    { name: 'Channel 4', videos: 29 },
    { name: 'Channel 5', videos: 41 },
  ];

  const videoViewsData = [
    { day: 'Mon', views: 1200 },
    { day: 'Tue', views: 1900 },
    { day: 'Wed', views: 3000 },
    { day: 'Thu', views: 2500 },
    { day: 'Fri', views: 3200 },
    { day: 'Sat', views: 2800 },
    { day: 'Sun', views: 3500 },
  ];

  const menuItems = [
    {
      title: 'Users',
      icon: Users,
      route: ROUTES.USERS,
      description: 'Manage user accounts and profiles',
      color: 'bg-blue-50 hover:bg-blue-100',
      iconColor: 'text-[#0000FF]',
    },
    {
      title: 'Channels',
      icon: Radio,
      route: ROUTES.CHANNELS,
      description: 'Manage TV channels and content',
      color: 'bg-purple-50 hover:bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Videos',
      icon: Video,
      route: ROUTES.VIDEOS,
      description: 'Manage video content library',
      color: 'bg-red-50 hover:bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      title: 'Programs',
      icon: Film,
      route: ROUTES.PROGRAMS,
      description: 'Manage program schedules',
      color: 'bg-green-50 hover:bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Livestreams',
      icon: Tv,
      route: ROUTES.LIVESTREAMS,
      description: 'Manage live streaming content',
      color: 'bg-orange-50 hover:bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#D0D0D0]/50 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo Only */}
            <div className="flex items-center">
              <img 
                src="/assets/logo/Logo.png" 
                alt="Rhapsody TV Logo" 
                className="h-8 w-auto md:h-10"
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 text-[#666666]">
                <span className="text-sm">Welcome,</span>
                <span className="text-sm font-semibold text-black">{user?.fullName || 'Admin'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-[#0000FF] to-[#0000CC] text-white rounded-lg hover:from-[#0000CC] hover:to-[#000099] transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                style={{
                  boxShadow: '0 4px 15px rgba(0, 0, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                }}
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-[#666666] hover:text-black transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#D0D0D0] bg-white/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-3">
              <div className="flex items-center gap-2 text-[#666666] pb-3 border-b border-[#D0D0D0]">
                <span className="text-sm">Welcome,</span>
                <span className="text-sm font-semibold text-black">{user?.fullName || 'Admin'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-[#0000FF] to-[#0000CC] text-white rounded-lg hover:from-[#0000CC] hover:to-[#000099] transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl"
                style={{
                  boxShadow: '0 4px 15px rgba(0, 0, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                }}
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
        {/* Welcome Section */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-2">
            Dashboard
          </h2>
          <p className="text-sm md:text-base text-[#666666]">
            Manage your Rhapsody TV platform content and users
          </p>
        </div>

        {/* Analytics Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div 
            className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            }}
          >
            <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
              <Users className="text-[#0000FF]" size={20} />
              User Growth
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0000FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0000FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#666666" fontSize={12} />
                <YAxis stroke="#666666" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #D0D0D0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#0000FF"
                  strokeWidth={2}
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Video Views Chart */}
          <div 
            className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            }}
          >
            <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
              <Video className="text-[#0000FF]" size={20} />
              Video Views (Weekly)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={videoViewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#666666" fontSize={12} />
                <YAxis stroke="#666666" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #D0D0D0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#0000FF"
                  strokeWidth={3}
                  dot={{ fill: '#0000FF', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channels Chart */}
        <div 
          className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 mb-8"
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
          }}
        >
          <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
            <Radio className="text-[#0000FF]" size={20} />
            Videos per Channel
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={channelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#666666" fontSize={12} />
              <YAxis stroke="#666666" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #D0D0D0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar dataKey="videos" fill="#0000FF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.route}
                onClick={() => navigate(item.route)}
                className="group bg-white/90 backdrop-blur-sm p-5 md:p-6 rounded-2xl border border-white/50 hover:border-[#0000FF]/50 hover:shadow-2xl transition-all duration-300 text-left transform hover:-translate-y-1"
                style={{
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
                }}
              >
                <div className="flex items-start gap-4 mb-3">
                  <div 
                    className={`p-3 rounded-xl ${item.color} transition-all duration-300 shadow-lg group-hover:shadow-xl`}
                    style={{
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <Icon className={item.iconColor} size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-semibold text-black mb-1 group-hover:text-[#0000FF] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#666666] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-[#0000FF] text-sm font-medium mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Manage {item.title}</span>
                  <svg 
                    className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div 
            className="bg-white/90 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#666666]">Total Users</span>
              <Users className="text-[#0000FF]" size={20} />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-black">-</p>
            <p className="text-xs text-[#666666] mt-1">Coming soon</p>
          </div>
          <div 
            className="bg-white/90 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#666666]">Total Channels</span>
              <Radio className="text-[#0000FF]" size={20} />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-black">-</p>
            <p className="text-xs text-[#666666] mt-1">Coming soon</p>
          </div>
          <div 
            className="bg-white/90 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#666666]">Total Videos</span>
              <Video className="text-[#0000FF]" size={20} />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-black">-</p>
            <p className="text-xs text-[#666666] mt-1">Coming soon</p>
          </div>
          <div 
            className="bg-white/90 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#666666]">Live Streams</span>
              <Tv className="text-[#0000FF]" size={20} />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-black">-</p>
            <p className="text-xs text-[#666666] mt-1">Coming soon</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
