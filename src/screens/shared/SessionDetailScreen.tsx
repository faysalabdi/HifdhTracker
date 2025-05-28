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
import { useSession } from 'src/hooks/useSessions';
import { useSessionMistakes, useCreateSessionMistake } from 'src/hooks/useMistakes';
import { formatDate } from 'src/utils/utils';
import { formatSurahAndAyahRange, getSurahByNumber } from 'src/utils/surah-data';
import MistakesList from 'src/components/MistakesList';
import MistakeForm from 'src/components/MistakeForm';
import { MistakeForm as MistakeFormType } from 'src/types/schema';

interface SessionDetailScreenProps {
  route: {
    params: {
      sessionId: number;
    };
  };
  navigation: any;
}

const SessionDetailScreen: React.FC<SessionDetailScreenProps> = ({ route, navigation }) => {
  const { sessionId } = route.params;
  const { user } = useAuth();
  
  const [isAddingMistake, setIsAddingMistake] = useState(false);
  const [selectedAyah, setSelectedAyah] = useState(1);
  
  const { 
    data: session, 
    isLoading: isLoadingSession,
    refetch: refetchSession
  } = useSession(sessionId);
  
  const { 
    data: mistakes, 
    isLoading: isLoadingMistakes,
    refetch: refetchMistakes
  } = useSessionMistakes(sessionId);
  
  const createMistakeMutation = useCreateSessionMistake(sessionId);
  
  if (isLoadingSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Loading session details...</Text>
      </View>
    );
  }
  
  if (!session) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Session not found. It may have been deleted.
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
      await createMistakeMutation.mutateAsync(mistake);
      setIsAddingMistake(false);
      refetchMistakes();
    } catch (error) {
      Alert.alert('Error', 'Failed to add mistake: ' + (error as Error).message);
    }
  };
  
  const surahStart = getSurahByNumber(session.surahStart);
  const surahEnd = getSurahByNumber(session.surahEnd);
  
  // Generate array of ayahs in the range
  const ayahRange: number[] = [];
  if (session.surahStart === session.surahEnd) {
    // Same surah
    for (let i = session.ayahStart; i <= session.ayahEnd; i++) {
      ayahRange.push(i);
    }
  } else {
    // Different surahs - this is simplified and would need more logic
    // for multiple surahs in the range
    for (let i = session.ayahStart; i <= (surahStart?.numberOfAyahs || 0); i++) {
      ayahRange.push(i);
    }
    for (let i = 1; i <= session.ayahEnd; i++) {
      ayahRange.push(i);
    }
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Revision Session</Text>
        <Text style={styles.subtitle}>{formatDate(session.date)}</Text>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Session Details</Text>
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Range:</Text>
            <Text style={styles.detailValue}>
              {formatSurahAndAyahRange(
                session.surahStart,
                session.ayahStart,
                session.surahEnd,
                session.ayahEnd
              )}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={[
              styles.detailValue,
              session.completed ? styles.completed : styles.pending
            ]}>
              {session.completed ? 'Completed' : 'In Progress'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Student 1:</Text>
            <Text style={styles.detailValue}>{session.student1Name || 'Student 1'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Student 2:</Text>
            <Text style={styles.detailValue}>{session.student2Name || 'Student 2'}</Text>
          </View>
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
          surahNumber={session.surahStart}
        />
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Add Mistake</Text>
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
      
      {!session.completed && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => {
              // Logic to complete the session
              // This would be implemented with a mutation hook
              Alert.alert(
                'Complete Session',
                'Are you sure you want to mark this session as complete?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Complete', 
                    onPress: () => {
                      // Logic to complete session
                    }
                  }
                ]
              );
            }}
          >
            <Text style={styles.completeButtonText}>Complete Session</Text>
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
              studentId={0} // This should be the ID of the student making a mistake
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
    textAlign: 'center',
    color: '#c62828',
    fontSize: 16,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#2e7d32',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  sectionContainer: {
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
    marginBottom: 12,
  },
  detailsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 80,
    fontWeight: '500',
    color: '#666',
  },
  detailValue: {
    flex: 1,
    color: '#333',
  },
  completed: {
    color: '#4caf50',
    fontWeight: 'bold',
  },
  pending: {
    color: '#ff9800',
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  refreshButtonText: {
    color: '#555',
    fontSize: 14,
  },
  instructionsText: {
    marginBottom: 12,
    color: '#666',
  },
  ayahContainer: {
    marginBottom: 16,
  },
  ayahContent: {
    paddingVertical: 10,
  },
  ayahButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  ayahButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionsContainer: {
    padding: 16,
    marginBottom: 20,
  },
  completeButton: {
    backgroundColor: '#2e7d32',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
  },
});

export default SessionDetailScreen; 