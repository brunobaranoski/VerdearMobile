// PerfilVendedor.tsx  — versão ajustada COMPLETA

import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../app/context/AuthContext";
import { db } from "../../app/firebase";

import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import EditarCadastro from "../../components/perfil/EditarCadastro";
import { Toast } from "../../components/shared/Index";

/* -------------------------------------------
   CARD DO PRODUTO (COMPONENTE INTERNO)
----------------------------------------------*/
const ProductCard = ({ item, updateField, onPickImage, onDelete }) => {
  return (
    <View style={styles.productCard}>
      <TouchableOpacity
        style={styles.productImageBox}
        onPress={() => onPickImage(item.id)}
      >
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.productImage} />
        ) : (
          <View style={styles.noImageBox}>
            <Ionicons name="image-outline" size={30} color="#aaa" />
            <Text style={{ color: "#777", marginTop: 5 }}>Adicionar imagem</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <TextInput
          placeholder="Nome do produto"
          placeholderTextColor="#888"
          value={item.nome}
          style={styles.input}
          onChangeText={(t) => updateField(item.id, "nome", t)}
        />

        <TextInput
          placeholder="Descrição"
          placeholderTextColor="#888"
          value={item.descricao}
          style={[styles.input, { height: 60 }]}
          multiline
          onChangeText={(t) => updateField(item.id, "descricao", t)}
        />

        <TextInput
          placeholder="Valor"
          placeholderTextColor="#888"
          value={item.valor}
          style={styles.input}
          keyboardType="numeric"
          onChangeText={(t) => updateField(item.id, "valor", t)}
        />
      </View>

      <TouchableOpacity onPress={() => onDelete(item.id)}>
        <Ionicons name="trash" size={26} color="#c00" />
      </TouchableOpacity>
    </View>
  );
};

/* -------------------------------------------
   COMPONENTE PRINCIPAL
----------------------------------------------*/
export default function PerfilVendedor() {
  const { user, userData, logout, loading } = useAuth();
  const sellerId = user?.uid ?? userData?.uid ?? null;

  const [activeSection, setActiveSection] = useState("produtos");

  const [produtos, setProdutos] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");

  const showToast = (msg, type = "info") => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  /* -------------------------------------------
      CARREGAR PRODUTOS DO FIRESTORE
  ----------------------------------------------*/
  const loadProductsFromFirebase = useCallback(async () => {
    try {
      if (!sellerId) return;

      const productsCol = collection(db, "products");
      const qProducts = query(productsCol, where("sellerId", "==", sellerId));

      const snap = await getDocs(qProducts);

      const list = snap.docs.map((d) => ({
        id: d.id,
        nome: d.data().name ?? "",
        descricao: d.data().description ?? "",
        valor: String(d.data().price ?? ""),
        image: d.data().image ?? null,
      }));

      setCatalogProducts(list);
      setProdutos(list.length ? list : []);
    } catch (err) {
      showToast("Erro ao carregar produtos.", "error");
    }
  }, [sellerId]);

  useEffect(() => {
    if (sellerId) loadProductsFromFirebase();
  }, [sellerId]);

  /* -------------------------------------------
      ATUALIZAR OU CRIAR PRODUTOS
  ----------------------------------------------*/
  const saveProducts = async () => {
    if (!sellerId) return showToast("Usuário não identificado!", "error");

    const valid = produtos.filter(
      (p) => p.nome.trim() || p.valor.trim() || p.image
    );

    if (!valid.length) return showToast("Nenhum produto válido!", "warning");

    const existingIds = new Set(catalogProducts.map((p) => p.id));

    await Promise.all(
      valid.map(async (p) => {
        const priceNum = Number(p.valor.replace(",", ".")) || 0;

        const productData = {
          name: p.nome.trim(),
          description: p.descricao.trim(),
          price: priceNum,
          image: p.image || null,
          sellerId,
          updatedAt: serverTimestamp(),
        };

        if (existingIds.has(p.id)) {
          await updateDoc(doc(db, "products", p.id), productData);
        } else {
          await addDoc(collection(db, "products"), {
            ...productData,
            createdAt: serverTimestamp(),
          });
        }
      })
    );

    showToast("Produtos salvos!", "success");
    loadProductsFromFirebase();
  };

  /* -------------------------------------------
      EXCLUIR PRODUTO
  ----------------------------------------------*/
  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));

    setCatalogProducts((prev) => prev.filter((p) => p.id !== id));
    setProdutos((prev) => prev.filter((p) => p.id !== id));

    showToast("Produto removido!", "success");
  };

  /* -------------------------------------------
      PICK IMAGE
  ----------------------------------------------*/
  const pickImage = async (id) => {
    showToast("Escolher imagem não implementado aqui.", "info");
  };

  /* -------------------------------------------
      ATUALIZAR CAMPOS
  ----------------------------------------------*/
  const updateField = (id, field, value) => {
    setProdutos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  /* -------------------------------------------
      RENDER DO CONTEÚDO PRINCIPAL
  ----------------------------------------------*/
  const renderMainContent = () => {
    // ALTERAR CADASTRO
    if (activeSection === "alterar-cadastro") {
      return <EditarCadastro />;
    }

    // GERENCIAR PRODUTOS
    return (
      <>
        <ScrollView contentContainerStyle={styles.productsGrid}>
          {produtos.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              updateField={updateField}
              onPickImage={pickImage}
              onDelete={deleteProduct}
            />
          ))}

          <TouchableOpacity
            style={styles.addCard}
            onPress={() =>
              setProdutos((prev) => [
                ...prev,
                {
                  id: String(Date.now()),
                  nome: "",
                  descricao: "",
                  valor: "",
                  image: null,
                },
              ])
            }
          >
            <Text style={styles.addCardPlus}>+</Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity style={styles.saveButton} onPress={saveProducts}>
          <Text style={styles.saveButtonText}>SALVAR</Text>
        </TouchableOpacity>
      </>
    );
  };

  /* -------------------------------------------
      MAIN RETURN
  ----------------------------------------------*/
  return (
    <View style={styles.container}>
      {/* ---------------------- SIDEBAR ---------------------- */}
      <View style={styles.sidebar}>
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: userData?.avatar || "https://i.imgur.com/6aFj4OK.png",
            }}
            style={styles.avatar}
          />

          <Text style={styles.profileName}>
            {userData?.name || "Vendedor"}
          </Text>
          <Text style={styles.profileEmail}>
            {userData?.email || user?.email}
          </Text>
          <Text style={styles.profileRole}>
            {userData?.userType || "Vendedor"}
          </Text>
        </View>

        <View style={styles.configSection}>
          <Text style={styles.configTitle}>Configurações</Text>
        </View>

        <ScrollView style={styles.menu}>
          <MenuItem
            iconName="grid-outline"
            text="Gerenciar produtos"
            isActive={activeSection === "produtos"}
            onPress={() => setActiveSection("produtos")}
          />

          <MenuItem
            iconName="cog-outline"
            text="Alterar cadastro"
            isActive={activeSection === "alterar-cadastro"}
            onPress={() => setActiveSection("alterar-cadastro")}
          />

          <View style={styles.menuDivider} />

          <MenuItem
            iconName="log-out-outline"
            text={loading ? "Saindo..." : "Sair"}
            isLogout
            onPress={logout}
          />
        </ScrollView>
      </View>

      {/* ---------------------- CONTEÚDO PRINCIPAL ---------------------- */}
      <View style={styles.mainContent}>{renderMainContent()}</View>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
}

