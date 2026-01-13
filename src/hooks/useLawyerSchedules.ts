import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface LawyerSchedule {
  id: string;
  lawyer_id: string;
  date: string;
  time_slot: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// 24 jam time slots dari 07:00 sampai 06:00 (keesokan hari)
const defaultTimeSlots = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
  "19:00", "20:00", "21:00", "22:00", "23:00", "00:00",
  "01:00", "02:00", "03:00", "04:00", "05:00", "06:00"
];

export function useLawyerSchedule(lawyerId?: string) {
  return useQuery({
    queryKey: ['lawyer-schedule', lawyerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lawyer_schedules')
        .select('*')
        .eq('lawyer_id', lawyerId!)
        .gte('date', new Date().toISOString().split('T')[0]);

      if (error) throw error;
      return data as LawyerSchedule[];
    },
    enabled: !!lawyerId
  });
}

export function useMyLawyerSchedule() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my-lawyer-schedule', user?.id],
    queryFn: async () => {
      // First get the lawyer id
      const { data: lawyer } = await supabase
        .from('lawyers')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (!lawyer) return [];

      const { data, error } = await supabase
        .from('lawyer_schedules')
        .select('*')
        .eq('lawyer_id', lawyer.id)
        .gte('date', new Date().toISOString().split('T')[0]);

      if (error) throw error;
      return data as LawyerSchedule[];
    },
    enabled: !!user
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ date, timeSlot, isAvailable }: { date: string; timeSlot: string; isAvailable: boolean }) => {
      // Get lawyer id
      const { data: lawyer } = await supabase
        .from('lawyers')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (!lawyer) throw new Error('Lawyer not found');

      // Upsert the schedule
      const { data, error } = await supabase
        .from('lawyer_schedules')
        .upsert({
          lawyer_id: lawyer.id,
          date,
          time_slot: timeSlot,
          is_available: isAvailable
        }, {
          onConflict: 'lawyer_id,date,time_slot'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-lawyer-schedule'] });
    }
  });
}

export function useBulkUpdateSchedule() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ date, isAvailable }: { date: string; isAvailable: boolean }) => {
      // Get lawyer id
      const { data: lawyer } = await supabase
        .from('lawyers')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (!lawyer) throw new Error('Lawyer not found');

      // Create all time slot entries
      const schedules = defaultTimeSlots.map(timeSlot => ({
        lawyer_id: lawyer.id,
        date,
        time_slot: timeSlot,
        is_available: isAvailable
      }));

      // Upsert all schedules
      const { error } = await supabase
        .from('lawyer_schedules')
        .upsert(schedules, {
          onConflict: 'lawyer_id,date,time_slot'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-lawyer-schedule'] });
    }
  });
}

// Helper function to get slots for a date from schedule data
export function getSlotsForDate(schedules: LawyerSchedule[], date: string) {
  const dateSchedules = schedules.filter(s => s.date === date);
  
  return defaultTimeSlots.map(time => {
    const schedule = dateSchedules.find(s => s.time_slot === time);
    return {
      time,
      available: schedule ? schedule.is_available : true // Default to available if not set
    };
  });
}

export { defaultTimeSlots };
