import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Mistake, LessonMistake } from 'src/types/schema';
import { getMistakeTypeLabel, getMistakeTypeColor } from 'src/hooks/useMistakes';
import { formatDate } from 'src/utils/utils';
import { formatSurahAndAyah } from 'src/utils/surah-data';

interface MistakesListProps {
  mistakes: (Mistake | LessonMistake)[];
  surahNumber?: number;
  isLoading?: boolean;
  showDetailsModal?: (mistake: Mistake | LessonMistake) => void;
}

const MistakesList: React.FC<MistakesListProps> = ({
  mistakes,
  surahNumber,
  isLoading = false,
  showDetailsModal,
}) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading mistakes...</Text>
      </View>
    );
  }

  if (!mistakes || mistakes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No mistakes recorded yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={mistakes}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.mistakeItem}
          onPress={() => showDetailsModal && showDetailsModal(item)}
          disabled={!showDetailsModal}
        >
          <View style={[styles.typeIndicator, { backgroundColor: getMistakeTypeColor(item.type) }]} />
          <View style={styles.mistakeContent}>
            <Text style={styles.mistakeType}>{getMistakeTypeLabel(item.type)}</Text>
            
            <Text style={styles.mistakeLocation}>
              {surahNumber 
                ? `Ayah: ${item.ayah}` 
                : formatSurahAndAyah(surahNumber || 1, item.ayah)
              }
            </Text>
            
            {item.details && (
              <Text style={styles.mistakeDetails} numberOfLines={2}>
                {item.details}
              </Text>
            )}
            
            <Text style={styles.mistakeDate}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingVertical: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mistakeItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 6,
    marginHorizontal: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  typeIndicator: {
    width: 8,
  },
  mistakeContent: {
    flex: 1,
    padding: 12,
  },
  mistakeType: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  mistakeLocation: {
    fontSize: 14,
    marginBottom: 4,
  },
  mistakeDetails: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  mistakeDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});

export default MistakesList; 