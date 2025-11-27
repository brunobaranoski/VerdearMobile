import {
  Button,
  Container,
  Content,
  Decorations,
  FormCard,
  Input,
  Logo,
  Toast,
} from '@/components/shared/Index';
import {
  validateCPForCNPJ,
  validateEmail,
  validateFullName,
  validatePassword,
  validatePhone,
} from '@/utils/validations';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
// AQUI ESTÁ A CORREÇÃO: Mude de '../context/AuthContext' para './context/AuthContext' ou vice-versa
import { useAuth } from './context/AuthContext';

const CadastroScreen = () => {
    const [activeTab, setActiveTab] = useState('Vendedor');
    const [cpfCnpj, setCpfCnpj] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register, login, loading } = useAuth();

    // Estado do Toast
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('error');

    const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'error') => {
        setToastMessage(message);
        setToastType(type);
        setToastVisible(true);
    };

    const handleRegister = async () => {
        // Validações
        const cpfCnpjValidation = validateCPForCNPJ(cpfCnpj);
        if (!cpfCnpjValidation.valid) {
            showToast(cpfCnpjValidation.message || 'CPF/CNPJ inválido.');
            return;
        }

        const nameValidation = validateFullName(name);
        if (!nameValidation.valid) {
            showToast(nameValidation.message || 'Nome inválido.');
            return;
        }

        const phoneValidation = validatePhone(phone);
        if (!phoneValidation.valid) {
            showToast(phoneValidation.message || 'Telefone inválido.');
            return;
        }

        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
            showToast(emailValidation.message || 'E-mail inválido.');
            return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            showToast(passwordValidation.message || 'Senha inválida.');
            return;
        }

        try {
            // Registra o usuário
            await register(email.trim(), password, {
                name: name.trim(),
                cpfCnpj: cpfCnpj.replace(/\D/g, ''),
                phone: phone.replace(/\D/g, ''),
                userType: activeTab as 'Vendedor' | 'Comprador',
            });

            // Faz login automático após registro bem-sucedido
            await login(email.trim(), password);

            // Mostra mensagem de sucesso
            showToast('Conta criada com sucesso!', 'success');

            // Aguarda 1 segundo e redireciona
            setTimeout(() => {
                router.replace('/(tabs)/inicio');
            }, 1500);
        } catch (error: any) {
            showToast(error.message || 'Erro ao criar conta. Tente novamente.');
        }
    };

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
                    <Input
                        placeholder="CPF/CNPJ"
                        value={cpfCnpj}
                        onChangeText={setCpfCnpj}
                        keyboardType="numeric"
                    />
                    <Input
                        placeholder="Nome completo"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />
                    <Input
                        placeholder="Número de telefone"
                        type="tel"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />
                    <Input
                        placeholder="E-mail"
                        type="email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <Input
                        placeholder="Senha"
                        type="password"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                    <Button onPress={handleRegister} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : 'CRIAR CONTA'}
                    </Button>
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
    spacer: {
        marginTop: -30,
    },
});

export default CadastroScreen;