import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const Tab = ({ label, isActive, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.tab, isActive ? styles.tabActive : styles.tabInactive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={isActive ? styles.textActive : styles.textInactive}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  tabInactive: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#C8C8C8',
  },
  tabActive: {
    backgroundColor: '#2C5F2D',
    borderWidth: 2,
    borderColor: '#2C5F2D',
  },
  textInactive: {
    color: '#666666',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Montserrat',
  },
  textActive: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Montserrat',
  },
});

export default Tab;