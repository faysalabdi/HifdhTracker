import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SessionForm } from 'src/types/schema';
import { 
  createSession,
  getSession,
  completeSession,
  getStudentSessions
} from 'src/api/supabaseService';

export function useSession(id: number) {
  return useQuery({
    queryKey: ['session', id],
    queryFn: () => getSession(id),
    enabled: !!id,
  });
}

export function useStudentSessions(studentId: number) {
  return useQuery({
    queryKey: ['studentSessions', studentId],
    queryFn: () => getStudentSessions(studentId),
    enabled: !!studentId,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (session: SessionForm) => createSession(session),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['studentSessions', data.student1Id] });
      queryClient.invalidateQueries({ queryKey: ['studentSessions', data.student2Id] });
    },
  });
}

export function useCompleteSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => completeSession(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['session', data.id] });
      queryClient.invalidateQueries({ queryKey: ['studentSessions', data.student1Id] });
      queryClient.invalidateQueries({ queryKey: ['studentSessions', data.student2Id] });
    },
  });
} 