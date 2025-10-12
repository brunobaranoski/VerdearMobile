import { StyleSheet, View } from 'react-native';
import Tab from '../ui/Tab';

const TabGroup = ({ options, activeTab, onChange }) => {
  return (
    <View style={styles.tabs}>
      {options.map((option) => (
        <Tab
          key={option}
          label={option}
          isActive={activeTab === option}
          onPress={() => onChange(option)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
});

export default TabGroup;