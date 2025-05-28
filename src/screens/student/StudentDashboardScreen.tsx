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
import { useStudentByUserId } from 'src/hooks/useStudents';
import { useStudentSessions } from 'src/hooks/useSessions';
import { useStudentLessons } from 'src/hooks/useLessons';
import { formatDate } from 'src/utils/utils';
import { formatSurahAndAyahRange, getSurahByNumber } from 'src/utils/surah-data';

interface StudentDashboardScreenProps {
  navigation: any;
}

const StudentDashboardScreen: React.FC<StudentDashboardScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { 
    data: studentData, 
    isLoading: isLoadingStudent, 
    refetch: refetchStudent 
  } = useStudentByUserId(user?.id?.toString() || '');

  const studentId = studentData?.id;

  const { 
    data: sessions, 
    isLoading: isLoadingSessions, 
    refetch: refetchSessions 
  } = useStudentSessions(studentId || 0);
  
  const { 
    data: lessons, 
    isLoading: isLoadingLessons, 
    refetch: refetchLessons 
  } = useStudentLessons(studentId || 0);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchStudent(), 
      studentId ? refetchSessions() : Promise.resolve(), 
      studentId ? refetchLessons() : Promise.resolve()
    ]);
    setRefreshing(false);
  };

  if (isLoadingStudent) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Loading your information...</Text>
      </View>
    );
  }

  if (!studentData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Could not find your student profile. Please contact your teacher or administrator.
        </Text>
      </View>
    );
  }

  const currentSurah = getSurahByNumber(studentData.currentSurah);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {studentData.name}</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Currently at: {currentSurah?.englishName || ''} {studentData.currentSurah}:{studentData.currentAyah}
          </Text>
          <Text style={styles.progressSubtext}>Juz {studentData.currentJuz}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('CreateSession')}
          >
            <Text style={styles.actionIcon}>🔄</Text>
            <Text style={styles.actionTitle}>New Revision</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('MyProfile')}
          >
            <Text style={styles.actionIcon}>👤</Text>
            <Text style={styles.actionTitle}>My Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('MistakeHistory')}
          >
            <Text style={styles.actionIcon}>⚠️</Text>
            <Text style={styles.actionTitle}>My Mistakes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('UpdateProgress')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionTitle}>Update Progress</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Revision Sessions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Revisions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SessionHistory')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {isLoadingSessions ? (
          <ActivityIndicator size="large" color="#2e7d32" />
        ) : !sessions || sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              You haven't had any revision sessions yet.
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => navigation.navigate('CreateSession')}
            >
              <Text style={styles.emptyStateButtonText}>Create Revision</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {sessions.slice(0, 3).map((session) => (
              <TouchableOpacity
                key={session.id}
                style={styles.sessionCard}
                onPress={() => navigation.navigate('SessionDetail', { sessionId: session.id })}
              >
                <View style={[
                  styles.sessionStatus, 
                  session.completed ? styles.sessionCompleted : styles.sessionPending
                ]} />
                <View style={styles.sessionContent}>
                  <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
                  <Text style={styles.sessionRange} numberOfLines={1}>
                    {formatSurahAndAyahRange(
                      session.surahStart, 
                      session.ayahStart, 
                      session.surahEnd, 
                      session.ayahEnd
                    )}
                  </Text>
                  <Text style={styles.sessionPeer} numberOfLines={1}>
                    Partner: {session.partnerName || 'Partner'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Recent Lessons with Teacher */}
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
              You haven't had any lessons with your teacher yet.
            </Text>
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
                  <Text style={styles.lessonTeacher} numberOfLines={1}>
                    Teacher: {lesson.teacherName || 'Teacher'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    color: '#c62828',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#2e7d32',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  progressContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 12,
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressSubtext: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 14,
    marginTop: 4,
  },
  quickActionsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 16,
    marginTop: -20,
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
  sessionCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sessionStatus: {
    width: 8,
  },
  sessionCompleted: {
    backgroundColor: '#4caf50',
  },
  sessionPending: {
    backgroundColor: '#ff9800',
  },
  sessionContent: {
    flex: 1,
    padding: 12,
  },
  sessionDate: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sessionRange: {
    fontSize: 14,
    marginBottom: 4,
  },
  sessionPeer: {
    fontSize: 14,
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
  lessonTeacher: {
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

export default StudentDashboardScreen; 