/* -------------------------------------------
   MENU ITEM COMPONENT
----------------------------------------------*/
const MenuItem = ({ iconName, text, isActive, isLogout, onPress }) => (
  <TouchableOpacity
    style={[
      styles.menuItem,
      isActive && { backgroundColor: "#E4F2E7" },
      isLogout && { backgroundColor: "#FCE4E4" },
    ]}
    onPress={onPress}
  >
    <Ionicons
      name={iconName}
      size={20}
      color={isLogout ? "#c00" : isActive ? "#2B6E3F" : "#555"}
    />
    <Text
      style={[
        styles.menuItemText,
        isLogout && { color: "#c00" },
        isActive && { color: "#2B6E3F" },
      ]}
    >
      {text}
    </Text>
  </TouchableOpacity>
);

/* -------------------------------------------
   STYLES
----------------------------------------------*/
const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", backgroundColor: "#fff" },

  /* SIDEBAR */
  sidebar: {
    width: "35%",
    borderRightWidth: 1,
    borderRightColor: "#e5e5e5",
    backgroundColor: "#fff",
  },
  profileSection: { alignItems: "center", paddingVertical: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  profileName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  profileEmail: { fontSize: 12, color: "#777", marginTop: 2 },
  profileRole: { fontSize: 13, color: "#555", marginTop: 6 },

  configSection: {
    marginTop: 15,
    paddingLeft: 20,
  },
  configTitle: { fontSize: 12, fontWeight: "bold", color: "#333" },

  menu: { marginTop: 10 },
  menuDivider: {
    height: 1,
    backgroundColor: "#e6e6e6",
    marginVertical: 10,
    marginHorizontal: 15,
  },

  menuItem: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    gap: 12,
  },
  menuItemText: { fontSize: 14, color: "#444" },

  /* MAIN CONTENT */
  mainContent: { flex: 1, padding: 20 },

  /* PRODUCT GRID */
  productsGrid: {
    paddingBottom: 20,
  },
  productCard: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#FAFAFA",
    borderRadius: 10,
    marginBottom: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  productImageBox: {
    width: 80,
    height: 80,
    backgroundColor: "#F2F2F2",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  noImageBox: { justifyContent: "center", alignItems: "center" },
  productImage: { width: 80, height: 80, borderRadius: 10 },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },

  addCard: {
    width: "100%",
    height: 60,
    borderWidth: 2,
    borderColor: "#2B6E3F",
    borderRadius: 10,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  addCardPlus: { fontSize: 26, color: "#2B6E3F" },

  saveButton: {
    backgroundColor: "#2B6E3F",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  saveButtonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
