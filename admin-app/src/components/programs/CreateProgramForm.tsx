import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { programService } from '@/services/api/program.service';
import { CreateProgramRequest } from '@/types/api.types';
import { useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { channelService } from '@/services/api/channel.service';

const programSchema = z.object({
  channelId: z.string().min(1, 'Channel is required'),
  title: z.string().min(1, 'Title is required').min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  category: z.string().optional(),
}).refine(
  (data) => {
    if (data.startTime && data.endTime) {
      return new Date(data.endTime) > new Date(data.startTime);
    }
    return true;
  },
  { message: 'End time must be after start time', path: ['endTime'] }
);

type ProgramFormValues = z.infer<typeof programSchema>;

interface CreateProgramFormProps {
  onSuccess?: () => void;
}

const CreateProgramForm = ({ onSuccess }: CreateProgramFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch channels for dropdown
  const { data: channelsData } = useQuery({
    queryKey: ['channels', 1, 100],
    queryFn: async () => {
      const response = await channelService.getChannels({ page: 1, limit: 100 });
      return response.data;
    },
  });

  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      channelId: '',
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      category: '',
    },
  });

  const onSubmit = async (data: ProgramFormValues) => {
    setIsSubmitting(true);
    try {
      // Convert datetime-local to ISO 8601
      const startTimeISO = data.startTime ? new Date(data.startTime).toISOString() : '';
      const endTimeISO = data.endTime ? new Date(data.endTime).toISOString() : '';
      
      const payload: CreateProgramRequest = {
        channelId: data.channelId,
        title: data.title,
        description: data.description?.trim() || undefined,
        startTime: startTimeISO,
        endTime: endTimeISO,
        category: data.category?.trim() || undefined,
      };

      const response = await programService.createProgram(payload);
      
      if (response.success) {
        toast.success('Program created successfully!');
        form.reset();
        setIsOpen(false);
        
        queryClient.invalidateQueries({ queryKey: ['programs'] });
        onSuccess?.();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create program. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-[#0000FF] hover:bg-[#0000CC] text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Program
      </Button>
    );
  }

  return (
    <div 
      className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-xl mb-6"
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-black">Create New Program</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setIsOpen(false);
            form.reset();
          }}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="channelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black">Channel *</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select a channel</option>
                    {channelsData?.channels.map((channel) => (
                      <option key={channel.id} value={channel.id}>
                        {channel.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black">Title *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Morning Show"
                    className="bg-white border-gray-300"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black">Description</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    rows={3}
                    placeholder="Enter program description..."
                    className="flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">Start Time *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="datetime-local"
                      className="bg-white border-gray-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">End Time *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="datetime-local"
                      className="bg-white border-gray-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black">Category</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., News, Sports, Entertainment"
                    className="bg-white border-gray-300"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                form.reset();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0000FF] hover:bg-[#0000CC] text-white"
            >
              {isSubmitting ? 'Creating...' : 'Create Program'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateProgramForm;
