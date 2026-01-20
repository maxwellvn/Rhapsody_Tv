/* eslint-disable import/no-unresolved */
import ChannelsChart from '@/components/dashboard/ChannelsChart';
import MenuGrid from '@/components/dashboard/MenuGrid';
import StatsCards from '@/components/dashboard/StatsCards';
import UserGrowthChart from '@/components/dashboard/UserGrowthChart';
import VideoViewsChart from '@/components/dashboard/VideoViewsChart';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import DashboardHeader from '@/components/layout/DashboardHeader';

const Dashboard = () => {
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

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <DashboardHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
        <WelcomeSection />

        {/* Analytics Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <UserGrowthChart data={userGrowthData} />
          <VideoViewsChart data={videoViewsData} />
        </div>

        {/* Channels Chart */}
        <ChannelsChart data={channelData} />

        {/* Menu Grid */}
        <MenuGrid />

        {/* Stats Section */}
        <StatsCards />
      </main>
    </div>
  );
};

export default Dashboard;
