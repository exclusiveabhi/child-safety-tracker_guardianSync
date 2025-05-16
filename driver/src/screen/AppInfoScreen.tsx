// src/screens/ViewAssignedStudents.tsx
import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';

const ViewAssignedStudents: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🛡️ GuardianSync 🛡️</Text>
      <Text style={styles.paragraph}>
        Welcome to GuardianSync! This app is designed to ensure the safety of children during their daily commutes 🚍. With real-time tracking, secure authentication, and smart notifications, we make child safety a top priority.
      </Text>
      <Text style={styles.subtitle}>🌟 Key Features:</Text>
      <Text style={styles.paragraph}>✅ Real-time GPS location tracking</Text>
      <Text style={styles.paragraph}>✅ Secure authentication with JWT 🔒</Text>
      <Text style={styles.paragraph}>✅ Advance facial recognition with socket.io 👶</Text>
      <Text style={styles.paragraph}>✅ Automated status updates & SMS notifications 📱</Text>
      <Text style={styles.paragraph}>
        Built with React Native CLI and TypeScript, GuardianSync offers an intuitive interface for both drivers and parents. Let's keep our children safe together!
      </Text>
      <Text style={styles.footer}>© 2025 Made By Team GuardianSync 🌐</Text>
    </ScrollView>
  );
};

export default ViewAssignedStudents;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    // backgroundColor: 'white', // Light blue background for a fresh look
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 37,
   
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2E8B57', // Sea green color
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4682B4', // Steel blue color
    marginTop: 34,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginVertical: 8,
    lineHeight: 24,
  },
  footer: {
    fontSize: 14,
    color: '#696969',
    marginTop: 90,
    textAlign: 'center',
  },
});
