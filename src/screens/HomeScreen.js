import React, { useEffect, useState } from 'react';
import { View, TextInput, FlatList, StyleSheet, Text, RefreshControl, Button } from 'react-native';
import ListingCard from '../components/ListingCard';
import CategoryPicker, { CATEGORIES } from '../components/CategoryPicker';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

// Placeholder local state; swap for Firestore queries
export default function HomeScreen({ navigation }) {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [items, setItems] = useState([]);

  async function load() {
    const data = await api.listListings({ category, q: query });
    setItems(data);
  }

  useEffect(() => {
    load();
  }, [category, query]);

  const filtered = items; // server already applies filters

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Browse Listings</Text>
      <View style={{ marginBottom: 12 }}>
        <Button title="Create Listing" onPress={() => navigation.navigate('Create')} />
      </View>
      <CategoryPicker value={category} onChange={setCategory} />
      <TextInput placeholder="Search..." value={query} onChangeText={setQuery} style={styles.search} />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListingCard
            item={item}
            onPress={() => navigation.navigate('ListingDetail', { id: item.id })}
            onFavorite={() => token && api.addFavorite(token, item.id)}
          />
        )}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 24 }}>No listings yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  search: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
});
