import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    ScrollView,
    ImageBackground,
    TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../app/context/AuthContext";
import { router } from "expo-router";
import { Toast } from "../shared/Index";
import EditarCadastro from "./EditarCadastro";

const MenuItem = ({ iconName, text, onPress, isActive = false, isLogout = false }) => (
    <TouchableOpacity
        style={[styles.menuItem, isActive && styles.menuItemActive]}
        onPress={onPress}
    >
        {iconName ? (
            <Ionicons
                name={iconName}
                size={24}
                color={isLogout ? "#F44336" : (isActive ? "#f98000" : "#555")}
            />
        ) : (
            <View style={{width: 24}}/>
        )}
        <Text style={[
            styles.menuText,
            isActive && { color: "#f98000", fontWeight: "600" },
            isLogout && { color: "#F44336", fontWeight: "600" }
        ]}>
            {text}
        </Text>
        {!isLogout && <Ionicons name="chevron-forward-outline" size={20} color="#999" />}
    </TouchableOpacity>
);

const ProductCard = ({ item, updateProductField }) => {
    return (
        <View key={item.id} style={styles.productCard}>
            <ImageBackground
                source={{uri: 'https://i.imgur.com/J8iL34j.png'}}
                style={styles.cardImage}
                imageStyle={{borderTopLeftRadius: 8, borderTopRightRadius: 8}}
            >
                <View style={styles.cardOverlay}>
                    <TextInput
                        style={styles.cardNomeInput}
                        placeholder="NOME"
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                        value={item.nome}
                        onChangeText={(text) => updateProductField(item.id, 'nome', text)}
                    />
                    <TextInput
                        style={styles.cardDescricaoInput}
                        placeholder="Descrição"
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                        value={item.descricao}
                        onChangeText={(text) => updateProductField(item.id, 'descricao', text)}
                    />
                </View>
            </ImageBackground>
            <View style={styles.cardValuesSection}>
                <TextInput
                    style={styles.cardValorTextInput}
                    placeholder="Valores"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={item.valor}
                    onChangeText={(text) => updateProductField(item.id, 'valor', text)}
                />
            </View>
        </View>
    );
};

