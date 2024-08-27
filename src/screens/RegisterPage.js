import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { addDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import validator from 'validator';  // Email doğrulama için
import zxcvbn from 'zxcvbn';  // Şifre gücü kontrolü için

// Mevcut en yüksek ID'yi bulmak için fonksiyon
const getNextUserId = async () => {
  const usersCollection = collection(db, 'ReactNativeUsers');
  const q = query(usersCollection, orderBy('id', 'desc'), limit(1));

  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const highestIdDoc = querySnapshot.docs[0];
    const highestId = highestIdDoc.data().id;
    return highestId + 1;
  } else {
    return 1; // Eğer koleksiyon boşsa, ilk kullanıcıya 1 numaralı ID'yi ver
  }
};

// Firebase'e kullanıcıyı eklemek için fonksiyon
const sendData = async (email, password, namesurname) => {
  try {
    const newUserId = await getNextUserId();

    // Kullanıcıyı ekle
    const docRef = await addDoc(collection(db, 'ReactNativeUsers'), {
      id: newUserId,
      name: namesurname,
      email: email,
      password: password,
    });

    console.log('Document written with ID: ', docRef.id);

    // BankUser koleksiyonuna kullanıcı ekle
    const bankUserRef = await addDoc(collection(db, 'BankUser'), {
      kullanici: email,
      kasa: 10000.0,
    });

    console.log('BankUser document written with ID: ', bankUserRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};

const SignUp = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [namesurname, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    if (!email || !password || !namesurname || !confirmPassword) {
      Alert.alert('Hata!', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (!validator.isEmail(email)) {
      Alert.alert('Hata!', 'Geçersiz email adresi.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata!', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    const passwordStrength = zxcvbn(password);
    if (passwordStrength.score < 1) {
      Alert.alert('Hata!', 'Şifreniz çok zayıf. Daha güçlü bir şifre seçin.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata!', 'Şifreler eşleşmiyor.');
      return;
    }

    // Kullanıcı bilgilerini Firebase Firestore'a kaydet.
    await sendData(email, password, namesurname);

    Alert.alert('Başarılı!', 'Kayıt işlemi başarılı. Şimdi giriş yapabilirsiniz.');
    navigation.navigate('Loginsayfa');
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <FontAwesome name="user" size={20} color="#ccc" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Name-Surname"
          autoCapitalize="words" 
          value={namesurname}
          onChangeText={(text) => setName(text)}
        />
      </View>
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
      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color="#ccc" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
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
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SignUp;
