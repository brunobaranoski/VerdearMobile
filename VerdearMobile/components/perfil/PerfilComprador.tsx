import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../app/context/AuthContext";
import { router } from "expo-router";
import { Toast } from "../shared/Index";
import { db } from "../../app/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import EditarCadastro from "./EditarCadastro";

const MenuItem = ({ iconName, text, onPress, isActive = false, isLogout = false }) => (
    <TouchableOpacity
        style={[styles.menuItem, isActive && styles.menuItemActive]}
        onPress={onPress}
    >
        {iconName ? (
            <Ionicons
                name={iconName}
                size={20}
                color={isLogout ? "#F44336" : (isActive ? "#f98000" : "#555")}
            />
        ) : (
            <View style={{ width: 20 }} />
        )}
        <Text
            style={[
                styles.menuText,
                isActive && { color: "#f98000", fontWeight: "600" },
                isLogout && { color: "#F44336", fontWeight: "600" },
            ]}
        >
            {text}
        </Text>
        {!isLogout && (
            <Ionicons name="chevron-forward-outline" size={18} color="#999" />
        )}
    </TouchableOpacity>
);

const PurchaseCard = ({ purchase }) => (
    <View style={styles.purchaseCard}>
        <View style={styles.cardImageContainer}>
            <Image
                source={{
                    uri: purchase.productImage || "https://i.imgur.com/J8iL34j.png",
                }}
                style={styles.cardImage}
            />
            <View style={styles.cardTag}>
                <Text style={styles.cardTagText}>COMPRADO</Text>
            </View>
            <View style={styles.cardOverlay}>
                <Text style={styles.cardProductName}>{purchase.productName}</Text>
                <Text style={styles.cardProductDesc} numberOfLines={1}>
                    {purchase.quantity}x - {purchase.date}
                </Text>
            </View>
        </View>
        <View style={styles.cardPriceSection}>
            <Text style={styles.cardPriceText}>
                R$ {purchase.price?.toFixed(2)}
            </Text>
            <Ionicons name="pricetag-outline" size={16} color="#666" />
        </View>
    </View>
);

