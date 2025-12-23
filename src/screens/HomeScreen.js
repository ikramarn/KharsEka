import React, { useEffect, useState } from 'react';
import { View, TextInput, FlatList, StyleSheet, Text } from 'react-native';
import ListingCard from '../components/ListingCard';
import CategoryPicker, { CATEGORIES } from '../components/CategoryPicker';

// Placeholder local state; swap for Firestore queries
export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    // TODO: Fetch from Firestore
    setItems([]);
  }, []);

  const filtered = items.filter((i) =>
    i.category === category &&
    (i.title?.toLowerCase().includes(query.toLowerCase()) || i.description?.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Browse Listings</Text>
      <CategoryPicker value={category} onChange={setCategory} />
      <TextInput placeholder="Search..." value={query} onChangeText={setQuery} style={styles.search} />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListingCard
            item={item}
            onPress={() => navigation.navigate('ListingDetail', { id: item.id })}
            onFavorite={() => {}}
          />
        )}
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
