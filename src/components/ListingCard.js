import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function ListingCard({ item, onPress, onFavorite }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      {item.images?.[0] && (
        <Image source={{ uri: absolutize(item.images[0]) }} style={styles.thumb} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>${Number(item.price).toFixed(2)}</Text>
        <Text style={styles.meta}>{item.category} • {item.sold ? 'Sold' : 'Available'}</Text>
      </View>
      {onFavorite && (
        <TouchableOpacity onPress={onFavorite} style={styles.favBtn}>
          <Text style={{ color: '#fff' }}>★</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

function absolutize(url) {
  if (!url) return url;
  if (url.startsWith('http')) return url;
  const base = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  return `${base}${url}`;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    gap: 12,
  },
  thumb: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#eee' },
  title: { fontWeight: '600', fontSize: 16 },
  price: { marginTop: 4, color: '#0b7', fontWeight: '700' },
  meta: { marginTop: 2, color: '#666', fontSize: 12 },
  favBtn: {
    marginLeft: 8,
    backgroundColor: '#f5a623',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
});
