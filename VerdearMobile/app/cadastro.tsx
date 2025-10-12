import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
    Button,
    Container,
    Content,
    Decorations,
    FormCard,
    Input,
    Logo,
} from '@/components/shared/Index';
import { router } from 'expo-router';

const CadastroScreen = () => {
  const [activeTab, setActiveTab] = useState('Vendedor');

  return (
    <Container>
      <Decorations theme="cadastro" />
      <Content>
        <Logo />
        <View style={styles.spacer} />
        <FormCard
          title="Cadastro"
          showTabs={true}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        >
          <Input placeholder="CPF/CNPJ" />
          <Input placeholder="Nome completo" />
          <Input placeholder="Número de telefone" type="tel" />
          <Input placeholder="E-mail" type="email" />
          <Input placeholder="Senha" type="password" />
          <Button onPress={() => router.replace('/(tabs)')}>CRIAR CONTA</Button>
        </FormCard>
      </Content>
    </Container>
  );
};

const styles = StyleSheet.create({
  spacer: {
    marginTop: -30,
  },
});

export default CadastroScreen;