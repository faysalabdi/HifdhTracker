import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LessonForm } from 'src/types/schema';
import { 
  createLesson,
  getLesson,
  completeLesson,
  getTeacherLessons,
  getStudentLessons
} from 'src/api/supabaseService';

export function useLesson(id: number) {
  return useQuery({
    queryKey: ['lesson', id],
    queryFn: () => getLesson(id),
    enabled: !!id,
  });
}

export function useTeacherLessons(teacherId: string) {
  return useQuery({
    queryKey: ['teacherLessons', teacherId],
    queryFn: () => getTeacherLessons(teacherId),
    enabled: !!teacherId,
  });
}

export function useStudentLessons(studentId: number) {
  return useQuery({
    queryKey: ['studentLessons', studentId],
    queryFn: () => getStudentLessons(studentId),
    enabled: !!studentId,
  });
}

export function useCreateLesson(teacherId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (lesson: LessonForm) => createLesson(teacherId, lesson),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teacherLessons', teacherId] });
      queryClient.invalidateQueries({ queryKey: ['studentLessons', data.studentId] });
    },
  });
}

export function useCompleteLesson() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => completeLesson(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lesson', data.id] });
      queryClient.invalidateQueries({ queryKey: ['teacherLessons', data.teacherId] });
      queryClient.invalidateQueries({ queryKey: ['studentLessons', data.studentId] });
    },
  });
} 