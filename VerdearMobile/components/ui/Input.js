import { StyleSheet, TextInput, View } from 'react-native';

const Input = ({ placeholder, type = 'text', ...props }) => {
  // O React Native não usa "type" como no HTML, mas "keyboardType"
  let keyboardType = 'default';
  if (type === 'email') keyboardType = 'email-address';
  if (type === 'number') keyboardType = 'numeric';

  return (
    <View style={styles.inputGroup}>
      <TextInput
        placeholder={placeholder}
        style={styles.input}
        keyboardType={keyboardType}
        placeholderTextColor="#999999"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 14,
    width: '100%',
  },
  input: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 28,
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Montserrat',
    backgroundColor: '#FFFFFF',
  },
});

export default Input;