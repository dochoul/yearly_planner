import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { WorkEntry, NewWorkEntry, UpdateWorkEntry } from '../types';
import { entryKeys } from './useCategories';

export function useWorkEntries(year: number) {
  return useQuery({
    queryKey: entryKeys.byYear(year),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_entries')
        .select('*')
        .eq('year', year)
        .order('created_at');
      if (error) throw error;
      return data as WorkEntry[];
    },
  });
}

export function useAddWorkEntry(year: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newEntry: NewWorkEntry) => {
      const { data, error } = await supabase
        .from('work_entries')
        .insert(newEntry)
        .select()
        .single();
      if (error) throw error;
      return data as WorkEntry;
    },
    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey: entryKeys.byYear(year) });
      const previous = queryClient.getQueryData<WorkEntry[]>(entryKeys.byYear(year));
      const optimistic: WorkEntry = {
        ...newEntry,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      queryClient.setQueryData<WorkEntry[]>(entryKeys.byYear(year), (old = []) => [
        ...old,
        optimistic,
      ]);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(entryKeys.byYear(year), context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: entryKeys.byYear(year) }),
  });
}

export function useUpdateWorkEntry(year: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateWorkEntry) => {
      const { error } = await supabase
        .from('work_entries')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: entryKeys.byYear(year) });
      const previous = queryClient.getQueryData<WorkEntry[]>(entryKeys.byYear(year));
      queryClient.setQueryData<WorkEntry[]>(entryKeys.byYear(year), (old = []) =>
        old.map((e) => (e.id === id ? { ...e, ...updates } : e))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(entryKeys.byYear(year), context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: entryKeys.byYear(year) }),
  });
}

export function useDeleteWorkEntry(year: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('work_entries')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: entryKeys.byYear(year) });
      const previous = queryClient.getQueryData<WorkEntry[]>(entryKeys.byYear(year));
      queryClient.setQueryData<WorkEntry[]>(entryKeys.byYear(year), (old = []) =>
        old.filter((e) => e.id !== id)
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(entryKeys.byYear(year), context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: entryKeys.byYear(year) }),
  });
}
