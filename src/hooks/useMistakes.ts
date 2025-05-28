import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MistakeForm, MistakeType } from 'src/types/schema';
import { 
  createMistake, 
  getSessionMistakes, 
  getStudentMistakes, 
  createLessonMistake, 
  getLessonMistakes,
  getStudentLessonMistakes
} from 'src/api/supabaseService';

export function useSessionMistakes(sessionId: number) {
  return useQuery({
    queryKey: ['sessionMistakes', sessionId],
    queryFn: () => getSessionMistakes(sessionId),
    enabled: !!sessionId,
  });
}

export function useStudentMistakes(studentId: number) {
  return useQuery({
    queryKey: ['studentMistakes', studentId],
    queryFn: () => getStudentMistakes(studentId),
    enabled: !!studentId,
  });
}

export function useLessonMistakes(lessonId: number) {
  return useQuery({
    queryKey: ['lessonMistakes', lessonId],
    queryFn: () => getLessonMistakes(lessonId),
    enabled: !!lessonId,
  });
}

export function useStudentLessonMistakes(studentId: number) {
  return useQuery({
    queryKey: ['studentLessonMistakes', studentId],
    queryFn: () => getStudentLessonMistakes(studentId),
    enabled: !!studentId,
  });
}

export function useCreateSessionMistake(sessionId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (mistake: MistakeForm) => createMistake(sessionId, mistake),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessionMistakes', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['studentMistakes', variables.studentId] });
    },
  });
}

export function useCreateLessonMistake(lessonId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (mistake: MistakeForm) => createLessonMistake(lessonId, mistake),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lessonMistakes', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['studentLessonMistakes', variables.studentId] });
    },
  });
}

// Helper function to get color for mistake type
export function getMistakeTypeColor(type: MistakeType): string {
  switch (type) {
    case 'tajweed':
      return '#FFA500'; // Orange
    case 'word':
      return '#FF0000'; // Red
    case 'stuck':
      return '#8B0000'; // Dark Red
    default:
      return '#333333'; // Default dark gray
  }
}

// Helper function to get label for mistake type
export function getMistakeTypeLabel(type: MistakeType): string {
  switch (type) {
    case 'tajweed':
      return 'Tajweed Mistake';
    case 'word':
      return 'Word Mistake';
    case 'stuck':
      return 'Stuck';
    default:
      return type;
  }
} 