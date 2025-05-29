import React, { useState, useEffect } from 'react';
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
import { useAllStudents, useStudentByUserId } from 'src/hooks/useStudents';
import { useCreateSession } from 'src/hooks/useSessions';
import SurahAyahSelector from 'src/components/SurahAyahSelector';
import { formatDate } from 'src/utils/utils';
import { Icon } from '@rneui/themed';

interface CreateSessionScreenProps {
  navigation: any;
}

const CreateSessionScreen: React.FC<CreateSessionScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const isIOS = Platform.OS === 'ios';
  
  const { data: students, isLoading: isLoadingStudents } = useAllStudents();
  const { data: currentStudent, isLoading: isLoadingCurrentStudent } = useStudentByUserId(user?.id || '');
  const createSessionMutation = useCreateSession();
  
  // Do not set default values until we have loaded the data
  const [student1Id, setStudent1Id] = useState<number | null>(null);
  const [student2Id, setStudent2Id] = useState<number | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [surahStart, setSurahStart] = useState(1);
  const [ayahStart, setAyahStart] = useState(1);
  const [surahEnd, setSurahEnd] = useState(1);
  const [ayahEnd, setAyahEnd] = useState(7);
  
  // State for the student selection modal
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectingStudent, setSelectingStudent] = useState<'first' | 'second'>('first');
  
  // For debugging purposes
  const [debugMsg, setDebugMsg] = useState<string>('');
  
  // Get student names for display
  const getStudentName = (id: number | null) => {
    if (!id) return 'Select Student';
    const student = students?.find(s => s.id === id);
    return student?.name || 'Unknown Student';
  };
  
  // Set current student as first student when data is loaded
  useEffect(() => {
    if (currentStudent && currentStudent.id) {
      console.log('Setting student1Id to:', currentStudent.id);
      setDebugMsg(prev => prev + `\nSetting student1Id from currentStudent: ${currentStudent.id}`);
      setStudent1Id(currentStudent.id);
    } else if (currentStudent) {
      setDebugMsg(prev => prev + `\nCurrentStudent exists but has no ID: ${JSON.stringify(currentStudent)}`);
    } else {
      setDebugMsg(prev => prev + `\nCurrentStudent not loaded yet`);
    }
  }, [currentStudent]);
  
  // Set first available student that's not student1 as student2 when students load
  useEffect(() => {
    if (students && students.length > 0 && student1Id) {
      // Get all students except the one selected as student1
      const otherStudents = students.filter(s => s.id !== student1Id);
      
      if (otherStudents.length > 0 && !student2Id) {
        const otherStudent = otherStudents[0];
        console.log('Setting student2Id to first available:', otherStudent.id);
        setDebugMsg(prev => prev + `\nSetting student2Id to: ${otherStudent.id}`);
        setStudent2Id(otherStudent.id);
      } else if (otherStudents.length === 0) {
        setDebugMsg(prev => prev + `\nNo other students available besides student1Id: ${student1Id}`);
      }
    }
  }, [students, student1Id]);
  
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
  
  const openStudentSelector = (type: 'first' | 'second') => {
    if (type === 'first' && !isTeacher) return; // Disable for non-teachers if first student
    setSelectingStudent(type);
    setShowStudentModal(true);
  };
  
  const handleSelectStudent = (id: number) => {
    if (selectingStudent === 'first') {
      if (id === student2Id) {
        Alert.alert('Error', 'Please select different students for first and second position');
        return;
      }
      setStudent1Id(id);
      setDebugMsg(prev => prev + `\nManually selected student1Id: ${id}`);
    } else {
      if (id === student1Id) {
        Alert.alert('Error', 'Please select different students for first and second position');
        return;
      }
      setStudent2Id(id);
      setDebugMsg(prev => prev + `\nManually selected student2Id: ${id}`);
    }
    setShowStudentModal(false);
  };
  
  const handleCreateSession = async () => {
    // Force using current student's ID for first student if available
    const finalStudent1Id = student1Id || (currentStudent?.id || null);
    
    // Log debug information
    const debugInfo = `
      Current student: ${JSON.stringify(currentStudent)}
      First student ID (state): ${student1Id}
      Second student ID (state): ${student2Id}
      Final first student ID: ${finalStudent1Id}
    `;
    console.log('Debug info:', debugInfo);
    setDebugMsg(prev => prev + `\nAttempting to create session with: ${finalStudent1Id}, ${student2Id}`);
    
    if (!finalStudent1Id || !student2Id) {
      Alert.alert('Error', `Please select both students. Current values: First=${finalStudent1Id}, Second=${student2Id}`);
      return;
    }
    
    if (finalStudent1Id === student2Id) {
      Alert.alert('Error', 'Please select different students');
      return;
    }
    
    try {
      console.log('Creating session with:', {
        student1Id: finalStudent1Id,
        student2Id,
        date: date.toISOString().split('T')[0],
        surahStart,
        ayahStart,
        surahEnd,
        ayahEnd,
      });
      
      // Create the session and capture the response which has the session ID
      const newSession = await createSessionMutation.mutateAsync({
        student1Id: finalStudent1Id,
        student2Id: student2Id,
        date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        surahStart,
        ayahStart,
        surahEnd,
        ayahEnd,
      });
      
      // If creation was successful, navigate to the session detail screen
      if (newSession && newSession.id) {
        Alert.alert(
          'Success',
          'Revision session created successfully',
          [{ 
            text: 'OK', 
            onPress: () => navigation.replace('SessionDetail', { sessionId: newSession.id })
          }]
        );
      } else {
        // Fallback if for some reason the session object doesn't have an ID
        Alert.alert(
          'Success',
          'Revision session created successfully',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Session creation error:', error);
      setDebugMsg(prev => prev + `\nError creating session: ${(error as Error).message}`);
      Alert.alert('Error', 'Failed to create session: ' + (error as Error).message);
    }
  };
  
  const isLoading = isLoadingStudents || isLoadingCurrentStudent;
  
  // This flag determines if the button should be enabled - now it's only disabled during submission
  const isCreateButtonDisabled = createSessionMutation.isPending;
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Loading students...</Text>
      </View>
    );
  }
  
  // Ensure we have students data before rendering
  if (!students || students.length < 2) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Not enough students found. Please add at least two students to the system.</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // If we're not a teacher and student1Id isn't set yet but we have currentStudent data
  if (!isTeacher && !student1Id && currentStudent) {
    console.log('Setting student1Id to currentStudent.id in render', currentStudent.id);
    setDebugMsg(prev => prev + `\nSetting student1Id in render: ${currentStudent.id}`);
    setStudent1Id(currentStudent.id);
  }
  
  // Determine student name to display
  const firstStudentName = isTeacher 
    ? getStudentName(student1Id)
    : (currentStudent?.name || 'You');
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Revision Session</Text>
      </View>
      
      <View style={styles.formContainer}>
        {/* Student Selection */}
        <Text style={styles.label}>First Student</Text>
        {isIOS ? (
          // iOS - TouchableOpacity that opens modal
          <TouchableOpacity 
            style={styles.selectButton}
            onPress={() => openStudentSelector('first')}
            disabled={!isTeacher}
          >
            <Text style={styles.selectButtonText}>{firstStudentName}</Text>
            {isTeacher && <Icon name="chevron-down" type="feather" size={20} color="#666" />}
          </TouchableOpacity>
        ) : (
          // Android - Use native Picker
          <View style={styles.inputField}>
            {isTeacher ? (
              <Picker
                selectedValue={student1Id}
                onValueChange={(value) => setStudent1Id(Number(value))}
                style={styles.picker}
                dropdownIconColor="#333"
              >
                <Picker.Item label="Select Student" value={null} />
                {students?.map((student) => (
                  <Picker.Item
                    key={student.id}
                    label={student.name}
                    value={student.id}
                    color="#333"
                  />
                ))}
              </Picker>
            ) : (
              <Text style={styles.staticText}>{firstStudentName}</Text>
            )}
          </View>
        )}
        
        <Text style={styles.label}>Second Student</Text>
        {isIOS ? (
          // iOS - TouchableOpacity that opens modal
          <TouchableOpacity 
            style={styles.selectButton}
            onPress={() => openStudentSelector('second')}
          >
            <Text style={styles.selectButtonText}>
              {getStudentName(student2Id)}
            </Text>
            <Icon name="chevron-down" type="feather" size={20} color="#666" />
          </TouchableOpacity>
        ) : (
          // Android - Use native Picker
          <View style={styles.inputField}>
            <Picker
              selectedValue={student2Id}
              onValueChange={(value) => setStudent2Id(Number(value))}
              style={styles.picker}
              dropdownIconColor="#333"
            >
              <Picker.Item label="Select Student" value={null} color="#999" />
              {students?.filter(student => student.id !== student1Id).map((student) => (
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
        
        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.button,
            isCreateButtonDisabled && styles.buttonDisabled
          ]}
          onPress={handleCreateSession}
          disabled={isCreateButtonDisabled}
        >
          {createSessionMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Session</Text>
          )}
        </TouchableOpacity>
        
        {/* Debug info - always show for troubleshooting */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>Student1Id: {student1Id}</Text>
          <Text style={styles.debugText}>Student2Id: {student2Id}</Text>
          <Text style={styles.debugText}>CurrentStudent: {currentStudent ? JSON.stringify(currentStudent) : 'null'}</Text>
          <Text style={styles.debugText}>IsTeacher: {isTeacher ? 'Yes' : 'No'}</Text>
          <Text style={styles.debugText}>Available Students: {students?.map(s => `${s.id}:${s.name}`).join(', ')}</Text>
          <Text style={styles.debugText}>Debug Log: {debugMsg}</Text>
        </View>
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
              <Text style={styles.modalTitle}>
                Select {selectingStudent === 'first' ? 'First' : 'Second'} Student
              </Text>
              <TouchableOpacity 
                onPress={() => setShowStudentModal(false)}
                style={styles.closeButton}
              >
                <Icon name="x" type="feather" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={students?.filter(student => 
                (selectingStudent === 'first' ? student.id !== student2Id : student.id !== student1Id)
              )}
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
  staticText: {
    fontSize: 16,
    paddingHorizontal: 15,
    color: '#333',
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
  debugContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
  }
});

export default CreateSessionScreen; 