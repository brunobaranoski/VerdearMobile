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

// Componente de Item do Menu
const MenuItem = ({ iconName, text }) => (
  <TouchableOpacity style={styles.menuItem}>
    {iconName ? <Ionicons name={iconName} size={24} color="#555" /> : <View style={{width: 24}}/>}
    <Text style={styles.menuText}>{text}</Text> 
    <Ionicons name="chevron-forward-outline" size={20} color="#999" />
  </TouchableOpacity>
);

export default function TelaMinhaContaFinal() {
  const [produtos, setProdutos] = useState([
    { id: "1", nome: "NOME", descricao: "Descrição", valor: "Valores" },
    { id: "2", nome: "NOME", descricao: "Descrição", valor: "Valores" },
    { id: "3", nome: "NOME", descricao: "Descrição", valor: "Valores" },
  ]);

  const adicionarProduto = () => {
    const novoId = Date.now().toString();
    const novoProduto = {
      id: novoId,
      nome: "NOME",
      descricao: "Descrição",
      valor: "Valores",
    };
    setProdutos([...produtos, novoProduto]);
  };

  return (
    <View style={styles.screen}>
      {/* CABEÇALHO VERDE */}
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
          />
        </View>
      </View>

      {/* CABEÇALHO LARANJA */}
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={32} color="#fff" />
        <Text style={styles.headerTitle}>Minha conta</Text>
      </View>

      {/* CONTAINER PRINCIPAL (SIDEBAR + CONTEÚDO) */}
      <View style={styles.container}>
        {/* SIDEBAR (MENU LATERAL) */}
        <View style={styles.sidebar}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: "https://i.imgur.com/6aFj4OK.png" }}
                style={styles.avatar}
              />
              <View style={styles.editIconWrapper}>
                <Ionicons name="pencil" size={12} color="white" />
              </View>
            </View>
            <Text style={styles.profileName}>Fulano Fulano</Text>
            <Text style={styles.profileEmail}>hello@reallygreatsite.com</Text>
            <Text style={styles.profileRole}>Vendedor</Text>
          </View>

          <View style={styles.configSection}>
            <Text style={styles.configTitle}>Configurações</Text>
          </View>

          <View style={styles.menu}>
            <MenuItem iconName="cog-outline" text={"Alterar cadastro"} />
            <MenuItem iconName="grid-outline" text={"Catalogo de produtos"} />
            <MenuItem iconName="document-text-outline" text={"Cadastrar produtos"} />
            <MenuItem iconName="cube-outline" text="Pedidos" />
          </View>
        </View>

        {/* CONTEÚDO PRINCIPAL */}
        <View style={styles.mainContent}>
            <View style={styles.mainHeader}>
                <Ionicons name="document-text-outline" size={24} color="#555" />
                <Text style={styles.mainTitle}>Cadastrar produtos</Text>
            </View>
            
            <ScrollView contentContainerStyle={styles.productsGrid} style={{flex: 1}}>
                {produtos.map((item) => (
                    <View key={item.id} style={styles.productCard}>
                        <ImageBackground 
                            source={{uri: 'https://i.imgur.com/J8iL34j.png'}}
                            style={styles.cardImage}
                            imageStyle={{borderTopLeftRadius: 8, borderTopRightRadius: 8}}
                        >
                            <View style={styles.cardOverlay}>
                                <Text style={styles.cardNome}>{item.nome}</Text>
                                <Text style={styles.cardDescricao}>{item.descricao}</Text>
                            </View>
                        </ImageBackground>
                        <View style={styles.cardValuesSection}>
                            <Text style={styles.cardValorText}>{item.valor}</Text>
                        </View>
                    </View>
                ))}

                <TouchableOpacity style={styles.addCard} onPress={adicionarProduto}>
                    <Text style={styles.addCardPlus}>+</Text>
                </TouchableOpacity>

            </ScrollView>

            <TouchableOpacity style={styles.submitButton}>
                <Text style={styles.submitButtonText}>CADASTRAR PRODUTOS</Text>
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ESTILOS
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
  },
  container: {
    flex: 1,
    flexDirection: "row",
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
    fontSize: 12,
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
  menuText: {
    flex: 1,
    fontSize: 9,
    color: "#444",
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
  cardNome: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 14,
  },
  cardDescricao: {
      color: 'white',
      fontSize: 12,
  },
  cardValuesSection: {
      flex: 1,
      backgroundColor: '#F5F5F5',
      justifyContent: 'center',
      alignItems: 'center',
  },
  cardValorText: {
      color: '#888',
      fontSize: 12,
      fontWeight: '500'
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