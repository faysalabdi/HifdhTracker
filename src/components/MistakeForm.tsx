import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MistakeForm as MistakeFormType, MistakeType } from 'src/types/schema';
import { getMistakeTypeLabel, getMistakeTypeColor } from 'src/hooks/useMistakes';

interface MistakeFormProps {
  studentId: number;
  ayah: number;
  onSubmit: (mistake: MistakeFormType) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const MistakeForm: React.FC<MistakeFormProps> = ({
  studentId,
  ayah,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [type, setType] = useState<MistakeType>('word');
  const [details, setDetails] = useState('');

  const handleSubmit = () => {
    onSubmit({
      studentId,
      type,
      ayah,
      details: details.trim() || undefined,
    });
  };

  const mistakeTypes: MistakeType[] = ['tajweed', 'word', 'stuck'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Record Mistake</Text>
      <Text style={styles.label}>Ayah: {ayah}</Text>
      
      <Text style={styles.label}>Mistake Type:</Text>
      <View style={styles.typeContainer}>
        {mistakeTypes.map((mistakeType) => (
          <TouchableOpacity
            key={mistakeType}
            style={[
              styles.typeButton,
              type === mistakeType && styles.selectedTypeButton,
              { borderColor: getMistakeTypeColor(mistakeType) },
            ]}
            onPress={() => setType(mistakeType)}
          >
            <Text 
              style={[
                styles.typeButtonText,
                type === mistakeType && styles.selectedTypeButtonText,
                { color: type === mistakeType ? '#fff' : getMistakeTypeColor(mistakeType) },
              ]}
            >
              {getMistakeTypeLabel(mistakeType)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.label}>Details (Optional):</Text>
      <TextInput
        style={styles.input}
        value={details}
        onChangeText={setDetails}
        placeholder="Enter any additional details"
        multiline
        numberOfLines={3}
      />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Saving...' : 'Save Mistake'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedTypeButton: {
    backgroundColor: '#ff6347',
  },
  typeButtonText: {
    fontWeight: '500',
    fontSize: 12,
  },
  selectedTypeButtonText: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    minHeight: 80,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 12,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  submitButton: {
    backgroundColor: '#4caf50',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MistakeForm; 