import { supabase } from '../utils/supabase';
import { 
  User, Student, Session, Mistake, Lesson, LessonMistake,
  LoginCredentials, RegisterForm, StudentForm, SessionForm,
  MistakeForm, LessonForm, LessonMistakeForm
} from '../types/schema';

// Auth functions
export async function signIn(credentials: LoginCredentials) {
  try {
    console.log('SignIn service called with username:', credentials.username);
    
    // Query our custom users table directly
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', credentials.username)
      .single();
    
    if (userError) {
      console.error('Error finding user:', userError);
      if (userError.code === 'PGRST116') {
        throw new Error('User not found. Please check your email and try again.');
      }
      throw new Error('Invalid username or password');
    }
    
    // Verify the password (in a real app, passwords should be hashed)
    if (userData.password !== credentials.password) {
      console.log('Password mismatch for user:', credentials.username);
      throw new Error('Invalid username or password');
    }
    
    console.log('Login successful, returning user data');
    
    // No need to create a Supabase session, just return the user data
    return { 
      user: userData,
    };
  } catch (error) {
    console.error('Login error in service:', error);
    throw error;
  }
}

export async function signUp(form: RegisterForm) {
  try {
    // First, create the auth user with email (username)
  const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.username, // Username is now the email
    password: form.password,
    options: {
      data: {
        name: form.name,
        role: form.role,
      }
    }
  });
  
    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }
    
    if (!authData.user) {
      throw new Error('No user returned from auth signup');
    }
    
    console.log('Auth signup successful, creating user record');
  
  // Create the user record in our custom users table
    // Let database auto-generate the integer ID
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert({
        // Don't specify id - it's an auto-incrementing integer
      username: form.username,
        password: form.password, // Store password in users table (will be hashed by Supabase)
      name: form.name,
      role: form.role,
        // No auth_id column in the schema
    })
    .select()
    .single();
  
    if (userError) {
      console.error('User insert error:', userError);
      console.log('Error details:', JSON.stringify(userError, null, 2));
      throw userError;
    }
    
    console.log('User record created successfully:', userData);
  
  // If it's a student, also create a student record
    if (form.role === 'student') {
      console.log('Creating student record');
    const { error: studentError } = await supabase
      .from('students')
      .insert({
          user_id: userData.id, // Use the auto-generated ID from users table
        name: form.name,
        current_juz: 1,
        completed_juz: [],
        current_surah: 1,
        current_ayah: 1,
      });
    
      if (studentError) {
        console.error('Student insert error:', studentError);
        console.log('Student error details:', JSON.stringify(studentError, null, 2));
        throw studentError;
      }
  }
  
  return authData;
  } catch (error) {
    console.error('SignUp error:', error);
    throw error;
  }
}

export async function signOut() {
  // No operation needed - auth is now managed in the context with AsyncStorage
  return { success: true };
}

export async function getCurrentUser() {
  // This function is no longer used, auth is now managed in the context with AsyncStorage
  return null;
}

// Student functions
export async function getStudent(id: number) {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as Student;
}

export async function getStudentByUserId(userId: string) {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data as Student;
}

export async function updateStudent(id: number, form: StudentForm) {
  const { data, error } = await supabase
    .from('students')
    .update({
      name: form.name,
      current_juz: form.currentJuz,
      completed_juz: form.completedJuz,
      current_surah: form.currentSurah,
      current_ayah: form.currentAyah,
      notes: form.notes,
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Student;
}

export async function getAllStudents() {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data as Student[];
}

// For teachers to get their students
export async function getTeacherStudents(teacherId: string) {
  const { data, error } = await supabase
    .from('teacher_students')
    .select('students:student_id(*)')
    .eq('teacher_id', teacherId);
  
  if (error) throw error;
  return data.map(item => item.students) as Student[];
}

// Session (Peer Revision) functions
export async function createSession(form: SessionForm) {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      student1_id: form.student1Id,
      student2_id: form.student2Id,
      date: form.date,
      surah_start: form.surahStart,
      ayah_start: form.ayahStart,
      surah_end: form.surahEnd,
      ayah_end: form.ayahEnd,
      completed: false,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Session;
}

export async function getSession(id: number) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as Session;
}

export async function completeSession(id: number) {
  const { data, error } = await supabase
    .from('sessions')
    .update({ completed: true })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Session;
}

export async function getStudentSessions(studentId: number) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .or(`student1_id.eq.${studentId},student2_id.eq.${studentId}`)
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data as Session[];
}

