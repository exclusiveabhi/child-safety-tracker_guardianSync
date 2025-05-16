// src/screen/CustomDrawerContent.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CustomDrawerContent: React.FC<any> = (props) => {
  const { navigation, state } = props;
  const activeRoute = state.routeNames[state.index];

  const menuItems = [
    { label: "Home", route: "Home" },
    { label: "View Assigned Students", route: "ViewAssignedStudents" },
    
    // { label: "Emergency SOS", route: "EmergencyWards" },
    { label: "App Info", route: "AppInfo" },
  ];

  return (
    <DrawerContentScrollView {...props}>
      {/* Close button */}
      <View style={styles.closeContainer}>
        <TouchableOpacity onPress={() => navigation.closeDrawer()}>
          <Ionicons name="close" size={30} color="#000" />
        </TouchableOpacity>
      </View>
      {/* Render menu items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => {
          const isActive = activeRoute === item.route;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate(item.route)}
              style={[
                styles.menuItem,
                isActive && styles.activeMenuItem,
              ]}
            >
              <Text style={[styles.menuLabel, isActive && styles.activeMenuLabel]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  closeContainer: {
    alignItems: 'flex-end',
    padding: 30,
    // backgroundColor: '#ecf0f2',
  },
  menuContainer: {
    paddingHorizontal: 10,
   
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: 'transparent',
    
  },
  activeMenuItem: {
    backgroundColor: '#0096FF',
  },
  menuLabel: {
    fontSize: 16,
    color: '#000',
    
  },
  activeMenuLabel: {
    color: '#fff',
  },
});

export default CustomDrawerContent;
