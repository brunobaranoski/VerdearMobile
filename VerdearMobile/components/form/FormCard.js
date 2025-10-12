import { StyleSheet, Text, View } from 'react-native';
import TabGroup from './TabGroup';

const FormCard = ({ title, children, showTabs = false, activeTab = null, onTabChange = null }) => {
  return (
    <View style={styles.formCard}>
      <View style={styles.headerDefault}>
        <Text style={styles.title}>{title}</Text>
      </View>
      {showTabs && (
        <View style={styles.tabsContainer}>
          <TabGroup
            options={['Comprador', 'Vendedor']}
            activeTab={activeTab}
            onChange={onTabChange}
          />
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    padding: 30,
    // Sombras para iOS e Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    width: '85%',
    maxWidth: 420,
    alignSelf: 'center',
    marginTop: -20,
  },
  headerDefault: {
    marginBottom: 16,
  },
  tabsContainer: {
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  title: {
    color: '#2C5F2D',
    fontSize: 25,
    margin: 0,
    textAlign: 'left',
    fontFamily: 'Montserrat Bold',
    letterSpacing: -0.5,
  },
});

export default FormCard;