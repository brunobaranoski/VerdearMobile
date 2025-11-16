import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../../app/context/AuthContext";
import { Toast } from "../shared/Index";

interface EditarCadastroProps {
    onClose?: () => void;
}

export default function EditarCadastro({ onClose }: EditarCadastroProps) {
    const { userData, updateUserProfile, uploadAvatar, sendPasswordResetEmail, user } = useAuth();

    // Estados do formulário
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [addressNumber, setAddressNumber] = useState('');
    const [complement, setComplement] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [cep, setCep] = useState('');
    const [bio, setBio] = useState('');

    // Dados bancários (apenas para vendedores)
    const [bank, setBank] = useState('');
    const [agency, setAgency] = useState('');
    const [account, setAccount] = useState('');
    const [accountType, setAccountType] = useState<'Corrente' | 'Poupança'>('Corrente');

    // Avatar
    const [avatarUri, setAvatarUri] = useState('');
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Estados de UI
    const [saving, setSaving] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('info');

    // Carrega dados do usuário
    useEffect(() => {
        if (userData) {
            setName(userData.name || '');
            setPhone(userData.phone || '');
            setAddress(userData.address || '');
            setAddressNumber(userData.addressNumber || '');
            setComplement(userData.complement || '');
            setCity(userData.city || '');
            setState(userData.state || '');
            setCep(userData.cep || '');
            setBio(userData.bio || '');
            setAvatarUri(userData.avatar || '');

            // Dados bancários
            if (userData.bankAccount) {
                setBank(userData.bankAccount.bank || '');
                setAgency(userData.bankAccount.agency || '');
                setAccount(userData.bankAccount.account || '');
                setAccountType(userData.bankAccount.accountType || 'Corrente');
            }
        }
    }, [userData]);

    const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
        setToastMessage(message);
        setToastType(type);
        setToastVisible(true);
    };

    // Seleção de imagem - abre galeria diretamente
    const handleSelectImage = async () => {
        // Tenta galeria primeiro, se falhar tenta câmera
        return;
    };

    const pickImage = async (source: 'camera' | 'gallery') => {
        try {
            let result;

            if (source === 'camera') {
                // Pede permissão para câmera
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    showToast('Permissão de câmera é necessária!', 'error');
                    return;
                }

                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                });
            } else {
                // Pede permissão para galeria
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    showToast('Permissão de galeria é necessária!', 'error');
                    return;
                }

                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                });
            }

            if (!result.canceled && result.assets[0]) {
                const selectedImage = result.assets[0];

                // Valida tamanho (2MB)
                if (selectedImage.fileSize && selectedImage.fileSize > 2 * 1024 * 1024) {
                    showToast('A imagem deve ter no máximo 2MB', 'warning');
                    return;
                }

                setAvatarUri(selectedImage.uri);
                await handleUploadAvatar(selectedImage.uri);
            }
        } catch (error) {
            console.error('Erro ao selecionar imagem:', error);
            showToast('Erro ao selecionar imagem', 'error');
        }
    };

    const handleUploadAvatar = async (uri: string) => {
        try {
            setUploadingAvatar(true);
            await uploadAvatar(uri);
            showToast('Foto de perfil atualizada com sucesso!', 'success');
        } catch (error: any) {
            showToast(error.message || 'Erro ao fazer upload da foto', 'error');
        } finally {
            setUploadingAvatar(false);
        }
    };

    // Enviar email de redefinição de senha
    const handlePasswordReset = async () => {
        if (!user?.email) {
            showToast('Email não disponível', 'error');
            return;
        }

        try {
            showToast(`Enviando email para ${user.email}...`, 'info');
            await sendPasswordResetEmail(user.email);
            showToast('Email de redefinição enviado! Verifique sua caixa de entrada (e spam).', 'success');
        } catch (error: any) {
            showToast(error.message || 'Erro ao enviar email', 'error');
        }
    };

    // Validação de campos
    const validateForm = (): boolean => {
        if (!name.trim()) {
            showToast('Nome é obrigatório', 'warning');
            return false;
        }

        if (phone && phone.replace(/\D/g, '').length < 10) {
            showToast('Telefone inválido', 'warning');
            return false;
        }

        if (cep && cep.replace(/\D/g, '').length !== 8) {
            showToast('CEP deve ter 8 dígitos', 'warning');
            return false;
        }

        return true;
    };

    // Salvar alterações
    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setSaving(true);

            const updates: any = {
                name,
                phone,
                address,
                addressNumber,
                complement,
                city,
                state,
                cep,
                bio,
            };

            // Adiciona dados bancários apenas para vendedores
            if (userData?.userType === 'Vendedor' && (bank || agency || account)) {
                updates.bankAccount = {
                    bank,
                    agency,
                    account,
                    accountType,
                };
            }

            await updateUserProfile(updates);
            showToast('Cadastro atualizado com sucesso!', 'success');

            // Fecha após 1 segundo
            if (onClose) {
                setTimeout(onClose, 1000);
            }
        } catch (error: any) {
            showToast(error.message || 'Erro ao salvar alterações', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Foto de Perfil */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Foto de Perfil</Text>
                    <View style={styles.avatarSection}>
                        <TouchableOpacity onPress={handleSelectImage} disabled={uploadingAvatar}>
                            <View style={styles.avatarContainer}>
                                {avatarUri ? (
                                    <Image source={{ uri: avatarUri }} style={styles.avatar} />
                                ) : (
                                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                        <Ionicons name="person-outline" size={50} color="#999" />
                                    </View>
                                )}
                                {uploadingAvatar && (
                                    <View style={styles.uploadingOverlay}>
                                        <ActivityIndicator size="small" color="#fff" />
                                    </View>
                                )}
                                <View style={styles.cameraIcon}>
                                    <Ionicons name="camera" size={16} color="#fff" />
                                </View>
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.avatarHint}>
                            Toque na foto para alterá-la{'\n'}(máximo 2MB)
                        </Text>
                    </View>
                </View>

                {/* Dados Pessoais */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dados Pessoais</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nome completo *</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Seu nome completo"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            value={userData?.email || ''}
                            editable={false}
                            placeholderTextColor="#999"
                        />
                        <Text style={styles.hint}>O email não pode ser alterado</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>CPF/CNPJ</Text>
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            value={userData?.cpfCnpj || ''}
                            editable={false}
                            placeholderTextColor="#999"
                        />
                        <Text style={styles.hint}>O CPF/CNPJ não pode ser alterado</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Telefone</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="(11) 98765-4321"
                            placeholderTextColor="#999"
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                {/* Endereço */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Endereço</Text>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 2 }]}>
                            <Text style={styles.label}>Rua/Avenida</Text>
                            <TextInput
                                style={styles.input}
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Rua, avenida..."
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                            <Text style={styles.label}>Número</Text>
                            <TextInput
                                style={styles.input}
                                value={addressNumber}
                                onChangeText={setAddressNumber}
                                placeholder="123"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Complemento</Text>
                        <TextInput
                            style={styles.input}
                            value={complement}
                            onChangeText={setComplement}
                            placeholder="Apto, bloco..."
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 2 }]}>
                            <Text style={styles.label}>Cidade</Text>
                            <TextInput
                                style={styles.input}
                                value={city}
                                onChangeText={setCity}
                                placeholder="São Paulo"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                            <Text style={styles.label}>Estado</Text>
                            <TextInput
                                style={styles.input}
                                value={state}
                                onChangeText={setState}
                                placeholder="SP"
                                placeholderTextColor="#999"
                                maxLength={2}
                                autoCapitalize="characters"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>CEP</Text>
                        <TextInput
                            style={styles.input}
                            value={cep}
                            onChangeText={setCep}
                            placeholder="12345-678"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            maxLength={9}
                        />
                    </View>
                </View>

                {/* Bio */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sobre você</Text>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Descrição</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Conte um pouco sobre você..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                {/* Dados Bancários - Apenas para Vendedores */}
                {userData?.userType === 'Vendedor' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Dados Bancários</Text>
                        <Text style={styles.sectionSubtitle}>
                            Para recebimento de pagamentos
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Banco</Text>
                            <TextInput
                                style={styles.input}
                                value={bank}
                                onChangeText={setBank}
                                placeholder="Nome do banco"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Agência</Text>
                                <TextInput
                                    style={styles.input}
                                    value={agency}
                                    onChangeText={setAgency}
                                    placeholder="1234-5"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                                <Text style={styles.label}>Conta</Text>
                                <TextInput
                                    style={styles.input}
                                    value={account}
                                    onChangeText={setAccount}
                                    placeholder="67890-1"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tipo de conta</Text>
                            <View style={styles.accountTypeContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.accountTypeButton,
                                        accountType === 'Corrente' && styles.accountTypeButtonActive
                                    ]}
                                    onPress={() => setAccountType('Corrente')}
                                >
                                    <Text style={[
                                        styles.accountTypeText,
                                        accountType === 'Corrente' && styles.accountTypeTextActive
                                    ]}>
                                        Corrente
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.accountTypeButton,
                                        accountType === 'Poupança' && styles.accountTypeButtonActive
                                    ]}
                                    onPress={() => setAccountType('Poupança')}
                                >
                                    <Text style={[
                                        styles.accountTypeText,
                                        accountType === 'Poupança' && styles.accountTypeTextActive
                                    ]}>
                                        Poupança
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {/* Senha */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Segurança</Text>
                    <TouchableOpacity
                        style={styles.passwordButton}
                        onPress={handlePasswordReset}
                    >
                        <Ionicons name="key-outline" size={20} color="#f98000" />
                        <Text style={styles.passwordButtonText}>Alterar senha</Text>
                        <Ionicons name="chevron-forward-outline" size={20} color="#999" />
                    </TouchableOpacity>
                    <Text style={styles.hint}>
                        Você receberá um email com instruções para redefinir sua senha
                    </Text>
                </View>

                {/* Botão Salvar */}
                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>SALVAR ALTERAÇÕES</Text>
                    )}
                </TouchableOpacity>

                <View style={{ height: 20 }} />
            </ScrollView>

            <Toast
                message={toastMessage}
                type={toastType}
                visible={toastVisible}
                onHide={() => setToastVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
        fontFamily: 'Montserrat Bold',
    },
    sectionSubtitle: {
        fontSize: 12,
        color: '#666',
        marginBottom: 15,
        fontFamily: 'Montserrat',
    },
    avatarSection: {
        alignItems: 'center',
        marginTop: 10,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f0f0f0',
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#f98000',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    avatarHint: {
        fontSize: 11,
        color: '#888',
        marginTop: 10,
        textAlign: 'center',
        fontFamily: 'Montserrat',
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#555',
        marginBottom: 6,
        fontFamily: 'Montserrat SemiBold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#333',
        backgroundColor: '#fff',
        fontFamily: 'Montserrat',
    },
    inputDisabled: {
        backgroundColor: '#f5f5f5',
        color: '#999',
    },
    textArea: {
        height: 100,
        paddingTop: 10,
    },
    hint: {
        fontSize: 11,
        color: '#888',
        marginTop: 4,
        fontFamily: 'Montserrat',
    },
    row: {
        flexDirection: 'row',
    },
    accountTypeContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    accountTypeButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        alignItems: 'center',
    },
    accountTypeButtonActive: {
        backgroundColor: '#f98000',
        borderColor: '#f98000',
    },
    accountTypeText: {
        fontSize: 13,
        color: '#666',
        fontFamily: 'Montserrat',
    },
    accountTypeTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    passwordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        gap: 10,
        marginBottom: 8,
    },
    passwordButtonText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        fontFamily: 'Montserrat',
    },
    saveButton: {
        backgroundColor: '#f98000',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontFamily: 'Montserrat Bold',
    },
});
