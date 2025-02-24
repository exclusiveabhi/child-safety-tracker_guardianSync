// src/screen/HomeScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  PermissionsAndroid,
  Modal,
  StatusBar,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import { RNCamera } from 'react-native-camera';
import { DEVICE_IP } from '@env';
import changeNavigationBarColor from 'react-native-navigation-bar-color';

interface RouteParams {
  busNumber?: string;
  routeDetails?: string;
  token?: string;
}

console.log("Backend URL:", DEVICE_IP);

// Request location permission
const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message:
            'This app needs access to your location for tracking bus position.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else if (Platform.OS === 'ios') {
    const auth = await Geolocation.requestAuthorization('whenInUse');
    return auth === 'granted' || auth === 'always';
  }
  return false;
};

// Request camera permission (Android)
const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message:
            'This app needs access to your camera for face scanning.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  // On iOS, assume permission is handled via Info.plist.
  return true;
};

const HomeScreen: React.FC = () => {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { busNumber = 'N/A', routeDetails = 'N/A', token = '' } = route.params || {};

  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  // Driver selects the scan event type—no manual studentId entry.
  const [scanType, setScanType] = useState<string>('pickup_home');
  const [scannedFace, setScannedFace] = useState<string>('');
  const [autoScanActive, setAutoScanActive] = useState<boolean>(false);
  const cameraRef = useRef<RNCamera>(null);

  // Change Android navigation bar color to white on mount
  useEffect(() => {
    if (Platform.OS === 'android') {
      changeNavigationBarColor('#FFFFFF', false); // false for dark icons
    }
  }, []);

  // Location tracking function
  const beginTracking = () => {
    const id = Geolocation.watchPosition(
      (position) => {
        console.log('New position:', position);
        fetch(`${DEVICE_IP}/update-location`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({
            busNumber,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        })
          .then((response) => response.json())
          .then((data) => console.log('Location updated:', data))
          .catch((error) =>
            console.error('Error updating location:', error)
          );
      },
      (error) => {
        console.error('Location error:', error);
        Alert.alert('Location Error', error.message);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 1,
        interval: 5000,
        fastestInterval: 2000,
      }
    );
    setWatchId(id);
    setIsTracking(true);
  };

  const startTracking = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert(
        'Location Permission Required',
        'The app requires location permission to track your bus location.',
        [
          {
            text: 'Grant Permission',
            onPress: async () => {
              const permissionGranted = await requestLocationPermission();
              if (permissionGranted) {
                beginTracking();
              } else {
                Alert.alert('Permission not granted');
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }
    beginTracking();
  };

  const stopTracking = () => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  };

  // onCameraReady triggers auto capture after a delay.
  const onCameraReady = () => {
    setTimeout(async () => {
      if (cameraRef.current) {
        try {
          await cameraRef.current.resumePreview?.();
          const options = { quality: 0.5, base64: true };
          const data = await cameraRef.current.takePictureAsync(options);
          if (data.base64) {
            const capturedImage = `data:${data.type};base64,${data.base64}`;
            setScannedFace(capturedImage);
            setAutoScanActive(false);
            await scanFaceAPI(capturedImage);
          } else {
            Alert.alert('Image capture failed: no image data');
            setAutoScanActive(false);
          }
        } catch (error) {
          console.error('Error capturing image:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          Alert.alert('Error capturing image', errorMessage);
          setAutoScanActive(false);
        }
      }
    }, 1500);
  };

  // Call /scan-face endpoint with captured image data.
  const scanFaceAPI = async (imageData: string) => {
    try {
      const response = await fetch(`${DEVICE_IP}/scan-face`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          busNumber,
          scanType,
          scannedFace: imageData,
        }),
      });
      const rawText = await response.text();
      console.log('Raw response text:', rawText);
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError, rawText);
        throw parseError;
      }
      if (response.ok) {
        console.log('Scan Success:', data.message);
        Alert.alert('Scan Success', data.message);
      } else {
        console.log('Scan Failed:', data.message);
        Alert.alert('Scan Failed', data.message || 'Error processing scan');
      }
    } catch (error) {
      console.error('Error scanning face:', error);
      Alert.alert('Error scanning face', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // Handler for auto scan: request camera permission then launch camera modal.
  const handleAutoScanPress = async (type: string) => {
    setScanType(type);
    const hasCameraPermission = await requestCameraPermission();
    if (!hasCameraPermission) {
      Alert.alert('Camera permission is required to scan face');
      return;
    }
    setAutoScanActive(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0096FF" barStyle="light-content" />
      <View style={styles.card}>
        <Text style={styles.welcome}>Welcome Bus Driver</Text>
        <Text style={styles.busNumber}>Bus Number: {busNumber}</Text>
        <Text style={styles.route}>Route: {routeDetails}</Text>
        <TouchableOpacity style={[styles.trackButton, isTracking && styles.stopButton]} onPress={isTracking ? stopTracking : startTracking}>
          <Text style={styles.trackButtonText}>{isTracking ? 'Stop Tracking' : 'Start Tracking'}</Text>
        </TouchableOpacity>
        {/* Section for face scan */}
        <View style={styles.scanSection}>
          <Text style={styles.scanTitle}>Automatic Face Scan</Text>
          <Text style={styles.infoText}>Home to School scan:</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.scanOptionButton} onPress={() => handleAutoScanPress('pickup_home')}>
              <Text style={styles.optionText}>Morning Pickup</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.scanOptionButton} onPress={() => handleAutoScanPress('dropoff_school')}>
              <Text style={styles.optionText}>Morning Drop-off</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.infoText}>School to Home scan:</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.scanOptionButton} onPress={() => handleAutoScanPress('pickup_school')}>
              <Text style={styles.optionText}>Evening Pickup</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.scanOptionButton} onPress={() => handleAutoScanPress('dropoff_home')}>
              <Text style={styles.optionText}>Evening Drop-off</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Modal for auto face capture */}
      <Modal visible={autoScanActive} transparent={false} animationType="slide" onRequestClose={() => setAutoScanActive(false)}>
        <RNCamera
          ref={cameraRef}
          style={styles.camera}
          type={RNCamera.Constants.Type.front}
          captureAudio={false}
          onCameraReady={onCameraReady}
          notAuthorizedView={
            <View style={styles.cameraOverlay}>
              <Text style={styles.cameraText}>Camera not authorized</Text>
            </View>
          }
          pendingAuthorizationView={
            <View style={styles.cameraOverlay}>
              <Text style={styles.cameraText}>Waiting for camera permission</Text>
            </View>
          }
        >
          {({ status }) => {
            if (status !== 'READY') {
              return (
                <View style={styles.cameraOverlay}>
                  <Text style={styles.cameraText}>Camera Loading...</Text>
                </View>
              );
            }
            return <View style={{ flex: 1 }} />;
          }}
        </RNCamera>
      </Modal>
      {/* Footer Text */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Made by Team GuardianSync</Text>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  card: {
    marginTop: 100,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  busNumber: {
    fontSize: 18,
    marginBottom: 5,
    color: '#333',
  },
  route: {
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  trackButton: {
    backgroundColor: '#0096FF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 20,
  },
  stopButton: {
    backgroundColor: 'red',
  },
  trackButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  scanSection: {
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  scanTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
  },
  scanOptionButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  optionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 10,
  },
  cameraText: {
    color: '#fff',
    fontSize: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    marginLeft: 32,
  },
});
