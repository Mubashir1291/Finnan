import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Routes from './src/routes/Routes';
// import { Provider } from 'react-redux';
// import { persistor, store } from './src/redux/store';
// import { PersistGate } from 'redux-persist/integration/react';
const App = () => {
  return (
    // <Provider store={store}>
    //   <PersistGate persistor={persistor}>
    <NavigationContainer>
      <Routes />
    </NavigationContainer>
    //   </PersistGate>
    // </Provider>
  );
};
export default App;
