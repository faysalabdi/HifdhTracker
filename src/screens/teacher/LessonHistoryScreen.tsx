import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useAuth } from 'src/store/AuthContext';
import { useTeacherLessons } from 'src/hooks/useLessons';
import { formatDate } from 'src/utils/utils';
import { formatSurahAndAyahRange } from 'src/utils/surah-data';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lesson } from 'src/types/schema';
import { Icon } from '@rneui/themed';

interface LessonHistoryScreenProps {
  navigation: any;
}

const LessonHistoryScreen: React.FC<LessonHistoryScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  
  const {
    data: lessons,
    isLoading: isLoadingLessons,
    refetch: refetchLessons,
  } = useTeacherLessons(user?.id || '');
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchLessons();
    setRefreshing(false);
  };
  
  const filteredLessons = React.useMemo(() => {
    if (!lessons) return [];
    
    switch (filter) {
      case 'completed':
        return lessons.filter(lesson => lesson.completed);
      case 'pending':
        return lessons.filter(lesson => !lesson.completed);
      default:
        return lessons;
    }
  }, [lessons, filter]);
  
  const navigateToLessonDetail = (lessonId: number) => {
    navigation.navigate('LessonDetail', { lessonId });
  };
  
  const renderLessonItem = ({ item }: { item: Lesson }) => (
    <TouchableOpacity
      style={styles.lessonCard}
      onPress={() => navigateToLessonDetail(item.id)}
    >
      <View style={styles.lessonHeader}>
        <Text style={styles.lessonDate}>{formatDate(item.date)}</Text>
        <View style={[
          styles.statusBadge,
          item.completed ? styles.completedBadge : styles.pendingBadge
        ]}>
          <Text style={styles.statusText}>
            {item.completed ? 'Completed' : 'Upcoming'}
          </Text>
        </View>
      </View>
      
      <View style={styles.lessonDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Range:</Text>
          <Text style={styles.detailValue}>
            {formatSurahAndAyahRange(
              item.surahStart,
              item.ayahStart,
              item.surahEnd,
              item.ayahEnd
            )}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Student:</Text>
          <Text style={styles.detailValue}>
            {item.studentName || 'Student'}
          </Text>
        </View>
        
        {item.notes && (
          <View style={styles.notesRow}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesValue} numberOfLines={2}>
              {item.notes}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.cardFooter}>
        <Icon name="arrow-forward" type="material" size={20} color="#2e7d32" />
      </View>
    </TouchableOpacity>
  );
  
  if (isLoadingLessons && !lessons) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Loading lessons...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lesson History</Text>
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.activeFilter]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.activeFilterText]}>
            Completed
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pending' && styles.activeFilter]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.activeFilterText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredLessons}
        renderItem={renderLessonItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2e7d32']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="school" type="material" size={60} color="#ddd" />
            <Text style={styles.emptyText}>No lessons found</Text>
            <Text style={styles.emptySubtext}>
              Create lessons for your students to track their progress
            </Text>
    </View>
        }
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateLesson')}
      >
        <Icon name="add" type="material" color="#fff" size={24} />
      </TouchableOpacity>
    </SafeAreaView>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#2e7d32',
    padding: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    padding: 8,
  },
  filterButton: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    borderRadius: 5,
  },
  activeFilter: {
    backgroundColor: '#e8f5e9',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  lessonCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lessonDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: '#e8f5e9',
  },
  pendingBadge: {
    backgroundColor: '#fff3e0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  lessonDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 70,
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  notesRow: {
    marginTop: 4,
  },
  notesLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notesValue: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },
  cardFooter: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#2e7d32',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default LessonHistoryScreen; 