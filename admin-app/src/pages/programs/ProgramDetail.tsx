import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ArrowLeft, Film, Edit, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { programService } from '@/services/api/program.service';
import DashboardHeader from '@/components/layout/DashboardHeader';
import Loader from '@/components/common/Loader';
import EditProgramForm from '@/components/programs/EditProgramForm';
import { formatDate, formatDateTime } from '@/utils/helpers';
import { ROUTES } from '@/utils/constants';
import { toast } from 'sonner';

const ProgramDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['program', id],
    queryFn: async () => {
      if (!id) throw new Error('Program ID is required');
      const response = await programService.getProgramById(id);
      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <DashboardHeader />
        <div className="flex items-center justify-center py-20">
          <Loader />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <DashboardHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
          <div 
            className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl border border-white/50 shadow-xl text-center"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            }}
          >
            <Film className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-black mb-2">Program Not Found</h2>
            <p className="text-gray-600 mb-6">The program you're looking for doesn't exist or has been removed.</p>
            <Button
              onClick={() => navigate(ROUTES.PROGRAMS)}
              className="bg-[#0000FF] hover:bg-[#0000CC] text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Programs
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const program = data;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTES.PROGRAMS)}
            className="text-gray-600 hover:text-black"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Programs
          </Button>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-[#0000FF] hover:bg-[#0000CC] text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancel Edit' : 'Edit Program'}
          </Button>
        </div>

        {isEditing ? (
          <EditProgramForm
            program={program}
            onSuccess={() => setIsEditing(false)}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            <div 
              className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl overflow-hidden mb-6"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
              }}
            >
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-[#0000FF]/10 flex items-center justify-center border-4 border-white shadow-lg">
                      <Film className="w-12 h-12 md:w-16 md:h-16 text-[#0000FF]" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">
                      {program.title}
                    </h1>
                    <div className="flex items-center gap-3 flex-wrap mb-4">
                      {program.category && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {program.category}
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          program.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {program.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {program.description && (
                      <p className="text-gray-700 text-base leading-relaxed mb-6">
                        {program.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">Duration</span>
                        </div>
                        <p className="text-lg font-bold text-black">
                          {program.durationInMinutes ? `${program.durationInMinutes} min` : '-'}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">Start Time</span>
                        </div>
                        <p className="text-sm font-semibold text-black">{formatDateTime(program.startTime)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">End Time</span>
                        </div>
                        <p className="text-sm font-semibold text-black">{formatDateTime(program.endTime)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Created</div>
                        <p className="text-sm font-semibold text-black">{formatDate(program.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div 
              className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-6 md:p-8"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
              }}
            >
              <h2 className="text-xl font-semibold text-black mb-6">Program Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Program ID</label>
                  <p className="text-sm font-mono text-gray-900 bg-gray-50 px-3 py-2 rounded">
                    {program.id}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Channel ID</label>
                  <p className="text-sm font-mono text-gray-900 bg-gray-50 px-3 py-2 rounded">
                    {program.channelId}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Start Time</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                    {formatDateTime(program.startTime)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">End Time</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                    {formatDateTime(program.endTime)}
                  </p>
                </div>

                {program.category && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-1 block">Category</label>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {program.category}
                    </span>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Status</label>
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                      program.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {program.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Created At</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                    {formatDateTime(program.createdAt)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Updated At</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                    {formatDateTime(program.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ProgramDetail;
