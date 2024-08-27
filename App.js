import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './src/screens/Loginn';
import SignUp from './src/screens/RegisterPage';
import CoinDrawerNavigator from './DrawerNavigator';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Loginsayfa" component={Login} />
        <Stack.Screen name="Coin" component={CoinDrawerNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Kaydol" component={SignUp} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
