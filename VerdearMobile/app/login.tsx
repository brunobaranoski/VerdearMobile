import {
  Button,
  Container,
  Content,
  Decorations,
  FormCard,
  Input,
  Logo,
  Toast
} from '@/components/shared/Index';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from './context/AuthContext';

const LoginScreen = () => {
  // Estado do Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('error');

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };


  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {

    try {
      await login(email, password);

      setTimeout(() => {
              router.replace('/(tabs)/inicio');
            }, 1500);
    } catch (error) {
      console.log(email);
      showToast('Erro ao fazer login. Verifique suas credenciais e tente novamente.', 'error');
    }
  }

  return (
    <Container>
      <Decorations theme="login" />
      <Content>
        <Logo />
        <FormCard title="Login">
          <Input placeholder="E-mail" type="email" onChangeText={setEmail} />
          <Input placeholder="Senha" type="password" secureTextEntry onChangeText={setPassword} />
          <Button onPress={handleLogin}>ENTRAR</Button>
          <View style={styles.registerLink}>
            <TouchableOpacity onPress={() => router.push('/cadastro')}>
              <Text style={styles.linkText}>Cadastrar</Text>
            </TouchableOpacity>
          </View>
        </FormCard>
      </Content>
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />

    </Container>
  );
};

const styles = StyleSheet.create({
  registerLink: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  linkText: {
    color: '#333333',
    fontSize: 18,
    textDecorationLine: 'none',
    fontFamily: 'Montserrat Bold',
    fontStyle: 'italic',
  },
});

export default LoginScreen;
