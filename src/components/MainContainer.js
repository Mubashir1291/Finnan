import { StyleSheet } from 'react-native';
import { PrimaryColor } from '../utils/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const MainContainer = ({ children }) => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: 'center',

        backgroundColor: 'black',
        padding: 10,
        gap: 20,
      }}
    >
      {children}
    </SafeAreaView>
  );
};

export default MainContainer;

const styles = StyleSheet.create({});
