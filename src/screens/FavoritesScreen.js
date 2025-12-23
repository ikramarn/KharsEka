import React from 'react';
import { View, FlatList, Text } from 'react-native';
import ListingCard from '../components/ListingCard';

export default function FavoritesScreen({ navigation }) {
  const favorites = []; // TODO: fetch favorites for user
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListingCard item={item} onPress={() => navigation.navigate('ListingDetail', { id: item.id })} />
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 24 }}>No favorites yet.</Text>}
      />
    </View>
  );
}
