import React, { useEffect } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CoinPage from './src/screens/CoinPage';
import CoinViewPage from './src/screens/MyCoins';
import SalesPage from './src/screens/Sales';
import AIPage from './src/screens/AIPage';
import Icon from 'react-native-vector-icons/FontAwesome5'; 
import { useNavigation, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Drawer = createDrawerNavigator();

export default function CoinDrawerNavigator({ route }) {
  const { email } = route.params;
  const navigation = useNavigation();

  const handleLogout = async () => {
    // Logout yapmadan önce e-posta bilgisini al
    const storedEmail = await AsyncStorage.getItem('userEmail');

    // Kullanıcıyı Login sayfasına yönlendir ve e-posta bilgisini gönder
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Loginsayfa', params: { email: storedEmail } }],
      })
    );

    // E-posta bilgisini AsyncStorage'dan temizle
    await AsyncStorage.removeItem('userEmail');
  };

  return (
    <Drawer.Navigator initialRouteName="CoinPage">
      <Drawer.Screen
        name="Coin Page"
        component={CoinPage}
        initialParams={{ email: email }}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="bitcoin" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Portfolyo Page"
        component={CoinViewPage}
        initialParams={{ email: email }}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="file-contract" color={color} size={size} />
          ),
        }}
      />

 <Drawer.Screen
        name="Sales Page"
        component={SalesPage}
        initialParams={{ email: email }}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="chart-line" color={color} size={size} />
          ),
        }}
      /> 

      {/* <Drawer.Screen
        name="Btc News"
        component={BtcNews}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="newspaper" color={color} size={size} />
          ),
        }}
      /> */}

<Drawer.Screen
        name="AI Page"
        component={AIPage}
        initialParams={{ email: email }}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="brain" color={color} size={size} />
          ),
        }}
      /> 
      <Drawer.Screen
        name="Log Out"
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="sign-out-alt" color={color} size={size} />
          ),
          drawerLabel: 'Log Out',
        }}
      >
        {() => {
          useEffect(() => {
            handleLogout();
          }, []);

          return null;
        }}
      </Drawer.Screen>

   
      
    </Drawer.Navigator>
  );
}
