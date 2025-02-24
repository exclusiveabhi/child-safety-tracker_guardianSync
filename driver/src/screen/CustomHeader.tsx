// src/screen/CustomHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

interface CustomHeaderProps {
  title: string;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ title }) => {
  const navigation = useNavigation();

  const handleLogout = () => {
    // Navigate back to your login screen on logout.
    navigation.replace("LOGIN");
  };

  return (
    <View style={styles.header}>
      {/* Hamburger icon to open the drawer */}
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <Ionicons name="menu" size={30} color="#FFFFFF" />
      </TouchableOpacity>
      
      {/* Screen Title */}
      <Text style={styles.title}>{title}</Text>
      
      {/* Logout button */}
      <TouchableOpacity onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 68,
    backgroundColor: '#0096FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF' // Customize title color here
  },
});

export default CustomHeader;
