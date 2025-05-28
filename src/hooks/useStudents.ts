import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StudentForm } from 'src/types/schema';
import { 
  getStudent,
  getStudentByUserId,
  updateStudent,
  getAllStudents,
  getTeacherStudents
} from 'src/api/supabaseService';

export function useStudent(id: number) {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => getStudent(id),
    enabled: !!id,
  });
}

export function useStudentByUserId(userId: string) {
  return useQuery({
    queryKey: ['studentByUserId', userId],
    queryFn: () => getStudentByUserId(userId),
    enabled: !!userId,
  });
}

export function useAllStudents() {
  return useQuery({
    queryKey: ['allStudents'],
    queryFn: () => getAllStudents(),
  });
}

export function useTeacherStudents(teacherId: string) {
  return useQuery({
    queryKey: ['teacherStudents', teacherId],
    queryFn: () => getTeacherStudents(teacherId),
    enabled: !!teacherId,
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, form }: { id: number, form: StudentForm }) => 
      updateStudent(id, form),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['student', data.id] });
      queryClient.invalidateQueries({ queryKey: ['studentByUserId', data.userId] });
      queryClient.invalidateQueries({ queryKey: ['allStudents'] });
      // We don't know which teacher this student belongs to, so invalidate all teacher students
      queryClient.invalidateQueries({ queryKey: ['teacherStudents'] });
    },
  });
} 