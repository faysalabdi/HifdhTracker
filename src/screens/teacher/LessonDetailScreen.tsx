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
  TextInput,
} from 'react-native';
import { useAuth } from 'src/store/AuthContext';
import { useLesson, useCompleteLesson } from 'src/hooks/useLessons';
import { useLessonMistakes, useCreateLessonMistake } from 'src/hooks/useMistakes';
import { formatDate } from 'src/utils/utils';
import { formatSurahAndAyahRange, getSurahByNumber } from 'src/utils/surah-data';
import MistakesList from 'src/components/MistakesList';
import MistakeForm from 'src/components/MistakeForm';
import { MistakeForm as MistakeFormType } from 'src/types/schema';

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
  
  const [isAddingMistake, setIsAddingMistake] = useState(false);
  const [selectedAyah, setSelectedAyah] = useState(1);
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  const { 
    data: lesson, 
    isLoading: isLoadingLesson,
    refetch: refetchLesson
  } = useLesson(lessonId);
  
  const { 
    data: mistakes, 
    isLoading: isLoadingMistakes,
    refetch: refetchMistakes
  } = useLessonMistakes(lessonId);
  
  const createMistakeMutation = useCreateLessonMistake(lessonId);
  const completeLessonMutation = useCompleteLesson();
  
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
  
  const handleAddMistake = (ayah: number) => {
    setSelectedAyah(ayah);
    setIsAddingMistake(true);
  };
  
  const handleSubmitMistake = async (mistake: MistakeFormType) => {
    try {
      await createMistakeMutation.mutateAsync({
        ...mistake,
        studentId: lesson.studentId
      });
      setIsAddingMistake(false);
      refetchMistakes();
    } catch (error) {
      Alert.alert('Error', 'Failed to add mistake: ' + (error as Error).message);
    }
  };
  
  const handleCompleteLesson = async () => {
    try {
      await completeLessonMutation.mutateAsync(lessonId);
      refetchLesson();
      Alert.alert('Success', 'Lesson marked as complete!');
    } catch (error) {
      Alert.alert('Error', 'Failed to complete lesson: ' + (error as Error).message);
    }
  };
  
  const surahStart = getSurahByNumber(lesson.surahStart);
  const surahEnd = getSurahByNumber(lesson.surahEnd);
  
  // Generate array of ayahs in the range
  const ayahRange: number[] = [];
  if (lesson.surahStart === lesson.surahEnd) {
    // Same surah
    for (let i = lesson.ayahStart; i <= lesson.ayahEnd; i++) {
      ayahRange.push(i);
    }
  } else {
    // Different surahs - this is simplified and would need more logic
    // for multiple surahs in the range
    for (let i = lesson.ayahStart; i <= (surahStart?.numberOfAyahs || 0); i++) {
      ayahRange.push(i);
    }
    for (let i = 1; i <= lesson.ayahEnd; i++) {
      ayahRange.push(i);
    }
  }
  
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
            <Text style={styles.detailLabel}>Student:</Text>
            <Text style={styles.detailValue}>{lesson.studentName || 'Student'}</Text>
          </View>
          
          {lesson.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Lesson Notes:</Text>
              <Text style={styles.notesText}>{lesson.notes}</Text>
            </View>
          )}
        </View>
      </View>
      
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
      
      {!lesson.completed && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Record Mistakes</Text>
          
          <Text style={styles.instructionsText}>
            Select an ayah to record a mistake:
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.ayahContainer}
            contentContainerStyle={styles.ayahContent}
          >
            {ayahRange.map((ayah) => (
              <TouchableOpacity
                key={ayah}
                style={styles.ayahButton}
                onPress={() => handleAddMistake(ayah)}
              >
                <Text style={styles.ayahButtonText}>{ayah}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {!lesson.completed && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={additionalNotes}
            onChangeText={setAdditionalNotes}
            placeholder="Add any additional notes about this lesson..."
            multiline
            numberOfLines={4}
          />
        </View>
      )}
      
      {!lesson.completed && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => {
              Alert.alert(
                'Complete Lesson',
                'Are you sure you want to mark this lesson as complete?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Complete', 
                    onPress: handleCompleteLesson
                  }
                ]
              );
            }}
          >
            <Text style={styles.completeButtonText}>
              {completeLessonMutation.isPending ? 'Completing...' : 'Complete Lesson'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Modal for adding mistakes */}
      <Modal
        visible={isAddingMistake}
        transparent
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <MistakeForm
              studentId={lesson.studentId}
              ayah={selectedAyah}
              onSubmit={handleSubmitMistake}
              onCancel={() => setIsAddingMistake(false)}
              isSubmitting={createMistakeMutation.isPending}
            />
          </View>
    </View>
      </Modal>
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
  instructionsText: {
    fontSize: 16,
    marginBottom: 12,
  },
  ayahContainer: {
    marginVertical: 12,
  },
  ayahContent: {
    paddingVertical: 8,
  },
  ayahButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  ayahButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  notesInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actionsContainer: {
    margin: 16,
    marginTop: 0,
  },
  completeButton: {
    backgroundColor: '#2e7d32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
  },
});

export default LessonDetailScreen; 