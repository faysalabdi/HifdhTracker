import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getSurahByNumber, surahs } from 'src/utils/surah-data';

interface SurahAyahSelectorProps {
  label?: string;
  initialSurah?: number;
  initialAyah?: number;
  onSelect: (surah: number, ayah: number) => void;
}

const SurahAyahSelector: React.FC<SurahAyahSelectorProps> = ({
  label = 'Select Surah & Ayah',
  initialSurah = 1,
  initialAyah = 1,
  onSelect,
}) => {
  const [selectedSurah, setSelectedSurah] = useState(initialSurah);
  const [selectedAyah, setSelectedAyah] = useState(initialAyah);
  const [maxAyah, setMaxAyah] = useState(7); // Default for Al-Fatihah

  useEffect(() => {
    // Update maxAyah when surah changes
    const surah = getSurahByNumber(selectedSurah);
    if (surah) {
      setMaxAyah(surah.numberOfAyahs);
      
      // Reset ayah if it's greater than the max for this surah
      if (selectedAyah > surah.numberOfAyahs) {
        setSelectedAyah(1);
      }
    }
  }, [selectedSurah]);

  useEffect(() => {
    // Notify parent component when selection changes
    onSelect(selectedSurah, selectedAyah);
  }, [selectedSurah, selectedAyah, onSelect]);

  // Generate ayah numbers for current surah
  const ayahNumbers = Array.from({ length: maxAyah }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.selectors}>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Surah</Text>
          <Picker
            selectedValue={selectedSurah}
            onValueChange={(value) => setSelectedSurah(Number(value))}
            style={styles.picker}
          >
            {surahs.map((surah) => (
              <Picker.Item
                key={surah.number}
                label={`${surah.number}. ${surah.englishName}`}
                value={surah.number}
              />
            ))}
          </Picker>
        </View>
        
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Ayah</Text>
          <Picker
            selectedValue={selectedAyah}
            onValueChange={(value) => setSelectedAyah(Number(value))}
            style={styles.picker}
          >
            {ayahNumbers.map((ayah) => (
              <Picker.Item
                key={ayah}
                label={ayah.toString()}
                value={ayah}
              />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  selectors: {
    flexDirection: 'row',
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  pickerLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  picker: {
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
});

export default SurahAyahSelector; 