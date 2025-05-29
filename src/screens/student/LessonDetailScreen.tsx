import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useAuth } from 'src/store/AuthContext';
import { useLesson } from 'src/hooks/useLessons';
import { useLessonMistakes } from 'src/hooks/useMistakes';
import { formatDate } from 'src/utils/utils';
import { formatSurahAndAyahRange, getSurahByNumber } from 'src/utils/surah-data';
import MistakesList from 'src/components/MistakesList';
import { MistakeType } from 'src/types/schema';
import { getMistakeTypeLabel, getMistakeTypeColor } from 'src/hooks/useMistakes';

interface LessonDetailScreenProps {
  route: {
    params: {
      lessonId: number;
    };
  };
  navigation: any;
}

const LessonDetailScreen: React.FC<LessonDetailScreenProps> = ({ route, navigation }) => {
  const { lessonId } = route.params;
  const { user } = useAuth();
  
  const { 
    data: lesson, 
    isLoading: isLoadingLesson,
  } = useLesson(lessonId);
  
  const { 
    data: mistakes, 
    isLoading: isLoadingMistakes,
    refetch: refetchMistakes
  } = useLessonMistakes(lessonId);
  
  if (isLoadingLesson) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Loading lesson details...</Text>
      </View>
    );
  }
  
  if (!lesson) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Lesson not found. It may have been deleted.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Group mistakes by type
  const mistakesByType: Record<MistakeType, number> = {
    tajweed: 0,
    word: 0,
    stuck: 0
  };
  
  if (mistakes && mistakes.length > 0) {
    mistakes.forEach(mistake => {
      mistakesByType[mistake.type]++;
    });
  }
  
  const surahStart = getSurahByNumber(lesson.surahStart);
  const surahEnd = getSurahByNumber(lesson.surahEnd);
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lesson Details</Text>
        <Text style={styles.subtitle}>{formatDate(lesson.date)}</Text>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Lesson Information</Text>
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Range:</Text>
            <Text style={styles.detailValue}>
              {formatSurahAndAyahRange(
                lesson.surahStart,
                lesson.ayahStart,
                lesson.surahEnd,
                lesson.ayahEnd
              )}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={[
              styles.detailValue,
              lesson.completed ? styles.completed : styles.pending
            ]}>
              {lesson.completed ? 'Completed' : 'In Progress'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Teacher:</Text>
            <Text style={styles.detailValue}>{lesson.teacherName || 'Teacher'}</Text>
          </View>
          
          {lesson.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Lesson Notes:</Text>
              <Text style={styles.notesText}>{lesson.notes}</Text>
            </View>
          )}
        </View>
      </View>
      
      {mistakes && mistakes.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Mistake Summary</Text>
          <View style={styles.summaryContainer}>
            {Object.entries(mistakesByType).map(([type, count]) => (
              <View 
                key={type} 
                style={[
                  styles.summaryItem, 
                  { borderColor: getMistakeTypeColor(type as MistakeType) }
                ]}
              >
                <Text style={styles.summaryCount}>{count}</Text>
                <Text style={styles.summaryLabel}>
                  {getMistakeTypeLabel(type as MistakeType)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mistakes</Text>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={() => refetchMistakes()}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
        
        <MistakesList 
          mistakes={mistakes || []} 
          isLoading={isLoadingMistakes} 
          surahNumber={lesson.surahStart}
        />
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
    fontSize: 16,
    color: '#e53935',
    marginBottom: 16,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#2e7d32',
    padding: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#2e7d32',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    marginBottom: 12,
  },
  refreshButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
  },
  refreshButtonText: {
    fontSize: 12,
    color: '#666',
  },
  detailsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  completed: {
    color: '#4caf50',
  },
  pending: {
    color: '#ff9800',
  },
  notesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    margin: 4,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
  },
  summaryCount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default LessonDetailScreen; 