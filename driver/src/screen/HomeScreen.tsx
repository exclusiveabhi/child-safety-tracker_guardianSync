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
import changeNavigationBarColor from 'react-native-navigation-bar-color';

interface RouteParams {
  busNumber?: string;
  routeDetails?: string;
  token?: string;
}

const DEVICE_IP = "http://192.168.141.51:3000";

const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location for tracking bus position.',
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
    //@ts-ignore
    return auth === 'granted' || auth === 'always';
  }
  return false;
};

const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera for face scanning.',
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
  return true;
};

const HomeScreen: React.FC = () => {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { busNumber = 'N/A', routeDetails = 'N/A', token = '' } = route.params || {};

  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [scanType, setScanType] = useState<string>('pickup_home');
  const [autoScanActive, setAutoScanActive] = useState<boolean>(false);
  const [flashColor, setFlashColor] = useState<string>('');
  const [showFlash, setShowFlash] = useState<boolean>(false);
  const [cameraIsReady, setCameraIsReady] = useState<boolean>(false);

  // Ref to prevent overlapping captures
  const capturingRef = useRef<boolean>(false);
  const cameraRef = useRef<RNCamera>(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      changeNavigationBarColor('#FFFFFF', false);
    }
  }, []);

  useEffect(() => {
    if (!autoScanActive) {
      setCameraIsReady(false);
    }
  }, [autoScanActive]);

  // Helper to update the online status in the backend
  const updateOnlineStatus = (online: boolean) => {
    fetch(`${DEVICE_IP}/update-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ online }),
    })
      .then(response => response.json())
      .then(data => console.log(`Status updated to ${online}:`, data))
      .catch(error => console.error('Error updating status:', error));
  };

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
          .catch((error) => console.error('Error updating location:', error));
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
                startTracking();
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
    // Set driver status to online
    updateOnlineStatus(true);
    beginTracking();
  };

  const stopTracking = () => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    // Set driver status to offline
    updateOnlineStatus(false);
    setIsTracking(false);
  };

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
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError, rawText);
        return { type: 'error', message: 'Invalid response' };
      }
      if (response.ok) {
        console.log('Scan Success:', data.message);
        return { type: 'success', message: data.message };
      } else {
        console.log('Scan Failed:', data.message);
        if (data.message && data.message.toLowerCase().includes('not found')) {
          return { type: 'notFound', message: data.message };
        }
        return { type: 'error', message: data.message || 'Error processing scan' };
      }
    } catch (error) {
      console.error('Error scanning face:', error);
      return { type: 'error', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  // Updated performScan using recursion instead of setInterval
  const performScan = async () => {
    if (!autoScanActive) return;
    if (!cameraRef.current) return;
    if (!cameraIsReady) return;
    if (capturingRef.current) return;

    capturingRef.current = true;
    try {
      // Lower quality to 0.1 for faster capture and transfer
      const options = { quality: 0.1, base64: true };
      const data = await cameraRef.current.takePictureAsync(options);
      if (data?.base64) {
        console.log("Captured image length:", data.base64.length);
        //@ts-ignore
        const capturedImage = `data:${data.type};base64,${data.base64}`;
        const result = await scanFaceAPI(capturedImage);
        // Set the flash color based on result
        if (result.type === 'success') {
          setFlashColor('rgba(0,128,0,0.9)');
        } else if (result.type === 'notFound') {
          setFlashColor('rgba(0,0,255,0.9)');
        } else {
          setFlashColor('rgba(255,0,0,0.9)');
        }
        // Show the flash overlay for 3 seconds (adjust delay as needed)
        setShowFlash(true);
        setTimeout(() => {
          setShowFlash(false);
        }, 3000);
        console.log(result.message);
      }
    } catch (error) {
      console.error('Error during scanning:', error);
    } finally {
      capturingRef.current = false;
    }
    // Recursively trigger the next scan immediately
    if (autoScanActive) {
      performScan();
    }
  };

  // Start recursive scanning when autoScanActive and cameraIsReady are true
  useEffect(() => {
    if (autoScanActive && cameraIsReady) {
      performScan();
    }
  }, [autoScanActive, cameraIsReady]);

  const handleAutoScanPress = async (type: string) => {
    setScanType(type);
    const hasCameraPermission = await requestCameraPermission();
    if (!hasCameraPermission) {
      Alert.alert('Camera permission is required to scan face');
      return;
    }
    // Reset camera readiness and start scanning.
    setCameraIsReady(false);
    setAutoScanActive(true);
  };

  const stopScanning = () => {
    setAutoScanActive(false);
    setCameraIsReady(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0096FF" barStyle="light-content" />
      <View style={styles.card}>
        <Text style={styles.welcome}>Welcome Bus Driver</Text>
        <Text style={styles.busNumber}>Bus Number: {busNumber}</Text>
        <Text style={styles.route}>Route: {routeDetails}</Text>
        <TouchableOpacity
          style={[styles.trackButton, isTracking && styles.stopButton]}
          onPress={isTracking ? stopTracking : startTracking}
        >
          <Text style={styles.trackButtonText}>
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </Text>
        </TouchableOpacity>
        <View style={styles.scanSection}>
          <Text style={styles.scanTitle}>Automatic Face Scan</Text>
          <Text style={styles.infoText}>Home to School scan:</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.scanOptionButton}
              onPress={() => handleAutoScanPress('pickup_home')}
            >
              <Text style={styles.optionText}>Morning Pickup</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.scanOptionButton}
              onPress={() => handleAutoScanPress('dropoff_school')}
            >
              <Text style={styles.optionText}>Morning Drop-off</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.infoText}>School to Home scan:</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.scanOptionButton}
              onPress={() => handleAutoScanPress('pickup_school')}
            >
              <Text style={styles.optionText}>Evening Pickup</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.scanOptionButton}
              onPress={() => handleAutoScanPress('dropoff_home')}
            >
              <Text style={styles.optionText}>Evening Drop-off</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Modal
        visible={autoScanActive}
        transparent={false}
        animationType="slide"
        onRequestClose={stopScanning}
      >
        <View style={{ flex: 1 }}>
          <RNCamera
            ref={cameraRef}
            style={styles.camera}
            type={RNCamera.Constants.Type.front}
            captureAudio={false}
            onCameraReady={() => {
              console.log('Camera is ready');
              setCameraIsReady(true);
            }}
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
          />
          {showFlash && (
            <View style={[styles.flashOverlay, { backgroundColor: flashColor }]} />
          )}
          <TouchableOpacity
            style={styles.stopScanButton}
            onPress={stopScanning}
          >
            <Text style={styles.stopScanButtonText}>Stop Scanning</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  stopScanButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#0096FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  stopScanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
