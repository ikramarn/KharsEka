import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { uploadImages } from '../api/client';

export default function ProfileScreen() {
  const { user, token, signOut, updateUserProfile } = useAuth();
  const [uploading, setUploading] = useState(false);

  const uploadPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!res.canceled) {
      const uri = res.assets[0].uri;
      try {
        setUploading(true);
        // Upload to media service then set profile photo URL
        const out = await uploadImages(token, [uri]);
        const photoURL = out.urls?.[0];
        await updateUserProfile({ photoURL });
        Alert.alert('Updated', 'Profile photo updated');
      } catch (e) {
        Alert.alert('Error', e.message || 'Failed to upload');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: user?.photoURL }} style={styles.avatar} />
      <Text style={styles.name}>{user?.displayName || user?.email}</Text>
      <Button title={uploading ? 'Uploading...' : 'Upload Profile Photo'} onPress={uploadPhoto} disabled={uploading} />
      <View style={{ height: 12 }} />
      <Button title="Sign Out" color="#c00" onPress={signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 16 },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#eee', marginBottom: 12 },
  name: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
});
