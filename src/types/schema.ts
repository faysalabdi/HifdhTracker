// User types
export type UserRole = 'teacher' | 'student';

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

// Student types
export interface Student {
  id: number;
  userId: number;
  name: string;
  currentJuz: number;
  completedJuz: number[];
  currentSurah: number;
  currentAyah: number;
  notes?: string;
  createdAt: string;
}

// TeacherStudent relationship
export interface TeacherStudent {
  teacherId: number;
  studentId: number;
}

// Session (peer revision) types
export interface Session {
  id: number;
  student1Id: number;
  student2Id: number;
  date: string;
  surahStart: number;
  ayahStart: number;
  surahEnd: number;
  ayahEnd: number;
  completed: boolean;
  createdAt: string;
}

// Mistake types for peer sessions
export type MistakeType = 'tajweed' | 'word' | 'stuck';

export interface Mistake {
  id: number;
  sessionId: number;
  studentId: number;
  type: MistakeType;
  ayah: number;
  details?: string;
  createdAt: string;
}

// Lesson types
export interface Lesson {
  id: number;
  teacherId: number;
  studentId: number;
  date: string;
  surahStart: number;
  ayahStart: number;
  surahEnd: number;
  ayahEnd: number;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

// Lesson mistake types
export interface LessonMistake {
  id: number;
  lessonId: number;
  studentId: number;
  type: MistakeType;
  ayah: number;
  details?: string;
  createdAt: string;
}

// Auth related types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterForm extends LoginCredentials {
  name: string;
  role: UserRole;
  confirmPassword: string;
}

// Input forms
export interface StudentForm {
  userId?: number;
  name: string;
  currentJuz?: number;
  completedJuz?: number[];
  currentSurah?: number;
  currentAyah?: number;
  notes?: string;
}

export interface SessionForm {
  student1Id: number;
  student2Id: number;
  date: string;
  surahStart: number;
  ayahStart: number;
  surahEnd: number;
  ayahEnd: number;
}

export interface MistakeForm {
  studentId: number;
  type: MistakeType;
  ayah: number;
  details?: string;
}

export interface LessonForm {
  studentId: number;
  date: string;
  surahStart: number;
  ayahStart: number;
  surahEnd: number;
  ayahEnd: number;
  notes?: string;
}

export interface LessonMistakeForm {
  studentId: number;
  type: MistakeType;
  ayah: number;
  details?: string;
} 