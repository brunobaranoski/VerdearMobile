import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Verdear</Text>
        <Text style={styles.subtitle}>Bem-vindo ao seu app sustentável</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Início</Text>
        <Text style={styles.text}>
          Explore produtos sustentáveis e conecte-se com outros usuários.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.buttonText}>Fazer Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => router.push('/cadastro')}
          >
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Cadastrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F2',
  },
  header: {
    backgroundColor: '#2C5F2D',
    padding: 40,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Montserrat',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
    fontFamily: 'Montserrat',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C5F2D',
    marginBottom: 16,
    fontFamily: 'Montserrat',
  },
  text: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    fontFamily: 'Montserrat',
  },
  buttonContainer: {
    marginTop: 30,
    gap: 12,
  },
  button: {
    backgroundColor: '#FF7B00',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2C5F2D',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
  },
  buttonTextSecondary: {
    color: '#2C5F2D',
  },
});
