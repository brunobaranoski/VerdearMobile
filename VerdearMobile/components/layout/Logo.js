import { Image, StyleSheet, View } from 'react-native';

const Logo = () => {
  return (
    <View style={styles.logoContainer}>
      <Image
        source={require('../../assets/images/Logo verdear.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  logo: {
    top: -20,
    width: 450,
    height: 250,
  },
});

export default Logo;
