// src/navigation/AppNavigator.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawerContent from '../screen/CustomDrawerContent';
import HomeScreen from '../screen/HomeScreen';
import ViewAssignedStudents from '../screen/ViewAssignedStudents';
import EmergencyWardsScreen from '../screen/EmergencyWardsScreen';
import AppInfoScreen from '../screen/AppInfoScreen';
import CustomHeader from '../screen/CustomHeader';
import FeedbackScreen from '../screen/FeedbackScreen';  

const Drawer = createDrawerNavigator();

const AppNavigator: React.FC<any> = ({ route }) => {
  // Retrieve parameters passed from the login screen (e.g. busNumber, token, etc.)
  const initialParams = route?.params || {};

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        // Use the custom header for every drawer screen
        header: ({ route, navigation, options }) => {
          const title = options.title || route.name;
          return <CustomHeader title={title} />;
        },
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Home' }}
        initialParams={initialParams}
      />
      <Drawer.Screen 
        name="ViewAssignedStudents" 
        component={ViewAssignedStudents} 
        options={{ title: 'Assigned Students' }}
        initialParams={initialParams}
      />
      <Drawer.Screen 
        name="Feedback" 
        component={FeedbackScreen} 
        options={{ title: 'Feedback' }}
        initialParams={initialParams}
      />
      <Drawer.Screen 
        name="EmergencyWards" 
        component={EmergencyWardsScreen} 
        options={{ title: 'Emergency Wards' }}
        initialParams={initialParams}
      />
      <Drawer.Screen 
        name="AppInfo" 
        component={AppInfoScreen} 
        options={{ title: 'App Info' }}
        initialParams={initialParams}
      />
    </Drawer.Navigator>
  );
};

export default AppNavigator;
