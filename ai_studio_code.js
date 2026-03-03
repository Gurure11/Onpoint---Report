import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

export default function IncidentReportApp() {
  // 1. STATE MANAGEMENT (The Standard Data Fields)
  const [reportData, setReportData] = useState({
    dateTime: new Date().toISOString(),
    location: null,
    assetId: '',
    incidentType: '',
    description: '',
    thirdPartyDetails: '',
    photos: []
  });

  // 2. AUTO-CAPTURE GPS (Standard Requirement)
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'We need GPS to verify the accident location.');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setReportData(prev => ({ ...prev, location: location.coords }));
    })();
  }, []);

  // 3. CAMERA INTEGRATION (Evidence Collection)
  const pickImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5, // Compress for easier upload
    });

    if (!result.canceled) {
      setReportData(prev => ({ 
        ...prev, 
        photos: [...prev.photos, result.assets[0].uri] 
      }));
    }
  };

  // 4. SUBMISSION LOGIC
  const submitReport = () => {
    // Validation check
    if (!reportData.assetId || !reportData.description) {
      Alert.alert('Error', 'Please fill in Asset ID and Description.');
      return;
    }

    // HERE: Send data to your API/Database (Firebase, AWS, SQL)
    console.log("Submitting standard JSON payload:", JSON.stringify(reportData));
    
    Alert.alert('Success', 'Incident logged. Safety manager notified.');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Safety Incident Reporter</Text>
      
      {/* SECTION: ASSET INFO */}
      <Text style={styles.label}>Vehicle / Machinery ID</Text>
      <TextInput 
        style={styles.input} 
        placeholder="e.g. TRUCK-004 or FORKLIFT-B"
        onChangeText={(text) => setReportData({...reportData, assetId: text})}
      />

      {/* SECTION: INCIDENT DETAILS */}
      <Text style={styles.label}>What happened?</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Describe the incident..."
        multiline
        numberOfLines={4}
        onChangeText={(text) => setReportData({...reportData, description: text})}
      />

      {/* SECTION: EVIDENCE */}
      <Text style={styles.label}>Photos (Required)</Text>
      <Button title="Take Photo of Damage" onPress={pickImage} />
      <View style={styles.photoContainer}>
        {reportData.photos.map((uri, index) => (
          <Image key={index} source={{ uri }} style={styles.thumbnail} />
        ))}
      </View>

      {/* SECTION: GPS PROOF */}
      <Text style={styles.gpsStatus}>
        GPS Status: {reportData.location ? "✅ Locked" : "⏳ Locating..."}
      </Text>

      <Button title="SUBMIT REPORT" onPress={submitReport} color="#d9534f" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 50, backgroundColor: '#f4f4f4' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  label: { fontSize: 16, fontWeight: '600', marginTop: 15, marginBottom: 5 },
  input: { backgroundColor: 'white', padding: 10, borderRadius: 5, borderWidth: 1, borderColor: '#ddd' },
  photoContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, marginBottom: 20 },
  thumbnail: { width: 80, height: 80, marginRight: 10, borderRadius: 5 },
  gpsStatus: { marginTop: 10, marginBottom: 20, fontStyle: 'italic', color: '#666' }
});