import { StyleSheet, View } from 'react-native';

const Content = ({ children }) => {
  return (
    <View style={styles.contentWrapper}>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 80,
  },
  content: {
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 10,
    width: '100%',
    maxWidth: 480,
    paddingHorizontal: 16,
  },
});

export default Content;
