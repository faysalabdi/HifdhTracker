import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  FlatList
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from 'src/store/AuthContext';
import { useTeacherStudents } from 'src/hooks/useStudents';
import { useCreateLesson } from 'src/hooks/useLessons';
import SurahAyahSelector from 'src/components/SurahAyahSelector';
import { formatDate } from 'src/utils/utils';
import { Icon } from '@rneui/themed';

interface CreateLessonScreenProps {
  navigation: any;
}

const CreateLessonScreen: React.FC<CreateLessonScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const teacherId = user?.id || '';
  const isIOS = Platform.OS === 'ios';
  
  const { data: students, isLoading: isLoadingStudents } = useTeacherStudents(teacherId);
  const createLessonMutation = useCreateLesson(teacherId);
  
  const [studentId, setStudentId] = useState<number | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  
  const [surahStart, setSurahStart] = useState(1);
  const [ayahStart, setAyahStart] = useState(1);
  const [surahEnd, setSurahEnd] = useState(1);
  const [ayahEnd, setAyahEnd] = useState(7);
  
  // State for student selection modal
  const [showStudentModal, setShowStudentModal] = useState(false);
  
  // Get student name for display
  const getStudentName = (id: number | null) => {
    if (!id) return 'Select Student';
    const student = students?.find(s => s.id === id);
    return student?.name || 'Unknown Student';
  };
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  
  const handleStartRangeSelect = (surah: number, ayah: number) => {
    setSurahStart(surah);
    setAyahStart(ayah);
    
    // If end range is before start range, update it
    if (surahEnd < surah || (surahEnd === surah && ayahEnd < ayah)) {
      setSurahEnd(surah);
      setAyahEnd(ayah);
    }
  };
  
  const handleEndRangeSelect = (surah: number, ayah: number) => {
    // Only allow end range to be after start range
    if (surah < surahStart || (surah === surahStart && ayah < ayahStart)) {
      Alert.alert('Invalid Range', 'End point must be after start point');
      return;
    }
    
    setSurahEnd(surah);
    setAyahEnd(ayah);
  };
  
  const handleSelectStudent = (id: number) => {
    setStudentId(id);
    setShowStudentModal(false);
  };
  
  const handleCreateLesson = async () => {
    if (!studentId) {
      Alert.alert('Error', 'Please select a student');
      return;
    }
    
    try {
      await createLessonMutation.mutateAsync({
        studentId,
        date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        surahStart,
        ayahStart,
        surahEnd,
        ayahEnd,
        notes: notes.trim() || undefined,
      });
      
      Alert.alert(
        'Success',
        'Lesson created successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create lesson: ' + (error as Error).message);
    }
  };
  
  if (isLoadingStudents) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Loading students...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Lesson</Text>
      </View>
      
      <View style={styles.formContainer}>
        {/* Student Selection */}
        <Text style={styles.label}>Student</Text>
        {isIOS ? (
          // iOS - TouchableOpacity that opens modal
          <TouchableOpacity 
            style={styles.selectButton}
            onPress={() => setShowStudentModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {getStudentName(studentId)}
            </Text>
            <Icon name="chevron-down" type="feather" size={20} color="#666" />
          </TouchableOpacity>
        ) : (
          // Android - Use native Picker
          <View style={styles.inputField}>
            <Picker
              selectedValue={studentId}
              onValueChange={(value) => setStudentId(Number(value))}
              style={styles.picker}
              dropdownIconColor="#333"
            >
              <Picker.Item label="Select Student" value={null} color="#999" />
              {students?.map((student) => (
                <Picker.Item
                  key={student.id}
                  label={student.name}
                  value={student.id}
                  color="#333"
                />
              ))}
            </Picker>
          </View>
        )}
        
        {/* Date Selection */}
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
        
        {/* Surah and Ayah Range Selection */}
        <SurahAyahSelector
          label="Starting Point"
          initialSurah={surahStart}
          initialAyah={ayahStart}
          onSelect={handleStartRangeSelect}
        />
        
        <SurahAyahSelector
          label="Ending Point"
          initialSurah={surahEnd}
          initialAyah={ayahEnd}
          onSelect={handleEndRangeSelect}
        />
        
        {/* Notes Field */}
        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any notes about this lesson..."
          multiline
          numberOfLines={4}
        />
        
        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.button,
            (!studentId || createLessonMutation.isPending) && styles.buttonDisabled
          ]}
          onPress={handleCreateLesson}
          disabled={!studentId || createLessonMutation.isPending}
        >
          {createLessonMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Lesson</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Student Selection Modal */}
      <Modal
        visible={showStudentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStudentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Student</Text>
              <TouchableOpacity 
                onPress={() => setShowStudentModal(false)}
                style={styles.closeButton}
              >
                <Icon name="x" type="feather" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={students}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.studentItem}
                  onPress={() => handleSelectStudent(item.id)}
                >
                  <Text style={styles.studentName}>{item.name}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.studentList}
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
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  inputField: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 50,
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dateButton: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  notesInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  studentList: {
    paddingBottom: 30,
  },
  studentItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  studentName: {
    fontSize: 16,
    color: '#333',
  },
});

export default CreateLessonScreen; 