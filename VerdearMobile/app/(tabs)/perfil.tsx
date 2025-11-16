import React from "react";
import { View, Text, Image, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import PerfilComprador from "@/components/perfil/PerfilComprador";
import PerfilVendedor from "@/components/perfil/PerfilVendedor";

export default function PerfilScreen() {
    const { userData, loading } = useAuth();

    // Mostra loading enquanto carrega dados do usuário
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1B5E20" />
                <Text style={styles.loadingText}>Carregando perfil...</Text>
            </View>
        );
    }

    // Header comum para ambos os perfis
    const renderHeader = () => (
        <>
            <View style={styles.projectHeader}>
                <Image
                    source={require('../../assets/images/logo_verdear.png')}
                    style={styles.logo}
                />
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color="#777" />
                    <TextInput
                        style={styles.searchInput}
                        placeholderTextColor="#888"
                        placeholder="Buscar..."
                    />
                </View>
            </View>

            <View style={styles.header}>
                <Ionicons name="person-circle-outline" size={32} color="#fff" />
                <Text style={styles.headerTitle}>Minha conta</Text>
            </View>
        </>
    );

    // Determina qual perfil renderizar baseado no userType
    const userType = userData?.userType || 'Comprador';

    return (
        <View style={styles.screen}>
            {renderHeader()}
            {userType === 'Vendedor' ? <PerfilVendedor /> : <PerfilComprador />}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#fff",
    },
    projectHeader: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#215732",
        paddingHorizontal: 20,
        paddingVertical: 12,
        paddingTop: 45,
        gap: 15,
    },
    logo: {
        flex: 1.2,
        height: 60,
        resizeMode: "contain",
    },
    searchContainer: {
        flex: 2,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 25,
        paddingHorizontal: 15,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 8,
        paddingLeft: 5,
        fontSize: 14,
        color: '#333',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#f98000",
        paddingHorizontal: 20,
        paddingVertical: 15,
        gap: 10,
    },
    headerTitle: {
        color: "white",
        fontSize: 22,
        fontWeight: "bold",
        fontFamily: 'Playfair Display Bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
        fontFamily: 'Montserrat',
    },
});