export default function PerfilComprador() {
    const { user, userData, logout, loading: authLoading } = useAuth();
    const [activeSection, setActiveSection] = useState<"historico" | "alterar-cadastro" | "avaliacoes">("historico");
    const [purchases, setPurchases] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Estado do Toast
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<
        "success" | "error" | "info" | "warning"
    >("info");

    const showToast = (
        message: string,
        type: "success" | "error" | "info" | "warning" = "info"
    ) => {
        setToastMessage(message);
        setToastType(type);
        setToastVisible(true);
    };

    // Buscar histórico de compras
    useEffect(() => {
        if (user && activeSection === "historico") {
            loadPurchases();
        }
    }, [user, activeSection]);

    const loadPurchases = async () => {
        try {
            setLoading(true);

            const q = query(
                collection(db, "orders"),
                where("userId", "==", user.uid),
                orderBy("timestamp", "desc")
            );

            const snap = await getDocs(q);

            const purchasesData = snap.docs.map((doc) => {
                const data: any = doc.data();

                return {
                    id: doc.id,
                    productName:
                        data.items?.map((i: any) => i.name).join(", ") || "Pedido",
                    productImage: data.items?.[0]?.image || null,
                    quantity: data.items?.reduce(
                        (acc: number, i: any) => acc + (i.quantity || 1),
                        1
                    ),
                    price: Number(data.total) || 0,
                    date: data.timestamp?.toDate
                        ? data.timestamp.toDate().toLocaleDateString("pt-BR")
                        : "Data desconhecida",
                };
            });

            setPurchases(purchasesData);
        } catch (error) {
            console.error("Erro ao carregar compras:", error);
            showToast("Erro ao carregar histórico de compras", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            showToast("Até logo! Você saiu da sua conta.", "success");
            setTimeout(() => {
                router.replace("/login");
            }, 1000);
        } catch (error: any) {
            showToast(error.message || "Erro ao sair. Tente novamente.", "error");
        }
    };

    const handleBuyAgain = () => {
        showToast("Funcionalidade em desenvolvimento", "info");
    };

    const renderMainContent = () => {
        if (activeSection === "historico") {
            return (
                <>
                    <View style={styles.mainHeader}>
                        <Ionicons name="time-outline" size={24} color="#555" />
                        <Text style={styles.mainTitle}>Histórico de compras</Text>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.purchasesGrid}
                        style={{ flex: 1 }}
                    >
                        {loading ? (
                            <Text style={styles.emptyText}>Carregando...</Text>
                        ) : purchases.length === 0 ? (
                            <Text style={styles.emptyText}>
                                Nenhuma compra realizada ainda
                            </Text>
                        ) : (
                            purchases.map((purchase) => (
                                <PurchaseCard key={purchase.id} purchase={purchase} />
                            ))
                        )}
                    </ScrollView>

                    <TouchableOpacity
                        style={styles.buyAgainButton}
                        onPress={handleBuyAgain}
                    >
                        <Text style={styles.buyAgainButtonText}>
                            COMPRAR ITENS NOVAMENTE
                        </Text>
                    </TouchableOpacity>
                </>
            );
        }

        if (activeSection === "alterar-cadastro") {
            // 🔥 agora passamos onClose para voltar pro histórico depois de salvar
            return (
                <EditarCadastro onClose={() => setActiveSection("historico")} />
            );
        }

        if (activeSection === "avaliacoes") {
            return (
                <View style={styles.mainContent}>
                    <View style={styles.mainHeader}>
                        <Ionicons name="star-outline" size={24} color="#555" />
                        <Text style={styles.mainTitle}>Avaliações feitas</Text>
                    </View>
                    <Text style={styles.emptyText}>Em desenvolvimento</Text>
                </View>
            );
        }

        return null;
    };

    return (
        <View style={styles.container}>
            <View style={styles.sidebar}>
                <View className="profileSection" style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{
                                uri:
                                    userData?.avatar ||
                                    "https://i.imgur.com/6aFj4OK.png",
                            }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity
                            style={styles.editIconWrapper}
                            // 🔥 Abre diretamente a tela de Alterar cadastro
                            onPress={() => setActiveSection("alterar-cadastro")}
                        >
                            <Ionicons name="pencil" size={12} color="white" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.profileName}>
                        {userData?.name || "Usuário"}
                    </Text>
                    <Text style={styles.profileEmail}>
                        {userData?.email || user?.email || ""}
                    </Text>
                    <Text style={styles.profileRole}>
                        {userData?.userType || "Comprador"}
                    </Text>
                </View>

                <View style={styles.configSection}>
                    <Text style={styles.configTitle}>Configurações</Text>
                </View>

                <ScrollView
                    style={styles.menu}
                    showsVerticalScrollIndicator={false}
                >
                    <MenuItem
                        iconName="cog-outline"
                        text="Alterar cadastro"
                        onPress={() => setActiveSection("alterar-cadastro")}
                        isActive={activeSection === "alterar-cadastro"}
                    />
                    <MenuItem
                        iconName="time-outline"
                        text="Histórico de compras"
                        onPress={() => setActiveSection("historico")}
                        isActive={activeSection === "historico"}
                    />
                    <MenuItem
                        iconName="star-outline"
                        text="Avaliações feitas"
                        onPress={() => setActiveSection("avaliacoes")}
                        isActive={activeSection === "avaliacoes"}
                    />

                    <View style={styles.menuDivider} />

                    <MenuItem
                        iconName="log-out-outline"
                        text={authLoading ? "Saindo..." : "Sair"}
                        onPress={handleLogout}
                        isLogout={true}
                    />
                </ScrollView>
            </View>

            <View style={styles.mainContent}>{renderMainContent()}</View>

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
        width: "35%",
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
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#E0F2FF",
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
        fontSize: 15,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        fontFamily: "Montserrat Bold",
    },
    profileEmail: {
        fontSize: 9,
        color: "#777",
        textAlign: "center",
        marginTop: 2,
        fontFamily: "Montserrat",
    },
    profileRole: {
        fontSize: 12,
        color: "#555",
        marginTop: 4,
        fontFamily: "Montserrat",
    },
    configSection: {
        backgroundColor: "#F5F5F5",
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    configTitle: {
        fontWeight: "bold",
        fontSize: 14,
        color: "#444",
        fontFamily: "Montserrat Bold",
    },
    menu: {
        flex: 1,
        marginTop: 5,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 15,
        gap: 10,
    },
    menuItemActive: {
        backgroundColor: "#FFF5E6",
        borderLeftWidth: 3,
        borderLeftColor: "#f98000",
    },
    menuText: {
        flex: 1,
        fontSize: 11,
        color: "#444",
        fontFamily: "Montserrat",
    },
    menuDivider: {
        height: 1,
        backgroundColor: "#E0E0E0",
        marginVertical: 10,
        marginHorizontal: 15,
    },
    mainContent: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        padding: 20,
    },
    mainHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 20,
    },
    mainTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        fontFamily: "Playfair Display Bold",
    },
    purchasesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingBottom: 20,
    },
    purchaseCard: {
        width: "48%",
        marginBottom: 15,
        borderRadius: 8,
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E5E5E5",
        overflow: "hidden",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardImageContainer: {
        height: 140,
        position: "relative",
    },
    cardImage: {
        width: "100%",
        height: "100%",
        backgroundColor: "#2C5F2D",
    },
    cardTag: {
        position: "absolute",
        top: 8,
        left: 0,
        backgroundColor: "#f98000",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
    },
    cardTagText: {
        color: "#FFF",
        fontSize: 9,
        fontWeight: "bold",
        fontFamily: "Montserrat Bold",
    },
    cardOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        padding: 10,
    },
    cardProductName: {
        color: "#FFF",
        fontSize: 13,
        fontWeight: "bold",
        fontFamily: "Montserrat Bold",
        marginBottom: 2,
    },
    cardProductDesc: {
        color: "#FFF",
        fontSize: 10,
        fontFamily: "Montserrat",
    },
    cardPriceSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        backgroundColor: "#F8F8F8",
    },
    cardPriceText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#f98000",
        fontFamily: "Montserrat SemiBold",
    },
    emptyText: {
        textAlign: "center",
        color: "#888",
        fontSize: 14,
        marginTop: 40,
        fontFamily: "Montserrat",
    },
    buyAgainButton: {
        backgroundColor: "#f98000",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    buyAgainButtonText: {
        color: "white",
        fontSize: 13,
        fontWeight: "bold",
        textTransform: "uppercase",
        fontFamily: "Montserrat Bold",
    },
});
