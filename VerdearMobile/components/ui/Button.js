import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const Button = ({ children, onPress, variant = 'primary' }) => {
  return (
    <TouchableOpacity
      style={[
        variant === 'primary' ? styles.primary : styles.secondary,
        styles.button,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={variant === 'primary' ? styles.primaryText : styles.secondaryText}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 10,
    width: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  primary: {
    backgroundColor: '#FF7B00',
  },
  secondary: {
    backgroundColor: 'transparent',
  },
  primaryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  secondaryText: {
    color: '#2C5F2D',
    fontSize: 16,
    fontFamily: 'Montserrat',
  },
});

export default Button;