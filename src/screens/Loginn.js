import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getData = async (email, password) => {
  const querySnapshot = await getDocs(collection(db, 'ReactNativeUsers'));
  let isValidUser = false;

  querySnapshot.forEach((doc) => {
    const userData = doc.data();
    if (userData.email === email && userData.password === password) {
      isValidUser = true;
    }
  });

  return isValidUser;
};

const Login = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    
    if (route.params?.email) {
      setEmail(route.params.email);
    } else {
     
      const checkUserLoggedIn = async () => {
        const storedEmail = await AsyncStorage.getItem('userEmail');
        if (storedEmail) {
          navigation.navigate('Coin', { email: storedEmail });
        }
      };
      checkUserLoggedIn();
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata!', 'Lütfen email ve şifre girin.');
      return;
    }

    const isValidUser = await getData(email, password);

    if (isValidUser) {
      await AsyncStorage.setItem('userEmail', email);
      navigation.navigate('Coin', { email: email });
    } else {
      Alert.alert('Giriş Yapılamadı!', 'E-mail ya da şifre doğru değil.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <FontAwesome name="envelope" size={20} color="#ccc" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
      </View>
      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color="#ccc" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={true}
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>
     
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Kaydol')}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    top: 150,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
  },
  button: {
    width: '80%',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#FFC107',
    alignItems: 'center',
    top: 160,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Login;
