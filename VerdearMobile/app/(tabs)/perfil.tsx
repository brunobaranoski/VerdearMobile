import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function PerfilScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.text}>
          Gerencie suas informações pessoais e configurações.
        </Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Montserrat',
  },
  content: {
    padding: 20,
  },
  text: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    fontFamily: 'Montserrat',
  },
});