// Mistake functions for peer sessions
export async function createMistake(sessionId: number, form: MistakeForm) {
  const { data, error } = await supabase
    .from('mistakes')
    .insert({
      session_id: sessionId,
      student_id: form.studentId,
      type: form.type,
      ayah: form.ayah,
      details: form.details,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Mistake;
}

export async function getSessionMistakes(sessionId: number) {
  const { data, error } = await supabase
    .from('mistakes')
    .select('*')
    .eq('session_id', sessionId)
    .order('ayah');
  
  if (error) throw error;
  return data as Mistake[];
}

export async function getStudentMistakes(studentId: number) {
  const { data, error } = await supabase
    .from('mistakes')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Mistake[];
}

// Lesson functions
export async function createLesson(teacherId: string, form: LessonForm) {
  const { data, error } = await supabase
    .from('lessons')
    .insert({
      teacher_id: teacherId,
      student_id: form.studentId,
      date: form.date,
      surah_start: form.surahStart,
      ayah_start: form.ayahStart,
      surah_end: form.surahEnd,
      ayah_end: form.ayahEnd,
      notes: form.notes,
      completed: false,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Lesson;
}

export async function getLesson(id: number) {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as Lesson;
}

export async function completeLesson(id: number) {
  const { data, error } = await supabase
    .from('lessons')
    .update({ completed: true })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Lesson;
}

export async function getTeacherLessons(teacherId: string) {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data as Lesson[];
}

export async function getStudentLessons(studentId: number) {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('student_id', studentId)
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data as Lesson[];
}

// Lesson mistake functions
export async function createLessonMistake(lessonId: number, form: LessonMistakeForm) {
  const { data, error } = await supabase
    .from('lesson_mistakes')
    .insert({
      lesson_id: lessonId,
      student_id: form.studentId,
      type: form.type,
      ayah: form.ayah,
      details: form.details,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as LessonMistake;
}

export async function getLessonMistakes(lessonId: number) {
  const { data, error } = await supabase
    .from('lesson_mistakes')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('ayah');
  
  if (error) throw error;
  return data as LessonMistake[];
}

export async function getStudentLessonMistakes(studentId: number) {
  const { data, error } = await supabase
    .from('lesson_mistakes')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as LessonMistake[];
}

// Analytics functions
export async function getStudentMistakeStats(studentId: number) {
  // Get peer session mistakes
  const { data: peerMistakes, error: peerError } = await supabase
    .from('mistakes')
    .select('type, count')
    .eq('student_id', studentId)
    .group('type');
  
  if (peerError) throw peerError;
  
  // Get lesson mistakes
  const { data: lessonMistakes, error: lessonError } = await supabase
    .from('lesson_mistakes')
    .select('type, count')
    .eq('student_id', studentId)
    .group('type');
  
  if (lessonError) throw lessonError;
  
  // Combine and sum the counts
  const combinedStats: Record<string, number> = {};
  
  peerMistakes.forEach((stat: any) => {
    combinedStats[stat.type] = (combinedStats[stat.type] || 0) + parseInt(stat.count);
  });
  
  lessonMistakes.forEach((stat: any) => {
    combinedStats[stat.type] = (combinedStats[stat.type] || 0) + parseInt(stat.count);
  });
  
  return Object.entries(combinedStats).map(([type, count]) => ({ type, count }));
} 