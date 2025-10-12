import { Image, StyleSheet } from 'react-native';

const Decorations = ({ theme = 'login' }) => {
  const isCadastro = theme === 'cadastro';

  return (
    <>
      {/* Decoração esquerda - forma laranja para cadastro, verde para login */}
      <Image
        source={
          isCadastro
            ? require('../../assets/images/decoração laranja.png')
            : require('../../assets/images/decoração verde.png')
        }
        style={isCadastro ? styles.leftDecorationCadastro : styles.leftDecoration}
        resizeMode="contain"
      />

      {/* Decoração inferior direita - apenas a folha aparecendo */}
      <Image
        source={require('../../assets/images/Icone verdear color.png')}
        style={styles.rightDecoration}
        resizeMode="contain"
      />
    </>
  );
};

const styles = StyleSheet.create({
  // Decoração esquerda para LOGIN (verde)
  leftDecoration: {
    position: 'absolute',
    left: -300,
    top: 35,
    width: 600,
    height: 800,
    opacity: 1,
  },
  // Decoração esquerda para CADASTRO (laranja)
  leftDecorationCadastro: {
    position: 'absolute',
    left: -320,
    top: -25,
    width: 650,
    height: 850,
    opacity: 1,
  },
  // Decoração direita (folha) - mesma para ambos
  rightDecoration: {
    position: 'absolute',
    right: -480,
    bottom: -235,
    width: 1000,
    height: 600,
    opacity: 1,
    transform: [{ rotate: '47deg' }],
  },
});

export default Decorations;
