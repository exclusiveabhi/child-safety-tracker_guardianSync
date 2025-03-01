// src/screens/ViewAssignedStudents.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ViewAssignedStudents: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FeedBack Screen</Text>

    </View>
  );
};

export default ViewAssignedStudents;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
