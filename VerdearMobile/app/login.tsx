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

const LoginScreen = ({ onNavigateToCadastro }) => {
  return (
    <Container>
      <Decorations theme="login" />
      <Content>
        <Logo />
        <FormCard title="Login">
          <Input placeholder="E-mail" type="email" />
          <Input placeholder="Senha" type="password" secureTextEntry />
          <Button onPress={onNavigateToCadastro}>ENTRAR</Button>
          <View style={styles.registerLink}>
            <TouchableOpacity onPress={onNavigateToCadastro}>
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
