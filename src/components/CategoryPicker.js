import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';


export const CATEGORIES = [
  'Vehicle',
  'Electronics',
  'Wearings',
  'Furniture',
  'Bikes',
  'Carparts',
];

export const SUBCATEGORIES = {
  Vehicle: ['Car', 'Truck'],
};

export default function CategoryPicker({ value, onChange }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Category</Text>
      <Picker selectedValue={value} onValueChange={onChange}>
        {CATEGORIES.map((c) => (
          <Picker.Item key={c} label={c} value={c} />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: { fontWeight: '600', marginBottom: 4 },
});
