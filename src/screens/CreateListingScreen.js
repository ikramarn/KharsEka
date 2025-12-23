import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import CategoryPicker from '../components/CategoryPicker';
import * as ImagePicker from 'expo-image-picker';

export default function CreateListingScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Vehicle');
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const pickImages = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      selectionLimit: 8 - images.length,
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!res.canceled) {
      const uris = res.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...uris].slice(0, 8));
    }
  };

  const removeImage = (uri) => {
    setImages((prev) => prev.filter((u) => u !== uri));
  };

  const validate = () => {
    if (!title.trim() || !description.trim()) return 'Title and description are required';
    if (!price || isNaN(Number(price))) return 'Enter a valid price';
    if (images.length < 2) return 'Please add at least 2 pictures';
    return '';
  };

  const save = async () => {
    const err = validate();
    if (err) return Alert.alert('Validation', err);
    setSaving(true);
    try {
      // TODO: Upload images to Firebase Storage and save listing in Firestore
      Alert.alert('Saved', 'Listing created');
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('Vehicle');
      setImages([]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Create Listing</Text>
      <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={[styles.input, { height: 100 }]} multiline />
      <TextInput placeholder="Price" keyboardType="numeric" value={price} onChangeText={setPrice} style={styles.input} />
      <CategoryPicker value={category} onChange={setCategory} />
      <Button title={`Add pictures (${images.length}/8)`} onPress={pickImages} />
      <View style={styles.imagesRow}>
        {images.map((uri) => (
          <View key={uri} style={{ marginRight: 8 }}>
            <Image source={{ uri }} style={styles.img} />
            <Button title="Remove" onPress={() => removeImage(uri)} />
          </View>
        ))}
      </View>
      <View style={{ height: 12 }} />
      <Button title={saving ? 'Saving...' : 'Save Listing'} onPress={save} disabled={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  imagesRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  img: { width: 96, height: 96, borderRadius: 8, backgroundColor: '#eee' },
});
