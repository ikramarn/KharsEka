import React, { useEffect, useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import ListingCard from '../components/ListingCard';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function FavoritesScreen({ navigation }) {
  const { token } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const ids = await api.getFavorites(token);
      const fetched = await Promise.all(ids.map((id) => api.getListing(id)));
      setItems(fetched);
    })();
  }, [token]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListingCard item={item} onPress={() => navigation.navigate('ListingDetail', { id: item.id })} />
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 24 }}>No favorites yet.</Text>}
      />
    </View>
  );
}
