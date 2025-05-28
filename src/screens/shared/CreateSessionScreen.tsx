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
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from 'src/store/AuthContext';
import { useAllStudents } from 'src/hooks/useStudents';
import { useCreateSession } from 'src/hooks/useSessions';
import SurahAyahSelector from 'src/components/SurahAyahSelector';
import { formatDate } from 'src/utils/utils';

interface CreateSessionScreenProps {
  navigation: any;
}

const CreateSessionScreen: React.FC<CreateSessionScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  
  const { data: students, isLoading: isLoadingStudents } = useAllStudents();
  const createSessionMutation = useCreateSession();
  
  const [student1Id, setStudent1Id] = useState<number | null>(null);
  const [student2Id, setStudent2Id] = useState<number | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [surahStart, setSurahStart] = useState(1);
  const [ayahStart, setAyahStart] = useState(1);
  const [surahEnd, setSurahEnd] = useState(1);
  const [ayahEnd, setAyahEnd] = useState(7);
  
  // If user is a student, automatically set student1Id to their student ID
  useEffect(() => {
    if (!isTeacher && user) {
      // Here you'd need to fetch the student ID associated with this user
      // For now, we'll assume that's handled elsewhere
      // setStudent1Id(user.studentId);
    }
  }, [user, isTeacher]);
  
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
  
  const handleCreateSession = async () => {
    if (!student1Id || !student2Id) {
      Alert.alert('Error', 'Please select both students');
      return;
    }
    
    if (student1Id === student2Id) {
      Alert.alert('Error', 'Please select different students');
      return;
    }
    
    try {
      await createSessionMutation.mutateAsync({
        student1Id,
        student2Id,
        date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        surahStart,
        ayahStart,
        surahEnd,
        ayahEnd,
      });
      
      Alert.alert(
        'Success',
        'Revision session created successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create session: ' + (error as Error).message);
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
        <Text style={styles.title}>Create Revision Session</Text>
      </View>
      
      <View style={styles.formContainer}>
        {/* Student Selection */}
        <Text style={styles.label}>First Student</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={student1Id}
            onValueChange={(value) => setStudent1Id(Number(value))}
            enabled={isTeacher} // Only enable if user is a teacher
            style={styles.picker}
          >
            <Picker.Item label="Select Student" value={null} />
            {students?.map((student) => (
              <Picker.Item
                key={student.id}
                label={student.name}
                value={student.id}
              />
            ))}
          </Picker>
        </View>
        
        <Text style={styles.label}>Second Student</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={student2Id}
            onValueChange={(value) => setStudent2Id(Number(value))}
            style={styles.picker}
          >
            <Picker.Item label="Select Student" value={null} />
            {students?.map((student) => (
              <Picker.Item
                key={student.id}
                label={student.name}
                value={student.id}
              />
            ))}
          </Picker>
        </View>
        
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
            (!student1Id || !student2Id || createSessionMutation.isPending) && styles.buttonDisabled
          ]}
          onPress={handleCreateSession}
          disabled={!student1Id || !student2Id || createSessionMutation.isPending}
        >
          {createSessionMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Session</Text>
          )}
        </TouchableOpacity>
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
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 16,
  },
  picker: {
    height: 50,
  },
  dateButton: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    marginBottom: 16,
  },
  dateButtonText: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2e7d32',
    borderRadius: 5,
    padding: 15,
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
});

export default CreateSessionScreen; 