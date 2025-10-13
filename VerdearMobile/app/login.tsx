import {
  Button,
  Container,
  Content,
  Decorations,
  FormCard,
  Input,
  Logo,
} from '@/components/shared/Index';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

const LoginScreen = () => {
  return (
    <Container>
      <Decorations theme="login" />
      <Content>
        <Logo />
        <FormCard title="Login">
          <Input placeholder="E-mail" type="email" />
          <Input placeholder="Senha" type="password" secureTextEntry />
          <Button onPress={() => router.replace('/(tabs)/inicio')}>ENTRAR</Button>
          <View style={styles.registerLink}>
            <TouchableOpacity onPress={() => router.push('/cadastro')}>
              <Text style={styles.linkText}>Cadastrar</Text>
            </TouchableOpacity>
          </View>
        </FormCard>
      </Content>
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