export default function PerfilVendedor() {
    const { user, userData, logout, loading } = useAuth();
    const [activeSection, setActiveSection] = useState('cadastrar-produtos');
    const [produtos, setProdutos] = useState([
        { id: "1", nome: "Produto 1", descricao: "Descrição do produto 1", valor: "R$ 10,00" },
        { id: "2", nome: "Produto 2", descricao: "Descrição do produto 2", valor: "R$ 20,00" },
        { id: "3", nome: "Produto 3", descricao: "Descrição do produto 3", valor: "R$ 30,00" },
    ]);

    // Estado do Toast
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('info');

    const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
        setToastMessage(message);
        setToastType(type);
        setToastVisible(true);
    };

    const handleLogout = async () => {
        try {
            await logout();
            showToast('Até logo! Você saiu da sua conta.', 'success');

            // Aguarda 1 segundo e redireciona para login
            setTimeout(() => {
                router.replace('/login');
            }, 1000);
        } catch (error: any) {
            showToast(error.message || 'Erro ao sair. Tente novamente.', 'error');
        }
    };

    const adicionarProduto = () => {
        const novoId = Date.now().toString();
        const novoProduto = {
            id: novoId,
            nome: "",
            descricao: "",
            valor: "",
        };
        setProdutos([...produtos, novoProduto]);
    };

    const updateProductField = (id, field, value) => {
        setProdutos(prevProdutos =>
            prevProdutos.map(produto =>
                produto.id === id ? { ...produto, [field]: value } : produto
            )
        );
    };

    const renderMainContent = () => {
        if (activeSection === 'alterar-cadastro') {
            return <EditarCadastro />;
        }

        if (activeSection === 'catalogo') {
            return (
                <View style={styles.mainContent}>
                    <View style={styles.mainHeader}>
                        <Ionicons name="grid-outline" size={24} color="#555" />
                        <Text style={styles.mainTitle}>Catálogo de produtos</Text>
                    </View>
                    <Text style={styles.emptyText}>Em desenvolvimento</Text>
                </View>
            );
        }

        if (activeSection === 'pedidos') {
            return (
                <View style={styles.mainContent}>
                    <View style={styles.mainHeader}>
                        <Ionicons name="cube-outline" size={24} color="#555" />
                        <Text style={styles.mainTitle}>Pedidos</Text>
                    </View>
                    <Text style={styles.emptyText}>Em desenvolvimento</Text>
                </View>
            );
        }

        // Cadastrar produtos (default)
        return (
            <>
                <View style={styles.mainHeader}>
                    <Ionicons name="document-text-outline" size={24} color="#555" />
                    <Text style={styles.mainTitle}>Cadastrar produtos</Text>
                </View>

                <ScrollView contentContainerStyle={styles.productsGrid} style={{flex: 1}}>
                    {produtos.map((item) => (
                        <ProductCard
                            key={item.id}
                            item={item}
                            updateProductField={updateProductField}
                        />
                    ))}

                    <TouchableOpacity style={styles.addCard} onPress={adicionarProduto}>
                        <Text style={styles.addCardPlus}>+</Text>
                    </TouchableOpacity>
                </ScrollView>

                <TouchableOpacity style={styles.submitButton}>
                    <Text style={styles.submitButtonText}>CADASTRAR PRODUTOS</Text>
                </TouchableOpacity>
            </>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.sidebar}>
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: userData?.avatar || "https://i.imgur.com/6aFj4OK.png" }}
                            style={styles.avatar}
                        />
                        <View style={styles.editIconWrapper}>
                            <Ionicons name="pencil" size={12} color="white" />
                        </View>
                    </View>
                    <Text style={styles.profileName}>{userData?.name || "Usuário"}</Text>
                    <Text style={styles.profileEmail}>{userData?.email || user?.email || ""}</Text>
                    <Text style={styles.profileRole}>{userData?.userType || "Vendedor"}</Text>
                </View>

                <View style={styles.configSection}>
                    <Text style={styles.configTitle}>Configurações</Text>
                </View>

                <ScrollView style={styles.menu} showsVerticalScrollIndicator={false}>
                    <MenuItem
                        iconName="cog-outline"
                        text="Alterar cadastro"
                        onPress={() => setActiveSection('alterar-cadastro')}
                        isActive={activeSection === 'alterar-cadastro'}
                    />
                    <MenuItem
                        iconName="grid-outline"
                        text="Catálogo de produtos"
                        onPress={() => setActiveSection('catalogo')}
                        isActive={activeSection === 'catalogo'}
                    />
                    <MenuItem
                        iconName="document-text-outline"
                        text="Cadastrar produtos"
                        onPress={() => setActiveSection('cadastrar-produtos')}
                        isActive={activeSection === 'cadastrar-produtos'}
                    />
                    <MenuItem
                        iconName="cube-outline"
                        text="Pedidos"
                        onPress={() => setActiveSection('pedidos')}
                        isActive={activeSection === 'pedidos'}
                    />

                    <View style={styles.menuDivider} />

                    <MenuItem
                        iconName="log-out-outline"
                        text={loading ? "Saindo..." : "Sair"}
                        onPress={handleLogout}
                        isLogout={true}
                    />
                </ScrollView>
            </View>

            <View style={styles.mainContent}>
                {renderMainContent()}
            </View>

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
        flexDirection: "row",
        backgroundColor: "#fff",
    },
    sidebar: {
        width: "40%",
        backgroundColor: "#FFFFFF",
        borderRightWidth: 1,
        borderRightColor: "#EFEFEF",
    },
    profileSection: {
        alignItems: "center",
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    avatarContainer: {
        position: "relative",
        marginBottom: 12,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#E0F2FF'
    },
    editIconWrapper: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#1E90FF",
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "white",
    },
    profileName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        textAlign: 'center'
    },
    profileEmail: {
        fontSize: 10,
        color: "#777",
        textAlign: 'center'
    },
    profileRole: {
        fontSize: 13,
        color: "#555",
        marginTop: 2,
    },
    configSection: {
        backgroundColor: '#F5F5F5',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    configTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#444'
    },
    menu: {
        flex: 1,
        marginTop: 10
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 15,
        gap: 12,
    },
    menuItemActive: {
        backgroundColor: '#FFF5E6',
        borderLeftWidth: 3,
        borderLeftColor: '#f98000',
    },
    menuText: {
        flex: 1,
        fontSize: 9,
        color: "#444",
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 10,
        marginHorizontal: 15,
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        fontSize: 14,
        marginTop: 40,
        fontFamily: 'Montserrat',
    },
    mainContent: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        padding: 20,
    },
    mainHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 25,
    },
    mainTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    productCard: {
        width: '47%',
        aspectRatio: 0.85,
        marginBottom: 20,
        borderRadius: 8,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#F0F0F0',
        overflow: 'hidden'
    },
    cardImage: {
        height: '65%',
        justifyContent: 'flex-end',
    },
    cardOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        padding: 10,
    },
    cardNomeInput: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
        padding: 0,
        margin: 0,
        marginBottom: 3,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    },
    cardDescricaoInput: {
        color: 'white',
        fontSize: 12,
        padding: 0,
        margin: 0,
    },
    cardValuesSection: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    cardValorTextInput: {
        color: '#888',
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
        width: '100%',
        paddingVertical: 5,
    },
    addCard: {
        width: '47%',
        aspectRatio: 0.85,
        marginBottom: 20,
        borderRadius: 8,
        backgroundColor: '#FAFAFA',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addCardPlus: {
        fontSize: 60,
        color: '#D0D0D0',
        fontWeight: '200',
    },
    submitButton: {
        backgroundColor: "#f98000",
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase'
    }
});
