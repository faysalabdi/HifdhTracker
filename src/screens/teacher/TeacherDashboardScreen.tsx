import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Alert 
} from 'react-native';
import { useAuth } from 'src/store/AuthContext';
import { useTeacherStudents } from 'src/hooks/useStudents';
import { useTeacherLessons } from 'src/hooks/useLessons';
import { formatDate } from 'src/utils/utils';
import { formatSurahAndAyahRange } from 'src/utils/surah-data';

interface TeacherDashboardScreenProps {
  navigation: any;
}

const TeacherDashboardScreen: React.FC<TeacherDashboardScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  
  const { 
    data: students, 
    isLoading: isLoadingStudents, 
    refetch: refetchStudents 
  } = useTeacherStudents(user?.id?.toString() || '');
  
  const { 
    data: lessons, 
    isLoading: isLoadingLessons, 
    refetch: refetchLessons 
  } = useTeacherLessons(user?.id?.toString() || '');

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStudents(), refetchLessons()]);
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {user?.name || 'Teacher'}</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('CreateLesson')}
          >
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionTitle}>New Lesson</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('MyStudents')}
          >
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionTitle}>My Students</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('CreateSession')}
          >
            <Text style={styles.actionIcon}>🔄</Text>
            <Text style={styles.actionTitle}>Create Revision</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('AllStudents')}
          >
            <Text style={styles.actionIcon}>🔍</Text>
            <Text style={styles.actionTitle}>Find Students</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Students Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Students</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyStudents')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {isLoadingStudents ? (
          <ActivityIndicator size="large" color="#2e7d32" />
        ) : !students || students.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              You don't have any students yet.
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => navigation.navigate('AllStudents')}
            >
              <Text style={styles.emptyStateButtonText}>Find Students</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {students.slice(0, 5).map((student) => (
              <TouchableOpacity
                key={student.id}
                style={styles.studentCard}
                onPress={() => navigation.navigate('StudentDetail', { studentId: student.id })}
              >
                <View style={styles.studentInitial}>
                  <Text style={styles.studentInitialText}>
                    {student.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.studentName} numberOfLines={1}>
                  {student.name}
                </Text>
                <Text style={styles.studentGrade}>
                  Grade: {student.grade}
                </Text>
                <Text style={styles.studentProgress}>
                  Juz: {student.currentJuz}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Recent Lessons Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Lessons</Text>
          <TouchableOpacity onPress={() => navigation.navigate('LessonHistory')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {isLoadingLessons ? (
          <ActivityIndicator size="large" color="#2e7d32" />
        ) : !lessons || lessons.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              You haven't created any lessons yet.
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => navigation.navigate('CreateLesson')}
            >
              <Text style={styles.emptyStateButtonText}>Create Lesson</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {lessons.slice(0, 3).map((lesson) => (
              <TouchableOpacity
                key={lesson.id}
                style={styles.lessonCard}
                onPress={() => navigation.navigate('LessonDetail', { lessonId: lesson.id })}
              >
                <View style={[
                  styles.lessonStatus, 
                  lesson.completed ? styles.lessonCompleted : styles.lessonPending
                ]} />
                <View style={styles.lessonContent}>
                  <Text style={styles.lessonDate}>{formatDate(lesson.date)}</Text>
                  <Text style={styles.lessonRange} numberOfLines={1}>
                    {formatSurahAndAyahRange(
                      lesson.surahStart, 
                      lesson.ayahStart, 
                      lesson.surahEnd, 
                      lesson.ayahEnd
                    )}
                  </Text>
                  <Text style={styles.lessonStudentName} numberOfLines={1}>
                    Student: {lesson.studentName || 'Student'}
                  </Text>
                  {lesson.notes && (
                    <Text style={styles.lessonNotes} numberOfLines={1}>
                      Notes: {lesson.notes}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2e7d32',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  quickActionsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 16,
    marginTop: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 16,
    marginTop: 0,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#2e7d32',
    fontWeight: '500',
  },
  studentCard: {
    width: 120,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  studentInitial: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  studentInitialText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  studentName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  studentGrade: {
    fontSize: 12,
    color: '#666',
  },
  studentProgress: {
    fontSize: 12,
    color: '#666',
  },
  lessonCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
  },
  lessonStatus: {
    width: 8,
  },
  lessonCompleted: {
    backgroundColor: '#4caf50',
  },
  lessonPending: {
    backgroundColor: '#ff9800',
  },
  lessonContent: {
    flex: 1,
    padding: 12,
  },
  lessonDate: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lessonRange: {
    fontSize: 14,
    marginBottom: 4,
  },
  lessonStudentName: {
    fontSize: 14,
    color: '#666',
  },
  lessonNotes: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 5,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default TeacherDashboardScreen; 