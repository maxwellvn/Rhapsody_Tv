import DashboardHeader from '@/components/layout/DashboardHeader';
import CreateVideoForm from '@/components/videos/CreateVideoForm';
import VideosTable from '@/components/videos/VideosTable';

const VideoList = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-2">
            Videos
          </h1>
          <p className="text-sm md:text-base text-[#666666]">
            Manage video content library
          </p>
        </div>

        <CreateVideoForm />
        <VideosTable />
      </main>
    </div>
  );
};

export default VideoList;
