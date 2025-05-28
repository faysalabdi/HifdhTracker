import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MyStudentsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>My Students Screen</Text>
      <Text>To be implemented</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default MyStudentsScreen; 