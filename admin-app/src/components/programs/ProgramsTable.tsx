import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatDateTime } from '@/utils/helpers';
import { programService } from '@/services/api/program.service';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Film, Eye, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import Loader from '@/components/common/Loader';

const ProgramsTable = () => {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['programs', page, limit],
    queryFn: async () => {
      const response = await programService.getPrograms({ page, limit });
      return response.data;
    },
  });

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await programService.deleteProgram(id);
      toast.success('Program deleted successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete program');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl border border-white/50 shadow-xl">
        <p className="text-red-600 text-center">
          Failed to load programs. Please try again later.
        </p>
      </div>
    );
  }

  const programs = data?.programs || [];
  const total = data?.total ?? 0;
  const totalPages = data?.pages ?? 1;

  if (programs.length === 0) {
    return (
      <div 
        className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl border border-white/50 shadow-xl"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
        }}
      >
        <div className="text-center py-8">
          <Film className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No programs found</p>
          <p className="text-gray-500 text-sm">Create your first program to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl overflow-hidden"
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
      }}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200">
              <TableHead className="text-black font-semibold">Program</TableHead>
              <TableHead className="text-black font-semibold">Channel</TableHead>
              <TableHead className="text-black font-semibold">Start Time</TableHead>
              <TableHead className="text-black font-semibold">End Time</TableHead>
              <TableHead className="text-black font-semibold">Duration</TableHead>
              <TableHead className="text-black font-semibold">Category</TableHead>
              <TableHead className="text-black font-semibold">Status</TableHead>
              <TableHead className="text-black font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {programs.map((program) => (
              <TableRow 
                key={program.id} 
                className="border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/programs/${program.id}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#0000FF]/10 flex items-center justify-center">
                      <Film className="w-5 h-5 text-[#0000FF]" />
                    </div>
                    <div>
                      <p className="font-medium text-black">{program.title}</p>
                      {program.description && (
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {program.description}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-gray-700 text-sm">
                  {program.channelId.slice(0, 8)}...
                </TableCell>
                <TableCell className="text-gray-700 text-sm">
                  {formatDateTime(program.startTime)}
                </TableCell>
                <TableCell className="text-gray-700 text-sm">
                  {formatDateTime(program.endTime)}
                </TableCell>
                <TableCell className="text-gray-700">
                  {program.durationInMinutes ? `${program.durationInMinutes} min` : '-'}
                </TableCell>
                <TableCell>
                  {program.category ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {program.category}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      program.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {program.isActive ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/programs/${program.id}`);
                      }}
                      className="h-8 w-8"
                      title="View details"
                    >
                      <Eye className="h-4 w-4 text-gray-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(program.id, program.title);
                      }}
                      disabled={deletingId === program.id}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete program"
                    >
                      {deletingId === program.id ? (
                        <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-white/40">
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold text-gray-900">{total}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 mr-1">Rows:</span>
          <select
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(Number(e.target.value));
            }}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <div className="w-px h-6 bg-gray-200 mx-2" />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Prev
          </Button>
          <div className="text-sm text-gray-700 px-2">
            Page <span className="font-semibold">{page}</span> of{' '}
            <span className="font-semibold">{totalPages}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProgramsTable;
