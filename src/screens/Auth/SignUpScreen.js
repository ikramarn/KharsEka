import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function SignUpScreen({ navigation }) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim());
    } catch (e) {
      setError(e.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your account</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <TextInput value={name} onChangeText={setName} placeholder="Name" style={styles.input} />
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" placeholder="Email" style={styles.input} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" style={styles.input} />
      <Button title={loading ? 'Creating...' : 'Sign Up'} onPress={onSubmit} disabled={loading} />
      <View style={{ height: 12 }} />
      <Button title="Already have an account? Sign In" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  error: { color: '#c00', marginBottom: 8 },
});
