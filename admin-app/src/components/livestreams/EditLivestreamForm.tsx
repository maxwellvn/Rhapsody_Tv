import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { X, Save } from 'lucide-react';
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
import { livestreamService } from '@/services/api/livestream.service';
import { UpdateLivestreamRequest, Livestream } from '@/types/api.types';
import { useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { channelService } from '@/services/api/channel.service';

const livestreamSchema = z.object({
  title: z.string().min(1, 'Title is required').min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  scheduledStartAt: z.string().optional(),
  thumbnailUrl: z.union([
    z.string().url('Must be a valid URL'),
    z.literal(''),
  ]).optional(),
  isChatEnabled: z.boolean().default(true),
});

type LivestreamFormValues = z.infer<typeof livestreamSchema>;

interface EditLivestreamFormProps {
  livestream: Livestream;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EditLivestreamForm = ({ livestream, onSuccess, onCancel }: EditLivestreamFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch channels for display
  const { data: channelsData } = useQuery({
    queryKey: ['channels', 1, 100],
    queryFn: async () => {
      const response = await channelService.getChannels({ page: 1, limit: 100 });
      return response.data;
    },
  });

  // Convert ISO dates to datetime-local format
  const formatDateForInput = (isoDate?: string) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const form = useForm<LivestreamFormValues>({
    resolver: zodResolver(livestreamSchema),
    defaultValues: {
      title: livestream.title,
      description: livestream.description || '',
      scheduledStartAt: formatDateForInput(livestream.scheduledStartAt),
      thumbnailUrl: livestream.thumbnailUrl || '',
      isChatEnabled: livestream.isChatEnabled,
    },
  });

  const onSubmit = async (data: LivestreamFormValues) => {
    setIsSubmitting(true);
    try {
      // Convert datetime-local to ISO 8601
      const scheduledStartAtISO = data.scheduledStartAt 
        ? new Date(data.scheduledStartAt).toISOString() 
        : undefined;
      
      const payload: UpdateLivestreamRequest = {
        title: data.title,
        description: data.description?.trim() || undefined,
        scheduledStartAt: scheduledStartAtISO,
        thumbnailUrl: data.thumbnailUrl?.trim() || undefined,
        isChatEnabled: data.isChatEnabled,
      };

      const response = await livestreamService.updateLivestream(livestream.id, payload);
      
      if (response.success) {
        toast.success('Livestream updated successfully!');
        
        queryClient.invalidateQueries({ queryKey: ['livestream', livestream.id] });
        queryClient.invalidateQueries({ queryKey: ['livestreams'] });
        
        onSuccess?.();
      }
    } catch (error: any) {
      if (error.statusCode === 404) {
        toast.error('Livestream not found');
      } else {
        toast.error(error.message || 'Failed to update livestream. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-xl"
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-black">Edit Livestream</h2>
        {onCancel && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Channel (cannot be changed)</p>
            <p className="text-base font-medium text-black">
              {channelsData?.channels.find(c => c.id === livestream.channelId)?.name || livestream.channelId}
            </p>
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black">Title *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Live Concert"
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
                    placeholder="Enter livestream description..."
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
              name="scheduledStartAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">Scheduled Start Time</FormLabel>
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
              name="thumbnailUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">Thumbnail URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="url"
                      placeholder="https://example.com/thumbnail.jpg"
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
            name="isChatEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 bg-white">
                <div className="space-y-0.5">
                  <FormLabel className="text-black">Enable Chat</FormLabel>
                </div>
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-5 w-5 rounded border-gray-300 text-[#0000FF] focus:ring-[#0000FF]"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex gap-3 justify-end pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0000FF] hover:bg-[#0000CC] text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Updating...' : 'Update Livestream'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditLivestreamForm;
