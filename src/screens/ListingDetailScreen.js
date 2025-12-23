import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Button, Alert } from 'react-native';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ListingDetailScreen({ route, navigation }) {
  const { id } = route.params || {};
  const { user, token } = useAuth();
  const [item, setItem] = useState(null);
  const isOwner = item && user && item.user_id === (user.id || user.uid);

  useEffect(() => {
    (async () => {
      const data = await api.getListing(id);
      setItem(data);
    })();
  }, [id]);

  const markSold = async () => {
    await api.patchListing(token, id, { sold: true });
    Alert.alert('Updated', 'Marked as sold');
    const data = await api.getListing(id);
    setItem(data);
  };
  const deleteListing = async () => {
    await api.deleteListing(token, id);
    Alert.alert('Deleted', 'Listing removed');
    navigation.goBack();
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
