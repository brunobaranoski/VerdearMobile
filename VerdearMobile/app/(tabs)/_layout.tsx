import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { ActivityIndicator, View } from "react-native";

export default function TabLayout() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Se terminou de carregar e não há usuário autenticado, redireciona para login
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading]);

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1B5E20" />
      </View>
    );
  }

  // Se não estiver autenticado, não renderiza as tabs (será redirecionado)
  if (!user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#fff",
        tabBarStyle: { backgroundColor: "#1B5E20" },
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          title: "Início",
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="compras"
        options={{
          title: "Compras",
          tabBarIcon: ({ color }) => <Ionicons name="cart-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
