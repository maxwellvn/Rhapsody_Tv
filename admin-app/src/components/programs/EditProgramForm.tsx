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
import { programService } from '@/services/api/program.service';
import { UpdateProgramRequest, Program } from '@/types/api.types';
import { useQueryClient } from '@tanstack/react-query';

const programSchema = z.object({
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

interface EditProgramFormProps {
  program: Program;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EditProgramForm = ({ program, onSuccess, onCancel }: EditProgramFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Convert ISO dates to datetime-local format
  const formatDateForInput = (isoDate: string) => {
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      title: program.title,
      description: program.description || '',
      startTime: formatDateForInput(program.startTime),
      endTime: formatDateForInput(program.endTime),
      category: program.category || '',
    },
  });

  const onSubmit = async (data: ProgramFormValues) => {
    setIsSubmitting(true);
    try {
      // Convert datetime-local to ISO 8601
      const startTimeISO = new Date(data.startTime).toISOString();
      const endTimeISO = new Date(data.endTime).toISOString();
      
      const payload: UpdateProgramRequest = {
        title: data.title,
        description: data.description?.trim() || undefined,
        startTime: startTimeISO,
        endTime: endTimeISO,
        category: data.category?.trim() || undefined,
      };

      const response = await programService.updateProgram(program.id, payload);
      
      if (response.success) {
        toast.success('Program updated successfully!');
        
        queryClient.invalidateQueries({ queryKey: ['program', program.id] });
        queryClient.invalidateQueries({ queryKey: ['programs'] });
        
        onSuccess?.();
      }
    } catch (error: any) {
      if (error.statusCode === 404) {
        toast.error('Program not found');
      } else {
        toast.error(error.message || 'Failed to update program. Please try again.');
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
        <h2 className="text-xl font-semibold text-black">Edit Program</h2>
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
            <p className="text-base font-medium text-black">{program.channelId}</p>
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
              {isSubmitting ? 'Updating...' : 'Update Program'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditProgramForm;
