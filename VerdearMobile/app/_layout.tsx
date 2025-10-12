import { Stack } from "expo-router";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Previne que a splash screen seja escondida automaticamente
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Playfair Display': require('../assets/fonts/Playfair_Display/static/PlayfairDisplay-Regular.ttf'),
    'Playfair Display Bold': require('../assets/fonts/Playfair_Display/static/PlayfairDisplay-Bold.ttf'),
    'Playfair Display Italic': require('../assets/fonts/Playfair_Display/static/PlayfairDisplay-Italic.ttf'),
    'Montserrat': require('../assets/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat Bold': require('../assets/fonts/Montserrat/static/Montserrat-Bold.ttf'),
    'Montserrat SemiBold': require('../assets/fonts/Montserrat/static/Montserrat-SemiBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="cadastro" options={{ headerShown: false }} />
    </Stack>
  );
}
