import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Button, Alert } from 'react-native';

export default function ListingDetailScreen({ route }) {
  const { id } = route.params || {};
  const item = null; // TODO: fetch by id
  const isOwner = false; // TODO: compare with auth user

  const markSold = async () => {
    // TODO: update Firestore
    Alert.alert('Updated', 'Marked as sold');
  };
  const deleteListing = async () => {
    // TODO: delete in Firestore and storage
    Alert.alert('Deleted', 'Listing removed');
  };

  if (!item) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>Loading...</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.price}>${Number(item.price).toFixed(2)}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
        {item.images?.map((uri) => (
          <Image key={uri} source={{ uri }} style={styles.img} />
        ))}
      </ScrollView>
      <Text style={styles.desc}>{item.description}</Text>
      {isOwner && (
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          <Button title="Mark Sold" onPress={markSold} />
          <Button title="Delete" color="#c00" onPress={deleteListing} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  price: { marginTop: 4, color: '#0b7', fontWeight: '700' },
  img: { width: 240, height: 240, borderRadius: 8, marginRight: 8, backgroundColor: '#eee' },
  desc: { marginTop: 8, lineHeight: 20 },
});
